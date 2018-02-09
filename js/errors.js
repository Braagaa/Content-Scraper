const R = require('ramda');

/**
 * If a err.name match the name we are look for, changes the 
 * message of the error.message to our liking and rethrows the Error Object.
 * Else rethrows the Error Object without changing the message on it.
 *
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
 * @see {@link checkError} for more details.
 */
const requestError = checkError('RequestError');

/**
 * Gets the message property of an Error Object and logs it to 
 * console.log and console.error. The console.log is needed to log it 
 * to the console, while the console.error is needed in order to log it
 * to the stderr so it can be properly be logged to a file.
 *
 * @param {Object} - Error Object
 * @returns {string} The message property in a Error Object
 */
const logOutError = R.pipe(R.prop('message'), R.tap(console.log), R.tap(console.error));

module.exports = {requestError, logOutError};
