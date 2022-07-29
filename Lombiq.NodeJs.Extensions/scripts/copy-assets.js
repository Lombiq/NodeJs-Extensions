/**
 * @summary A script to copy files around; expects configuration in assets-to-copy.json or package.json (assetsToCopy).
 * @description This script is a wrapper around the npm package "copyfiles". It reads its configuration from a file in
 *              the consuming project named "assets-to-copy.json" or the "assetsToCopy" node in package.json.
 */
const { access } = require('node:fs/promises');
const path = require('path');
const util = require('util');
/* eslint-disable-next-line import/no-unresolved -- ESLint does not know where to find external modules; ignore. */
const copyfiles = util.promisify(require('copyfiles'));
const getAssetsConfig = require('./get-assets-config');

const verbose = true;
const filePattern = '**/*';

// Change to consuming project's directory.
process.chdir('..');
process.chdir('..');

function log(message) {
    if (verbose) process.stdout.write(message + '\n');
}

async function copyFilesFromConfig(assetsConfig) {
    return Promise.all(assetsConfig
        .map((assetsGroup) => assetsGroup.sources.map((assetSource) => {
            // Normalize the relative path to the directory to remove trailing slashes and straighten out any anomalies.
            const directoryToCopy = path.relative('.', assetSource);
            log(`directoryToCopy = ${directoryToCopy}`);

            return access(directoryToCopy)
                .catch(() => process.stderr.write(`The directory "${directoryToCopy}" cannot be accessed to copy files from.\n`))
                .then(() => {
                    const pathPattern = path.join(directoryToCopy, assetsGroup.pattern || filePattern);
                    const sourceAndTargetPaths = [pathPattern, assetsGroup.target];

                    // We want to copy all files matched by the given pattern into the target folder mirroring the
                    // source folder structure. This is done by removing the source folder path from the beginning which
                    // "copyfiles" does using the "up" option.
                    const depth = directoryToCopy.split(/[\\/]/).length;

                    // https://github.com/calvinmetcalf/copyfiles#programic-api; promisified using Node.utils.promisify.
                    return copyfiles(sourceAndTargetPaths, { verbose: verbose, up: depth }, () => {});
                });
        }))
        .reduce((previousArray, currentArray) => [...previousArray, ...currentArray], []));
}

(async function main() {
    log('Executing copy-assets.js ...');

    try {
        await getAssetsConfig({ directory: process.cwd(), verbose: verbose })
            .then((config) => (config ? copyFilesFromConfig(config) : Promise.resolve()))
            .then(() => { log('Finished executing copy-assets.js.'); });
    }
    catch (error) {
        process.stderr.write(JSON.stringify(error));
    }
})();
