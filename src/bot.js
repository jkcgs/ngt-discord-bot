const Discord = require('discord.js');
const bot = new Discord.Client();
const log = require('./logger');
const config = require('../config.json');

bot.login(config.token)
    .then(log.info('Logged in.'))
    .catch(error => log.error(error));

// Get the channel object by ID
bot.getChannel = function (id) {
    for (let [key, value] of bot.channels) {
        if (id === key) {
            return value;
        }
    }

    return null;
};

module.exports = bot;