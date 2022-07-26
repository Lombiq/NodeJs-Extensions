/**
 * @summary A script to copy files around; expects configuration in assets-to-copy.json or package.json (assetsToCopy).
 * @description This script is a wrapper around the npm package "copyfiles". It reads its configuration from a file in
 *              the consuming project named "assets-to-copy.json" or the "assetsToCopy" node in package.json, expecting
 *              the following format:
 *                [
 *                  {
 *                    "sources": [ "Assets/Images" ],
 *                    "target": "wwwroot/images"
 *                  },
 *                  {
 *                    "sources": [
 *                      "node_modules/marvelous/dist"
 *                      "node_modules/wonderful/bin"
 *                    ],
 *                    "pattern": "*",
 *                    "target": "wwwroot"
 *                  }
 *                  // more groups, if needed
 *                ]
 */
const { readFile, access } = require('node:fs/promises');
const path = require('path');
const util = require('util');
const copyfiles = util.promisify(require('copyfiles'));

const verbose = true;
const assetsFileName = 'assets-to-copy.json';
const assetsKeyInPackageJson = 'assetsToCopy';
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
                .catch(() => process.stderr.write(`The directory "${directoryToCopy}" cannot be accessed to copy files from.`))
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

async function readConfig(assetsFilePath) {
    log('Searching configuration...');

    return readFile(assetsFilePath, 'utf8')
        .then((assetsConfig) => {
            log(`Reading configuration from ${assetsFileName}...`);
            return JSON.parse(assetsConfig);
        })
        .catch(() => readFile('package.json', 'utf8')
            .then((packageConfig) => {
                log('Reading configuration from package.json...');
                return JSON.parse(packageConfig)[assetsKeyInPackageJson];
            })
        );
}

(async function main() {
    log('Executing copy-assets.js...');

    try {
        await readConfig(assetsFileName)
            .then((config) => {
                if (config) {
                    log(`Loaded assets config: ${JSON.stringify(config)}`);
                    return copyFilesFromConfig(config);
                }
                log('No configuration found.');
                return Promise.resolve();
            })
            .then(() => { log('Finished executing copy-assets.js. (1)'); })
            .catch((inner) => process.stderr.write(JSON.stringify(inner)));

        log('Finished executing copy-assets.js. (2)');
    }
    catch (error) {
        process.stderr.write(JSON.stringify(error));
    }

    log('Finished executing copy-assets.js. (3)');
})();
