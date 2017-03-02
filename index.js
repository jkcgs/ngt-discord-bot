const express = require('express');
const bodyParser = require('body-parser');
const Discord = require('discord.js');
const config = require('./config.json');
const reqHandler = require('./src/request-handler');
const bot = new Discord.Client();
const app = express();

app.use(bodyParser.json({ verify: rawBody }));
reqHandler(app, bot);

/*bot.on('message', (message) => {
    if (message.author.id === bot.user.id) return;
});*/

// Sets up the port and listen
let port = process.env.PORT || config.port || 8080;
app.listen(port, () => {
    console.log('Listening on port ' + port);

    bot.login(config.token)
        .then(console.log('Logged in.'))
        .catch(error => console.log(error));
});

// Rescues the raw body to calculate its hash
function rawBody(req, res, buf, encoding) {
    if (buf && buf.length) {
        req.rawBody = buf.toString(encoding || 'utf8');
    }
}