const Events = require('./events');
const crypto = require('crypto');
const config = require('../config.json');
module.exports = handler;

/**
 * Sets up the express server to handle requests
 * 
 * @param {any} app The Express server app
 * @param {any} bot The Discord Client object
 */
function handler(app, bot) {
    let events = new Events(bot);

    // Just the root
    app.get('/', (req, res) => {
        res.json({
            success: true,
            message: 'Hello!'
        });
    });

    // Loads the payload url for webhooks
    app.post('/payload/:channel/', (req, res, next) => {
        let event = req.get('X-GitHub-Event');
        let sig = req.get('X-Hub-Signature');

        // Validate request signature
        let hmac = crypto.createHmac('sha1', config.secret);
        hmac.update(req.rawBody);
        let dig = 'sha1=' + hmac.digest('hex');

        if(sig !== dig) {
            res.status(401);
            return res.json({
                success: false
            });
        }

        // Checks if event is implemented
        if(typeof events[event] !== 'function') {
            return res.json({
                success: false
            });
        }

        let chanId = req.params.channel;
        let repo = req.body.repository['full_name'];
        let evName = req.get('X-GitHub-Event');

        // Repo not configured
        if(!config.repos.hasOwnProperty(repo)) {
            return res.json({ success: false });
        }

        // Not in channel
        let chan = getChannel(chanId);
        if(!chan) {
            return res.json({ success: false });
        }

        // Check if event is allowed
        let allowedEvs = config.repos[repo].events || ['*'];
        if(allowedEvs.indexOf('*') === -1 && allowedEvs.indexOf(evName) === -1) {
            res.json({
                success: false
            });
        }

        // Log some info
        let cn = chan.name;
        let sn = chan.guild.name;
        console.log(`Firing event "${evName}" for #${cn}@"${sn}"`);

        // Give an OK response to the request
        res.json({
            success: true
        });

        // Fire the event and send the message result
        // to the channel
        let response = events[event](req.body, chanId);
        if(typeof response === 'string' && response.trim !== '') {
            chan.sendMessage(response);
        }
        if(typeof response === 'object') {
            chan.sendEmbed(response);
        }
    });
    
    // Get the channel object by ID
    bot.getChannel = getChannel;
    function getChannel(id) {
        for (let [key, value] of bot.channels) {
            if(id === key) {
                return value;
            }
        }

        return null;
    }
}