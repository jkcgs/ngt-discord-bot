const express = require('express');
const bodyParser = require('body-parser');
const log = require('./src/logger');
const morgan = require('./src/morgan');
const config = require('./config.json');
const app = express();

app.use(morgan);
app.use(bodyParser.json({ verify: rawBody }));

// Sets up the port and listen
let port = process.env.PORT || config.port || 3030;
app.listen(port, () => {
    log.info('Listening on port ' + port);

    let bot = require('./src/bot');
    bot.on('message', (message) => {		
        if (message.author.id === bot.user.id) {
            return;
        }

        if(message.content.trim() === '+repo') {
            message.reply('https://github.com/jkcgs/ngt-discord-bot');
        }
    });

    require('./src/loader')(app, bot);
});

// Rescues the raw body to calculate its hash
function rawBody(req, res, buf, encoding) {
    if (buf && buf.length) {
        req.rawBody = buf.toString(encoding || 'utf8');
    }
}