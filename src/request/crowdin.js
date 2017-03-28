const config = require('../../config.json');
const langs = require('./crowdin-langs.json');
const log = require('../logger');
module.exports = handler;

/**
 * Sets up the express server to handle requests
 * 
 * @param {any} app The Express server app
 * @param {any} bot The Discord Client object
 */
function handler(app, bot) {
    // Crowdin webhooks
    app.get('/crowdin/translated/:urlsecret/:channel/', check, (req, res) => {
        receiver(false, req, res);
    });

    app.get('/crowdin/completed/:urlsecret/:channel/', check, (req, res) => {
        receiver(true, req, res);
    });

    function check(req, res, next) {
        let chanId = req.params.channel;
        let secret = req.params.urlsecret;

        if(secret !== config.urlsecret) {
            log.warn(`Wrong secret used for crowdin webhook`);
            res.status(401);
            return res.json({
                success: false,
                message: 'Wrong secret'
            });
        }

        // Not in channel
        let chan = bot.getChannel(chanId);
        if (!chan) {
            log.warn(`Received a channel target where the bot is not in: ${chanId}`);
            res.status(400);
            return res.json({
                success: false,
                message: 'I\'m not on the target channel'
            });
        }

        if (!req.query.project) {
            res.status(400);
            return res.json({
                success: false,
                message: 'Project identifier not sent'
            });
        }

        if (!req.query.language) {
            res.status(400);
            return res.json({
                success: false,
                message: 'Language not sent'
            });
        }

        // Invalid project
        if (!config.crowdinProjects.hasOwnProperty(req.query.project)) {
            log.warn(`Received an invalid project`);
            res.status(400);
            return res.json({
                success: false,
                message: 'Invalid project'
            });
        }

        // Unrecognized language
        if(!langs.hasOwnProperty(req.query.language)) {
            log.warn(`Received an invalid language`);
            res.status(400);
            return res.json({
                success: false,
                message: 'Unrecognized language'
            });
        }

        next();
    }

    /**
     * Receives the webhook request for both translated and completed requests
     * 
     * @param {boolean} completed Completed or translated (true or false respectively)
     * @param {Express.Request} req Express request (yup, really)
     * @param {Express.Response} res Express response (yes)
     */
    function receiver(completed, req, res) {
        let projectName = config.crowdinProjects[req.query.project];
        let langSplit = langs[req.query.language].split('|');
        let message = `${projectName}: ${langSplit[0]}`;

        if (langSplit.length > 1) {
            message += ` :${langSplit[1]}:`;
        }

        message += completed ? 
            ' is now **completed and verified**!' :
            ' is now **fully translated**! Time to proofread!';

        let chan = bot.getChannel(req.params.channel);
        chan.sendMessage(message);
        
        res.json({ success: true });
    }
}