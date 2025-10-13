/**
 * @summary A script to clean output files; expects configuration in package.json (default: assetsToCopy).
 * @description This script removes assets previously copied into the configured target directory.
 */

const path = require('path');

const { rimraf } = require('rimraf');

const getConfig = require('./get-config');
const getProjectDirectory = require('./get-project-directory');
const { handleErrorObject, handleErrorObjectAndExit } = require('./handle-error');

// Load command line arguments.
const args = process.argv.slice(2);
let verbose = false;
let type = 'assetsToCopy';
let filePattern = '**/*';

for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
        case '--verbose':
            verbose = true;
            break;
        case '--type':
            i += 1;
            type = args[i];
            break;
        case '--filePattern':
            i += 1;
            filePattern = args[i];
            break;
        default:
            handleErrorObjectAndExit(`Unsupported argument "${args[i]}".`);
            break;
    }
}

function logLine(message) {
    if (verbose) process.stdout.write(message + '\n');
}

/**
 * Deletes a directory and its contents indicated by the `config.target` property.
 * @param projectDirectory {string} The directory treated as a base for the relative path in `config.target`.
 * @param config {{ target: string }} The configuration object which must contain a `target` property.
 * @returns {Promise} The recursive delete operation.
 */
function deleteDirectory(projectDirectory, config) {
    logLine(`Cleaning "${config.target}" in "${projectDirectory}"...`);

    return rimraf(path.join(projectDirectory, config.target, filePattern), { glob: true });
}

/**
 * Recursively deletes the directories indicated by the configuration type set by the `--type` command line parameter.
 * @returns {Promise}
 */
function deleteConfig() {
    logLine('Executing deleteConfig...');

    const projectDirectory = getProjectDirectory();
    const config = getConfig({ directory: projectDirectory, verbose: verbose })[type];

    if (!config) {
        logLine(`No configuration was found for "${type}" in "${projectDirectory}".`);
        return Promise.resolve();
    }

    return Array.isArray(config)
        ? Promise.all(config.map((group) => deleteDirectory(projectDirectory, group)))
        : deleteDirectory(projectDirectory, config);
}

(async function main() {
    logLine('Executing clean-assets.js...');

    try {
        await deleteConfig();
    }
    catch (error) {
        handleErrorObject(error);
    }

    logLine('Finished executing clean-assets.js.');
})();
