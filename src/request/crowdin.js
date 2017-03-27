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
    // Crowdin webhooks
    app.get('/crowdin/translated/:urlsecret/:channel/', (req, res, next) => {
        res.json({
            success: false,
            message: 'WIP'
        });
    });

    app.get('/crowdin/completed/:urlsecret/:channel/', (req, res, next) => {
        res.json({
            success: false,
            message: 'WIP'
        });
    });
}