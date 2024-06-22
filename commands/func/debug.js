const { Modes } = require('./modes');

const debug = (message, type) => {
   if (global.client.currentMode === Modes.DEBUG) {
      const colors = {
         login: '\x1b[44m',
         debug: "\x1b[43m",
         info: "\x1b[43m",
         error: '\x1b[41m',
         warn: "\x1b[45m",
         success: "\x1b[42m",
         important: "\x1b[45m",
         log: '\x1b[44m'
      };
      const resetColor = "\x1b[0m";
      const color = colors[type] || colors.debug;

      console.log(`${color}[${type.toUpperCase()}]${resetColor}: ${message}`);
   }
};

module.exports = { debug };