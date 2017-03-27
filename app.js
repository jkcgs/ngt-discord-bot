const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const log = require('./src/logger');
const config = require('./config.json');
const app = express();

let lf = '[:date[clf]] :remote-addr :method :url :status ":referrer" ":user-agent"';
app.use(morgan(lf));
app.use(bodyParser.json({ verify: rawBody }));

// Sets up the port and listen
let port = process.env.PORT || config.port || 3030;
app.listen(port, () => {
    log.info('Listening on port ' + port);

    let bot = require('./src/bot');
    require('./src/loader')(app, bot);
});

// Rescues the raw body to calculate its hash
function rawBody(req, res, buf, encoding) {
    if (buf && buf.length) {
        req.rawBody = buf.toString(encoding || 'utf8');
    }
}