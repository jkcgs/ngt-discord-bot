const morgan = require('morgan');
const dateFormat = require('dateformat');

module.exports = morgan(function (tokens, req, res) {
    let dt = '[' + dateFormat((new Date()), 'dd/mmm/yyyy:hh:MM:ss Z') + ']';
    let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    let ref = tokens.referrer(req, res);
    ref = ref ? '"' + tokens.referrer(req, res) + '"' : '""';

    return [
        dt, ip,
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req, res), ref,
        '"' + req.headers['user-agent'] + '"', '-',
        tokens['response-time'](req, res), 'ms'
    ].join(' ')
});