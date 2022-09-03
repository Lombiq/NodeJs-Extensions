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
const fs = require('fs');
const path = require('path');
const process = require('process');

const configKeyInPackageJson = 'nodejsExtensions';

function logError(message) { process.stderr.write(`ERROR: ${message}\n`); }

function checkValidityAndLogErrors(group) {
    const errors = [];
    if (typeof group.source !== 'string') {
        errors.push('source must be a string');
    }
    if (typeof group.target !== 'string') {
        errors.push('target must be a string');
    }
    if (errors.length > 0) {
        logError(`Invalid group: ${JSON.stringify(group)}: ${errors.join(', ')}.`);
    }
    return errors.length === 0;
}

function loadConfig({ directory, verbose }) {
    const log = (message) => { if (verbose) process.stderr.write(message); };
    const logLine = (message) => log(message + '\n');

    const packageJsonPath = path.resolve(directory, 'package.json');
    let nodejsExtensionsConfig = null;

    log(`Reading configuration from ${packageJsonPath}... `);

    try {
        const packageConfigJson = fs.readFileSync(packageJsonPath, 'utf-8');
        nodejsExtensionsConfig = JSON.parse(packageConfigJson)[configKeyInPackageJson];
        logLine(nodejsExtensionsConfig ? 'succeeded.' : 'failed.');
    }
    catch (_) {
        logLine('failed.');
    }

    if (!nodejsExtensionsConfig) {
        logLine('No configuration found.');
        return null;
    }

    logLine(`Loaded configuration: ${JSON.stringify(nodejsExtensionsConfig)}`);

    const isValid = Object
        .keys(nodejsExtensionsConfig)
        .every((key) => checkValidityAndLogErrors(nodejsExtensionsConfig[key]));

    return isValid ? nodejsExtensionsConfig : null;
}

module.exports = loadConfig;
