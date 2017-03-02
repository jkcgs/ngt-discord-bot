const config = require('../config.json');
const Discord = require('discord.js');

/**
 * Implements GitHub events from webhook and returns some nice message
 * or embed to send it to the desired channel
 * 
 * @class Events
 */
class Events {
    constructor(bot) {
        this.bot = bot;
    }

    ping(data, channel) {
        return 'Ping received for repo ' + data.repository['full_name'];
    }

    push(data) {
        const repo = data.repository['full_name'];
        const branch = data.ref.split('/')[2];

        // Branch filter
        let branches = config.repos[repo].branches || ['*'];
        if(branches.indexOf('*') === -1 && branches.indexOf(branch) === -1) {
            return;
        }

        // This thing comes from here:
        // https://github.com/Falconerd/discord-bot-github/blob/d569b0ac9afea4df1537d31f87b403423ea08660/src/events.js
        // Soon to be deleted
        if (data.commits.length === 1) {
            let commit = data.commits[0];
            let hash = commit.id.substr(0, 7);
            const embed = new Discord.RichEmbed()
                .setTitle(`Pushed commit to ${repo}@${branch}`)
                .setAuthor(commit.author.username, data.sender['avatar_url'])
                .setDescription(`[${hash}](${commit.url}) ${commit.message}`)
                .setURL(commit.url);
            return embed;
        } else {
            let same = true;
            let firstAuthor = data.commits[0].author.username;
            for(let commit of data.commits) {
                if(firstAuthor !== commit.author.username) {
                    same = false;
                    break;
                }
            }

            if(same) {
                let desc = [];
                for(let commit of data.commits) {
                    let hash = commit.id.substr(0, 7);
                    desc.push(`[${hash}](${commit.url}) ${commit.message}`);
                }

                const embed = new Discord.RichEmbed()
                    .setAuthor(data.commits[0].author.username, data.sender['avatar_url'])
                    .setTitle(`Pushed ${data.commits.length} commits to ${repo}@${branch}`)
                    .setDescription(desc.join('\n'));
                return embed;
            } else {
                let desc = [];
                for(let commit of data.commits) {
                    let hash = commit.id.substr(0, 7);
                    desc.push(`[${hash}](${commit.url}) ${commit.message} - ${commit.author.username}`);
                }

                const embed = new Discord.RichEmbed()
                    .setTitle(`${data.commits.length} commits pushed to ${repo}@${branch}`)
                    .setDescription(desc.join('\n'));
                return embed;
            }
        }
    }
}

module.exports = Events;