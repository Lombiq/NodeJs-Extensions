/**
 * @summary A script to clean asset files; expects configuration in assets-to-copy.json or package.json (assetsToCopy).
 * @description This script removes assets previously copied using copy-assets.js.
 */
const path = require('path');
const util = require('util');
const rimraf = util.promisify(require('rimraf'));
const getAssetsConfig = require('./get-assets-config');

const verbose = true;
const filePattern = '**/*';

// Change to consuming project's directory.
process.chdir('..');
process.chdir('..');

function log(message) {
    if (verbose) process.stdout.write(message + '\n');
}

async function deleteFiles(assetsConfig) {
    log('Executing deleteFiles ...');

    return Promise.all(assetsConfig
        .map((assetsGroup) => {
            log(`Cleaning ${assetsGroup.target}`);

            return rimraf(path.join(assetsGroup.target, filePattern));
        }));
}

(async function main() {
    log('Executing clean-assets.js ...');

    try {
        await getAssetsConfig({ directory: process.cwd(), verbose: verbose })
            .then((config) => (config ? deleteFiles(config) : Promise.resolve()))
            .then(() => { log('Finished executing clean-assets.js.'); });
    }
    catch (error) {
        process.stderr.write(JSON.stringify(error) + '\n');
    }
})();
