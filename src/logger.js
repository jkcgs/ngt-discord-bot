let dateFormat = require('dateformat');
let Logger = function () {
    let self = this;
    let levels = ['fatal', 'error', 'warn', 'info', 'debug'];

    self.format = function (level, date, message) {
        let formattedDate = dateFormat(date, 'dd/mmm/yyyy:hh:MM:ss Z');

        return `[${formattedDate}] (${level}) ${message}`;
    };

    self.log = function(level, message) {
        self.write(self.format(level, new Date(), message));
    };

    self.write = function(out) {
        console.log(out);
    };

    for(let level of levels) {
        self[level] = function(message) {
            self.log(level, message);
        };
    }
};

module.exports = new Logger();