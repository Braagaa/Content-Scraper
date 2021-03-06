const {checkCreateFoldersSync, writeCSV} = require('./js/file_handling');
const {requestError, logOutError} = require('./js/errors');
const {promisify} = require('util');
const {JSDOM: {fromURL}} = require('jsdom');
const {now} = require('./js/time');
const R = require('ramda');

const stringify = promisify(require('csv-stringify/lib'));

const dataFolder = './data';
const logFolder = './logs';
const target = 'http://shirts4mike.com/shirts.php';

/**
 * DOM scrapes for product information on shirts4mike.com
 * @module scraper
 * @see module:scraper
 */


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
 * @param {Promise[]} list - An array of awaiting async calls
 * @returns {Promise[]} - Promise with resolved array values or reject 
 * Promise
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

/** checks if folders exists or creates them. */
checkCreateFoldersSync([dataFolder, logFolder]);

/**
 * The main program that scrapes for information.
 *
 * @const {Promise}
 * @default 
 */

//gets a jsdom Window Object if successful
const scrap = fromURL(target)
//if jsdom could not connect console error and end program
.catch(requestError(`Cannot connect with ${target}`))
//gets document Object: jsdom.window.document
.then(R.path(['window', 'document']))
//finds all links within the document thats a parent of .products class
.then(querySelectorAll('.products a'))
//gets the href property of all links
.then(R.map(R.prop('href')))
//uses the links to fetch all jsdom window objects
.then(R.map(R.applyTo(R.__, fromURL)))
//waits for all the jsdom windows objects to successfully be fetched
.then(promiseAll)
//gets the document property (jsdom.window.document) for all
.then(R.map(R.path(['window', 'document'])))
//scrapes all needed information for all documents
.then(R.map(neededValues))
//creates a CSV formatted string with the found information
.then(generateCsv({header: true, quotedEmpty: true, columns}))
//writes the CSV string to a CSV file in desired directory
.then(writeCSV(dataFolder))
//logs success message
.then(() => console.log(`${target} successfully scraped at data folder!`))
//logs any errors
.catch(logOutError);
