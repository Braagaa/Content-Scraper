const {existsSync, mkdirSync} = require('fs');
const R = require('ramda');

/**
 * Checks to see if a directory exists. If not its created.
 *
 * @param {string} path - path of directory
 * @returns {boolean}
 */
const checkCreateFolderSync = function(path) {
    if (!existsSync(path)) {
        mkdirSync(path);
    }

    return true;
}

/**
 * Try/Catch version of checkCreateFolderSync. Returns false if try fails.
 * 
 * @func
 * @param {string} path - path of directory
 * @returns {boolean}
 * @see http://ramdajs.com/docs/#tryCatch
 * @see http://ramdajs.com/docs/#F
 */
const tryCheckCreateFolderSync = R.tryCatch(checkCreateFolderSync, R.F);

module.exports = {tryCheckCreateFolderSync};
