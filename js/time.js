const moment = require('moment');

/**
 * Creates the current date in a string.
 *
 * @param {string} format - Format for date
 * @returns {() => string} Formatted date
 * @see {@link https://momentjs.com/docs/#/displaying/format/}
 */
const now = format => () => moment().format(format);

module.exports = {now};
