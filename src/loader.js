const fs = require('fs');
const path = require('path');
const log = require('./logger');
let rpath = path.join(__dirname, 'request');

/**
 * Loads all modules inside the request handlers modules (/src/request)
 */
function fun(app, bot) {
    let files = walkSyncJS(rpath);
    files.forEach((file) => {
        let mod = file.substr(0, file.length - 3).replace(rpath + path.sep, '');

        log.info('Loading ' + mod);
        let handler = require(file);
        handler(app, bot);
    });

    log.info('Request handlers loaded');
}


/**
 * Loads a list of all JS files inside a folder, including subfolders
 * 
 * @param {string} dir The folder to get the files
 * @returns An array with a list of folders (full) paths
 */
function walkSyncJS(dir) {
    let files = fs.readdirSync(dir);
    let filelist = [];
    files.forEach(function (file) {
        let fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            filelist = filelist.concat(walkSyncJS(fullPath));
        } else if (file.endsWith('.js')) {
            filelist.push(fullPath);
        }
    });

    return filelist;
}

module.exports = fun;