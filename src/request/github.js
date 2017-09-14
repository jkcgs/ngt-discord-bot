const GithubEvents = require('../event/github');
const crypto = require('crypto');
const config = require('../../config.json');
const log = require('../logger');
module.exports = handler;

/**
 * Sets up the express server to handle requests
 * 
 * @param {any} app The Express server app
 * @param {any} bot The Discord Client object
 */
function handler(app, bot) {
    let events = new GithubEvents(bot);

    // Loads the payload url for webhooks
    app.post('/payload/', (req, res, next) => {
        let event = req.get('X-GitHub-Event');
        let sig = req.get('X-Hub-Signature');

        // Validate request signature
        let hmac = crypto.createHmac('sha1', config.secret);
        hmac.update(req.rawBody);
        let dig = 'sha1=' + hmac.digest('hex');

        if(sig !== dig) {
            res.status(401);
            return res.json({
                success: false,
                message: 'Could not verify the request (Wrong secret?)'
            });
        }

        // Checks if event is implemented
        if(typeof events[event] !== 'function') {
            log.warn('Received non-implemented event ' + event);
            res.status(401);
            return res.json({
                success: false,
                message: 'Event not implemented'
            });
        }

        let chanId = req.params.channel;
        let repo = req.body.repository['full_name'];
        let evName = req.get('X-GitHub-Event');

        // Repo not configured
        if(!config.repos.hasOwnProperty(repo)) {
            log.warn('Received non-configured repository ' + repo);
            res.status(401);
            return res.json({
                success: false,
                message: 'Invalid repository'
            });
        }

        let repoCfg = config.repos[repo];

        // Check if the branch is on the config
        let branches = repoCfg.branches;
        let branchOk = false;
        for(let i = 0; i < branches.length; i++) {
            let branch = branches[i];
            
            if(req.body.ref === ('refs/heads/' + branch)) {
                branchOk = true;
                break;
            }
        }

        // Check if branch has passed the test
        if(!branchOk) {
            let reqBranch = req.body.ref.replace('refs/heads/', '');
            //log.warn('Received non-configured branch ' + reqBranch);
            res.status(401);
            return res.json({
                success: false,
                message: 'Invalid branch'
            });
        }

        // Check if event is allowed
        let allowedEvs = repoCfg.events || ['*'];
        if(allowedEvs.indexOf('*') === -1 && allowedEvs.indexOf(evName) === -1) {
            return res.json({
                success: false,
                message: 'Event not allowed'
            });
        }

        let channels = repoCfg.channels;
        let filters = repoCfg.hasOwnProperty('filters') ? repoCfg.filters : [];
        for(let chanId of channels) {
            let chan = bot.getChannel(chanId);
            if(!chan) {
                log.warn(`Received a channel target where the bot is not in: ${chanId}`);
                continue;
            }

            let channelFilters = filters.hasOwnProperty(chanId) ? filters[chanId] : [];
            let filterCommit = false;
            for(var filter of channelFilters) {
                let rx = (new RegExp(filter, 'g')).compile();
                if(filter.match(new RegExp(filter, 'g'))) {
                    filterCommit = true;
                    break;
                }
            }
            
            if(filterCommit) {
                continue;
            }

            // Log some info
            let cn = chan.name;
            let sn = chan.guild.name;
            log.info(`${repo} -> "${evName}" -> #${cn}@"${sn}"`);
    
            // Fire the event and send the message result
            // to the channel
            let response = events[event](req.body, chanId);
            if(typeof response === 'string' && response.trim !== '') {
                chan.sendMessage(response);
            }
            if(typeof response === 'object') {
                chan.sendEmbed(response);
            }
        }

        // Give an OK response to the request
        res.json({
            success: true
        });
    });
}
