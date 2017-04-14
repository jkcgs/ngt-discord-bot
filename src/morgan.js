const morgan = require('morgan');
const dateFormat = require('dateformat');

module.exports = morgan(function (tokens, req, res) {
    let dt = '[' + dateFormat((new Date()), 'dd/mmm/yyyy:hh:MM:ss Z') + ']';
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