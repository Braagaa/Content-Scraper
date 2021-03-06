const fs = require('fs');
const path = require('path');
const {promisify} = require('util');
const {now} = require('./time');
const R = require('ramda');

const {existsSync, mkdirSync} = fs;
const writeFile = promisify(fs.writeFile);

/**
 * File Handling module.
 * @module js/file_handling
 * @see module:js/file_handling
 */


/**
 * A curried wrapper version of path.join. Joins 2 paths where the
 * first path precedes the second path.
 *
 * @func
 * @alias module:js/file_handling~pathJoin
 * @param {string} path1
 * @param {string} path2
 * @returns {string} Combined path1 and path2
 * @see {@link http://ramdajs.com/docs/#curry}
 */
const pathJoin = R.curry((path1, path2) => path.join(path1, path2));

/**
 * Returns a CSV title name as a string which is the current date in 
 * YYYY-MM-DD format with .csv concatenated at the end.
 *
 * @func
 * @alias module:js/file_handling~createCsvTitle
 * @param {string} - CSV body
 * @returns {string} CSV file name
 * @see {@link http://ramdajs.com/docs/#pipe}
 * @see {@link http://ramdajs.com/docs/#concat}
 */
const createCsvTitle = R.pipe(now('YYYY-MM-DD'), R.concat(R.__, '.csv'));

/**
 * Returns an array with the CSV file name in the index 0 and the CSV body
 * text in index 1.
 *
 * @func
 * @alias module:js/file_handling~createArgs
 * @param {string} csv - The CSV string
 * @returns {string[]} An array that contains 
 * the CSV title and CSV text body
 * @see {@link http://ramdajs.com/docs/#juxt}
 * @see {@link http://ramdajs.com/docs/#identity}
 */
const createArgs = R.juxt([createCsvTitle, R.identity]);

/**
 * Checks to see if a directory exists. If not its created.
 *
 * @func
 * @alias module:js/file_handling.checkCreateFolderSync
 * @param {string} path - path of directory
 * @returns {boolean}
 * @see {@link http://ramdajs.com/docs/#partial}
 */
const checkCreateFolderSync = function(path) {
    if (!existsSync(path)) {
        mkdirSync(path);
    }

    return true;
};

/**
 * A map version of checkCreateFolderSync to check multiple directories.
 *
 * @func
 * @alias module:js/file_handling.checkCreateFoldersSync
 * @param {string[]} - Array of string of directories
 * @returns {boolean[]}
 * @see {@link module:js/file_handling.checkCreateFolderSync}
 * @see {@link http://ramdajs.com/docs/#map}
 */
const checkCreateFoldersSync = R.map(checkCreateFolderSync);

/**
 * Creates the title for the CSV, uses the title as the file name, and 
 * writes the CSV content to it.
 *
 * @func
 * @alias module:js/file_handling.writeCSV
 * @param {string} folder - The path of desired directory
 * @param {string} csv - The CSV body text
 * @returns {Promise} Void
 * @see {@link http://ramdajs.com/docs/#curry}
 * @see {@link http://ramdajs.com/docs/#adjust}
 * @see {@link http://ramdajs.com/docs/#concat}
 * @see {@link http://ramdajs.com/docs/#apply}
 */
const writeCSV = R.curry(function(folder, csv) {
    return Promise.resolve(createArgs(csv))
    .then(R.adjust(pathJoin(folder), 0))
    .then(R.apply(writeFile));
});

module.exports = {checkCreateFolderSync, checkCreateFoldersSync, writeCSV};
