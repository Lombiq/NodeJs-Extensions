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

const assetsFileName = 'assets-to-copy.json';
const assetsKeyInPackageJson = 'assetsToCopy';

function logError(message) {
    process.stderr.write(message + '\n');
}

function isValid(assetsGroup) {
    const errors = [];
    if (!Array.isArray(assetsGroup.sources)) {
        errors.push('sources must be an array of strings');
    }
    if (assetsGroup.pattern && typeof assetsGroup.pattern !== 'string') {
        errors.push('pattern must be a glob string');
    }
    if (typeof assetsGroup.target !== 'string') {
        errors.push('target must be a string');
    }
    if (errors.length > 0) {
        logError(`Invalid asset group: ${JSON.stringify(assetsGroup)}: ${errors.join(', ')}.`);
    }
    return errors.length === 0;
}

async function getAssetsConfig({ directory, verbose } = { directory: process.cwd(), verbose: false }) {
    const log = (message) => { if (verbose) process.stdout.write(message); };
    const logn = (message) => { log(message + '\n'); };

    const assetsJsonPath = path.resolve(directory, assetsFileName);
    const packageJsonPath = path.resolve(directory, 'package.json');

    return Promise.resolve()
        .then(() => log(`Reading configuration from ${assetsJsonPath}... `))
        .then(() => readFile(assetsJsonPath, 'utf-8'))
        .then((assetsConfig) => {
            logn('succeeded.');
            return JSON.parse(assetsConfig);
        })
        .catch(() => {
            logn('failed.');
            log(`Reading configuration from ${packageJsonPath}... `);

            return readFile(packageJsonPath, 'utf-8')
                .then((packageConfig) => {
                    const config = JSON.parse(packageConfig)[assetsKeyInPackageJson];
                    logn(config ? 'succeeded' : 'failed');
                    return config;
                })
                .catch(() => logn('failed.'));
        })
        .then((config) => {
            logn(config ? `Loaded configuration: ${JSON.stringify(config)}` : 'No configuration found.');
            if (config) {
                if (!Array.isArray(config)) {
                    logError('The configuration must be an array of asset groups of the form: ' +
                        '{ sources: Array<string>, pattern: string [optional], target: string }.');
                    return null;
                }
                // Return at least all valid assets groups for some user satisfaction.
                const validGroups = config.filter((assetsGroup) => isValid(assetsGroup));
                return validGroups.length > 0 ? validGroups : null;
            }
            return config;
        });
}

module.exports = getAssetsConfig;
