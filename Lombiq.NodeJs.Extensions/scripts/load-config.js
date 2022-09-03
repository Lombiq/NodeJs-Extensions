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

const envKeyConfigLoaded = 'NODEJS_EXTENSIONS_CONFIG_LOADED';
const configKeyInPackageJson = 'nodejsExtensions';
const verbose = process.argv.includes('--verbose');
const subConfigKey = process.argv.length > 2 && process.argv[2];
const defaults = {
    js_source: 'Assets/Scripts',
    js_target: 'wwwroot/js',
    scss_source: 'Assets/Styles',
    scss_target: 'wwwroot/css',
};

function logError(message) { process.stderr.write(`ERROR: ${message}\n`); }

function log(message) { if (verbose) process.stdout.write(message); }

function logLine(message) { log(message + '\n'); }

function checkValidityAndLogErrors(group) {
    const errors = [];
    if (typeof group.source !== 'string') {
        errors.push('source must be a string');
    }
    if (typeof group.target !== 'string') {
        errors.push('target must be a string');
    }
    if (errors.length > 0) {
        logError(`Invalid asset group: ${JSON.stringify(group)}: ${errors.join(', ')}.`);
    }
    return errors.length === 0;
}

async function loadConfig({ directory }) {
    const packageJsonPath = path.resolve(directory, 'package.json');
    let nodejsExtensionsConfig = null;

    log(`Reading configuration from ${packageJsonPath}... `);

    try {
        const packageConfigJson = await fs.promises.readFile(packageJsonPath, 'utf-8');
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

(async function main() {
    logLine(`Executing ${process.argv[1]} "${subConfigKey}"...`);

    if (!process.env[envKeyConfigLoaded]) {
        try {
            const consumingProjectDir = path.resolve('..', '..');
            const config = await loadConfig({ directory: consumingProjectDir });

            logLine('CONFIG: ' + JSON.stringify(config));

            process.env.JS_SOURCE = ((config || {}).scripts || {}).source || defaults.js_source;
            process.env.JS_TARGET = ((config || {}).scripts || {}).target || defaults.js_target;
            process.env.SCSS_SOURCE = ((config || {}).styles || {}).source || defaults.scss_source;
            process.env.SCSS_TARGET = ((config || {}).styles || {}).target || defaults.scss_target;

            process.env[envKeyConfigLoaded] = true;
        }
        catch (error) {
            logError(JSON.stringify(error));
        }
    }

    logLine(`JS_SOURCE: ${process.env.JS_SOURCE}`);

    if (subConfigKey === 'scripts' && !fs.existsSync(path.resolve('..', '..', process.env.JS_SOURCE))) {
        process.stdout.write('Skipping scripts pipeline');
        process.exit(1);
    }

    logLine(`Finished executing ${process.argv[1]}.`);
})();
