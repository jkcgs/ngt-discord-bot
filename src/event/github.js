const config = require('../../config.json');
const Discord = require('discord.js');

/**
 * Implements GitHub events from webhook and returns some nice message
 * or embed to send it to the desired channel
 * 
 * @class Events
 */
class GithubEvents {
    constructor(bot) {
        this.bot = bot;
    }

    ping(data, channel) {
        return 'Ping received for repo ' + data.repository['full_name'];
    }

    push(data, chanId) {
        const repo = data.repository['full_name'];
        const branch = data.ref.split('/')[2];
        const repoCfg = config.repos[repo];

        // Branch filter
        let branches = repoCfg.branches || ['*'];
        if(branches.indexOf('*') === -1 && branches.indexOf(branch) === -1) {
            return;
        }

        // Get channel filters
        let filters = repoCfg.hasOwnProperty('filters') ? repoCfg.filters : [];
        filters = filters.hasOwnProperty(chanId) ? filters[chanId] : [];
        
        // Commit filter
        let commits = data.commits.filter(commit => {
            for(let filter of filters) {
                if(commit.message.match(new RegExp(filter, 'g'))) {
                    return false;
                }
            }

            return true;
        });

        if (commits.length === 0) {
            return false;
        } else if (commits.length === 1) {
            let commit = commits[0];
            let hash = commit.id.substr(0, 7);
            const embed = new Discord.RichEmbed()
                .setTitle(`Pushed commit to ${repo}@${branch}`)
                .setAuthor(commit.author.username, data.sender['avatar_url'])
                .setDescription(`[${hash}](${commit.url}) ${commit.message}`)
                .setURL(commit.url);
            return embed;
        } else {
            let same = true;
            let firstAuthor = commits[0].author.username;
            for(let commit of commits) {
                if(firstAuthor !== commit.author.username) {
                    same = false;
                    break;
                }
            }

            if(same) {
                let desc = [];
                for(let commit of commits) {
                    let hash = commit.id.substr(0, 7);
                    desc.push(`[${hash}](${commit.url}) ${commit.message}`);
                }

                const embed = new Discord.RichEmbed()
                    .setAuthor(commits[0].author.username, data.sender['avatar_url'])
                    .setTitle(`Pushed ${data.commits.length} commits to ${repo}@${branch}`)
                    .setDescription(desc.join('\n'));
                return embed;
            } else {
                let desc = [];
                for(let commit of commits) {
                    let hash = commit.id.substr(0, 7);
                    desc.push(`[${hash}](${commit.url}) ${commit.message} - ${commit.author.username}`);
                }

                const embed = new Discord.RichEmbed()
                    .setTitle(`${commits.length} commits pushed to ${repo}@${branch}`)
                    .setDescription(desc.join('\n'));
                return embed;
            }
        }
    }
}

module.exports = GithubEvents;