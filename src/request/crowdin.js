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

        next();
    }

    // Crowdin webhooks
    app.get('/crowdin/translated/:urlsecret/:channel/', check, (req, res, next) => {
        res.json({
            success: false,
            message: 'WIP'
        });
    });

    app.get('/crowdin/completed/:urlsecret/:channel/', check, (req, res, next) => {
        res.json({
            success: false,
            message: 'WIP'
        });
    });
}