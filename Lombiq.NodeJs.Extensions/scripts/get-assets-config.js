/**
 * @summary A script to return the configuration from assets-to-copy.json or package.json (assetsToCopy).
 * @description This script reads a configuration object from a file in the consuming project named
 *              "assets-to-copy.json" or the "assetsToCopy" node in package.json, and expects the following format:
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
const { readFile } = require('node:fs/promises');
const path = require('path');

let isVerbose = true;
const assetsFileName = 'assets-to-copy.json';
const assetsKeyInPackageJson = 'assetsToCopy';

function log(message) {
    if (isVerbose) process.stdout.write(message + '\n');
}

async function getAssetsConfig({ directory, verbose } = { directory: process.cwd(), verbose: false }) {
    isVerbose = verbose;

    log('Searching configuration...');

    const assetsJsonPath = path.resolve(directory, assetsFileName);
    const packageJsonPath = path.resolve(directory, assetsFileName);

    return readFile(assetsJsonPath, 'utf-8')
        .then((assetsConfig) => {
            log(`Reading configuration from ${assetsFileName}...`);
            return JSON.parse(assetsConfig);
        })
        .catch(() => readFile(packageJsonPath, 'utf-8')
            .then((packageConfig) => {
                log('Reading configuration from package.json...');
                return JSON.parse(packageConfig)[assetsKeyInPackageJson];
            })
        );
}

module.exports = getAssetsConfig;
