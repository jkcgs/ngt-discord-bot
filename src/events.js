const config = require('../config.json');

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
        let message = '';
        const repo = data.repository['full_name'];
        const branch = data.ref.split('/')[2];

        // Branch filter
        let branches = config.repos[repo].branches;
        if(branches.indexOf('*') === -1 && branches.indexOf(branch) === -1) {
            return;
        }

        // This thing comes from here:
        // https://github.com/Falconerd/discord-bot-github/blob/d569b0ac9afea4df1537d31f87b403423ea08660/src/events.js
        // Soon to be deleted
        if (data.commits.length === 1) {
            const commit = data.commits[0];
            const name = commit.author.name;
            const commitMessage = commit.message;
            const sha = commit.id.substring(0, 7);
            const url = `https://github.com/${repo}/commit/${sha}`;
            message += `[**${repo}:${branch}**] 1 new commit by ${name}`;
            message += `\n${commitMessage} - ${name}`;
            message += `\n${url}`;
        } else {
            const commits = data.commits;

            message += `[**${repo}:${branch}**] ${commits.length} new commits`;

            for (let commit of commits) {
                const sha = commit.id.substring(0, 7);
                const url = `https://github.com/${repo}/commit/${sha}`;
                message += `\n${commit.message} - ${commit.author.name}`;
                message += `\n${url}`;
            }
        }

        return message;
    }
}

module.exports = Events;