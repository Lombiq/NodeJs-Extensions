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
const { readFile } = require('fs').promises;
const path = require('path');

const assetsFileName = 'assets-to-copy.json';
const assetsKeyInPackageJson = 'assetsToCopy';

function logError(message) {
    process.stderr.write(message + '\n');
}

function checkValidityAndLogErrors(assetsGroup) {
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
    const logLine = (message) => log(message + '\n');

    const assetsJsonPath = path.resolve(directory, assetsFileName);
    const packageJsonPath = path.resolve(directory, 'package.json');
    let config;

    log(`Reading configuration from ${assetsJsonPath}... `);

    try {
        const assetsConfigJson = await readFile(assetsJsonPath, 'utf-8');
        config = JSON.parse(assetsConfigJson);
        logLine('succeeded.');
    }
    catch (_) {
        logLine('failed.');
    }

    log(`Reading configuration from ${packageJsonPath}... `);

    try {
        const packageConfigJson = await readFile(packageJsonPath, 'utf-8');
        config = JSON.parse(packageConfigJson)[assetsKeyInPackageJson];
        logLine(config ? 'succeeded.' : 'failed.');
    }
    catch {
        logLine('failed.');
    }

    if (!config) {
        logLine('No configuration found.');
        return null;
    }

    logLine(`Loaded configuration: ${JSON.stringify(config)}`);

    if (!Array.isArray(config)) {
        logError('The configuration must be an array of asset groups of the form: ' +
            '{ sources: Array<string>, pattern: string [optional], target: string }.');
        return null;
    }

    const isValid = config
        .map((assetsGroup) => checkValidityAndLogErrors(assetsGroup))
        .reduce((isConfigValid, isGroupValid) => isConfigValid && isGroupValid, true);

    return isValid ? config : null;
}

module.exports = getAssetsConfig;
