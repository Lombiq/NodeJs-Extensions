/**
 * @summary A script to clean asset files; expects configuration in assets-to-copy.json or package.json (assetsToCopy).
 * @description This script removes assets previously copied using copy-assets.js.
 */

const path = require('path');
const rimraf = require('util').promisify(require('rimraf'));

const getConfig = require('./get-config');
const getProjectDirectory = require('./get-project-directory');
const { handleErrorObject } = require('./handle-error');

const verbose = false;
const filePattern = '**/*';

function logLine(message) {
    if (verbose) process.stdout.write(message + '\n');
}

async function deleteFiles(config) {
    logLine('Executing deleteFiles...');

    return Promise.all(config
        .map((assetsGroup) => {
            logLine(`Cleaning ${assetsGroup.target}`);

            return rimraf(path.join('..', '..', assetsGroup.target, filePattern));
        }));
}

(async function main() {
    logLine('Executing clean-assets.js...');

    try {
        const assetsConfig = getConfig({ directory: getProjectDirectory(), verbose: verbose }).assetsToCopy;
        if (assetsConfig) await deleteFiles(assetsConfig);
    }
    catch (error) {
        handleErrorObject(error);
    }

    logLine('Finished executing clean-assets.js.');
})();
