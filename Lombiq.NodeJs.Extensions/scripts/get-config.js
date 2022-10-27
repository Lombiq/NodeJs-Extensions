/**
 * @summary A script to return the Node.js Extensions configuration from the consuming project's package.json file.
 * @description This script reads the "nodejsExtensions" property from the consuming project's package.json file,
 *              validates it against an expected schema, and, if successful, returns the configuration; else null.
 */
const fs = require('fs');
const path = require('path');
const process = require('process');
const validate = require('./validate-config');
const { handleWarningObject } = require('./handle-error');

const configKeyInPackageJson = 'nodejsExtensions';
const defaults = {
    scripts: {
        source: 'Assets/Scripts',
        target: 'wwwroot/js',
    },
    styles: {
        source: 'Assets/Styles',
        target: 'wwwroot/css',
    },
};
const defaultAssetsFilePattern = '**/*';

function getConfig({ directory, verbose }) {
    const log = (message) => { if (verbose) process.stderr.write(message); };
    const logLine = (message) => log(message + '\n');

    const packageJsonPath = path.resolve(directory, 'package.json');
    let nodejsExtensionsConfig = null;

    log(`Reading configuration from ${packageJsonPath}... `);

    try {
        const packageConfigJson = fs.readFileSync(packageJsonPath, 'utf-8');
        nodejsExtensionsConfig = JSON.parse(packageConfigJson)[configKeyInPackageJson];
        logLine('succeeded.');
    }
    catch (_) {
        logLine('failed.');
    }

    logLine(`Loaded configuration: ${JSON.stringify(nodejsExtensionsConfig)}`);

    const interpolatedConfig = { ...defaults, ...nodejsExtensionsConfig };

    logLine(`Interpolated configuration: ${JSON.stringify(interpolatedConfig)}`);

    if (Array.isArray(interpolatedConfig.assetsToCopy)) {
        interpolatedConfig.assetsToCopy.forEach((group) => {
            // '**' is problematic because it also matches the given directory itself, which breaks the copyfiles tool.
            if (group.pattern === '**') {
                handleWarningObject({
                    path: packageJsonPath,
                    message: 'Warning: The pattern ** is not supported due to it matching the source directory ' +
                        'itself, too. Instead, the glob pattern **/* will be used, which matches all files in the ' +
                        'given directory and all subdirectories. You can safely remove the pattern in this case.'
                });
                group.pattern = defaultAssetsFilePattern;
            }
            if (!group.pattern) group.pattern = defaultAssetsFilePattern;
        });
    }

    return validate(interpolatedConfig) ? interpolatedConfig : null;
}

module.exports = getConfig;
