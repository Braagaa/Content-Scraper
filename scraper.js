const {checkCreateFolderSync, writeCSV} = require('./js/file_handling');
const {promisify} = require('util');
const {JSDOM: {fromURL}} = require('jsdom');
const {now} = require('./js/time');
const R = require('ramda');

const stringify = promisify(require('csv-stringify/lib'));

const dataFolder = './data'; //results folder
const target = 'http://shirts4mike.com/shirts.php';

//function helpers

/**
 * Calls on the querySelectorAll of an Object. Will be used on DOM elements
 * to find desired list of DOM elements.
 *
 * @func
 * @param {string} - Selector to find elements
 * @param {Object} - DOM Element Object to invoke querySelectorAll method
 * @returns {Array} - Array of DOM Elements
 * @see {@link http://ramdajs.com/docs/#invoker}
 */
const querySelectorAll = R.invoker(1, 'querySelectorAll');

/**
 * Promise.all lift function
 *
 * @param {Array} list - An array of awaiting async calls
 * @returns {Promise} - Promise with resolved array values or reject Promise
 */
const promiseAll = list => Promise.all(list);

/**
 * Finds the element in a window object, with the help of jQuery, by using a
 * selector and the 'find' method to retrieve its wanted property.
 *
 * @param {Object} Window
 * @returns {string}
 * @see {@link http://ramdajs.com/docs/#pipe}
 * @see {@link http://ramdajs.com/docs/#head}
 * @see {@link http://ramdajs.com/docs/#prop}
 */
const selectRetrieveProp = (selector, prop) => 
R.pipe(querySelectorAll(selector), R.head, R.prop(prop));

/**
 * Take a Window Object and scrapes all the information needed from it
 * into an Object with properties price, title, url, and imageUrl.
 *
 * @func
 * @param {Object} Window
 * @returns {Object} 
 * @see {@link http://ramdajs.com/docs/#applySpec}
 * @see {@link http://ramdajs.com/docs/#pipe}
 * @see {@link http://ramdajs.com/docs/#replace}
 * @see {@link http://ramdajs.com/docs/#path}
 */
const neededValues = R.applySpec({
    title: R.pipe(selectRetrieveProp('.shirt-details h1', 'textContent'), R.replace(/\$\d+ /g, '')),
    price: selectRetrieveProp('.price', 'textContent'),
    imageUrl: selectRetrieveProp('.shirt-picture img', 'src'),
    url: R.prop('URL'),
    time: now('hh:mm a')
});

/**
 * A curry wrapper function version of csv-stringify.
 *
 * @func
 * @param {Object} options - Customizable options Object
 * @param {Object[]} items - CSV Objects
 * @returns {string} - CSV formatted string
 * @see {@link http://ramdajs.com/docs/#curry}
 * @see {@link https://github.com/adaltas/node-csv-stringify/blob/master/src/index.coffee.md}
 */
const generateCsv = R.curry((options, items) => stringify(items, options));

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
 * @const {Object}
 * @default
 */
const columns = {
    title: 'Title',
    price: 'Price',
    imageUrl: 'ImageURL',
    url: 'URL',
    time: 'Time'
};

fromURL(target)
.catch(requestError(`Cannot connect with ${target}`))
.then(R.tap(checkCreateFolderSync([dataFolder])))
.then(R.path(['window', 'document']))
.then(querySelectorAll('.products a'))
.then(R.map(R.prop('href')))
.then(R.map(R.applyTo(R.__, fromURL)))
.then(promiseAll)
.then(R.map(R.path(['window', 'document'])))
.then(R.map(neededValues))
.then(generateCsv({header: true, quotedEmpty: true, columns}))
.then(writeCSV(dataFolder))
.catch(error => console.error(error.message));
