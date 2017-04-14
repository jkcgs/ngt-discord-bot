const morgan = require('morgan');
const dateFormat = require('dateformat');
// let lf = '[:date[clf]] :remote-addr :method :url :status ":referrer" ":user-agent"';

module.exports = morgan(function (tokens, req, res) {
    let dt = '[' + dateFormat(date, 'dd/mmm/yyyy:hh:MM:ss Z') + ']';
    let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    return [
        dt, ip,
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req, res),
        '"' + tokens.referrer(req, res) + '"',
        '"' + req.headers['user-agent'] + '"',
        tokens.res(req, res, 'content-length'), '-',
        tokens['response-time'](req, res), 'ms'
    ].join(' ')
});