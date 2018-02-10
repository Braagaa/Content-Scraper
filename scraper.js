const {checkCreateFoldersSync, writeCSV} = require('./js/file_handling');
const {requestError, logOutError} = require('./js/errors');
const {promisify} = require('util');
const {JSDOM: {fromURL}} = require('jsdom');
const {now} = require('./js/time');
const R = require('ramda');

const stringify = promisify(require('csv-stringify/lib'));

const dataFolder = './data'; //results foldera
const logFolder = './logs';
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

//checks if folders exists or creates them
checkCreateFoldersSync([dataFolder, logFolder]);

fromURL(target)
.catch(requestError(`Cannot connect with ${target}`))
.then(R.path(['window', 'document']))
.then(querySelectorAll('.products a'))
.then(R.map(R.prop('href')))
.then(R.map(R.applyTo(R.__, fromURL)))
.then(promiseAll)
.then(R.map(R.path(['window', 'document'])))
.then(R.map(neededValues))
.then(generateCsv({header: true, quotedEmpty: true, columns}))
.then(writeCSV(dataFolder))
.catch(logOutError);
