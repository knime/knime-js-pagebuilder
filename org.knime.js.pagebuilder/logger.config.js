const { _types } = require('consola');
let level = process.env.LOG_LEVEL || 'info';

module.exports = {
    level: _types[level].level,

    // browser only
    logToConsole: String(process.env.LOG_TO_CONSOLE) !== 'false'
};
