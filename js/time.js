const moment = require('moment');

/**
 * momentjs wrapper module
 * @module js/time
 * @see module:js/time
 */

/**
 * Creates the current date in a string.
 *
 * @alias module:js/time.now
 * @param {string} format - Format for date
 * @returns {function(): string}
 * @see {@link https://momentjs.com/docs/#/displaying/format/}
 */
const now = format => 
    /**
     * @func
     * @returns {string} Formatted date
     */
    () => moment().format(format);

module.exports = {now};
