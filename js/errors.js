const R = require('ramda');

const {now} = require('./time');
/**
 * Error module. 
 * @module js/errors
 * @see module:js/errors
 */

/**
 * If a err.name matches the name we are look for, changes the 
 * message of the error.message to our liking and rethrows the Error Object.
 * Else rethrows the Error Object without changing the message on it.
 *
 * @func
 * @alias module:js/errors~checkError
 * @param {string} type - Name of error trying to look for.
 * @param {string} message - Input of your own message to be placed.
 * @param {Object} err - The error object that has been thrown.
 * @throws Rethrows same Error Object.
 * @see {@link http://ramdajs.com/docs/#curry}
 */
const checkError = R.curry(function(type, message, err) {
    if (err.name === type) {
        err.message = message;
    }
    throw err;
});

/**
 * A curried function of checkError where its first parameter is already
 * taken as the string 'RequestError'.
 *
 * @func
 * @alias module:js/errors.requestError
 * @param {string} message - Replaced message of RequestError Object
 * @returns {function} Curried function
 * @see {@link module:js/errors~checkError} for more details.
 */
const requestError = checkError('RequestError');

/**
 * Creates a string of the current date and time. The date is inclosed in
 * [].
 *
 * @func
 * @alias module:js/errors~formatedErrorDate
 * @example [Sat Feb 10 2018 22:44:25-0500]
 * @param {*} - Any type
 * @returns {string} Formatted date.
 * @see {@link http://ramdajs.com/docs/#pipe}
 * @see {@link http://ramdajs.com/docs/#prepend}
 * @see {@link http://ramdajs.com/docs/#append}
 * @see {@link http://ramdajs.com/docs/#join}
 */
const formatedErrorDate = R.pipe(
    now('ddd MMM DD YYYY HH:mm:ssZZ'),
    R.prepend('['), 
    R.append(']'),
    R.join('')
);

/**
 * Gets the message property of an Error Object and logs it to 
 * console.log and console.error. The console.log is needed to log it 
 * to the console, while the console.error is needed in order to log it
 * to the stderr so it can be properly be logged to a file.
 *
 * @func
 * @alias module:js/errors.logOutError
 * @param {Object} - Error Object
 * @returns {string} The message property in a Error Object.
 */
const logOutError = R.pipe(
    R.prop('message'), 
    R.tap(console.log), 
    R.juxt([formatedErrorDate, R.identity]),
    R.join(' '),
    R.tap(console.error),
);

module.exports = {requestError, logOutError};
