## ngt-discord-bot
This is a Discord bot made to be used in the [Nintendo Guides Translation](https://discord.gg/4TjZpft) server
and allows us to:

1. Receive alerts to a text channel about a GitHub repository, which has to set up webhooks
and has to be added to the configuration.
2. Receive alerts to a text channel about a Crowdin project, when it's fully translated
and when is fully revised.
3. See the repo URL by using the `+repo` command wherever the bot is allowed to chat (even in direct chat).

### Installation and usage instructions
You need a working NodeJS 7 installation with `npm`.

1. Clone this repo
2. Fill the settings
3. Run `npm install` in the repo folder
4. Run `npm start`

It will be listening on the port 3030 by default for webhook requests.