/**
 * @summary A script to copy files around; expects configuration in assets-to-copy.json or package.json (assetsToCopy).
 * @description This script is a wrapper around the npm package "copyfiles". It reads its configuration from a file in
 *              the consuming project named "assets-to-copy.json" or the "assetsToCopy" node in package.json.
 */
const { access } = require('fs').promises;
const path = require('path');
const copyFiles = require('copyfiles');
const getConfig = require('./get-config');
const getProjectDirectory = require('./get-project-directory');
const { handleErrorObject, handleErrorObjectAndExit } = require('./handle-error');

const verbose = false;

function logLine(message) {
    if (verbose) process.stdout.write(message + '\n');
}

// Change to consuming project's directory.
const projectPath = getProjectDirectory() ?? handleErrorObjectAndExit({
    code: 'NE02',
    path: 'AssetCopy',
    message: `Couldn't locate the project directory. Current location is "${process.cwd()}".`,
});
process.chdir(projectPath);
logLine(`Started executing copy-assets.js at "${projectPath}".`);

function copyFilesAsync(source, target, options) {
    // See https://github.com/calvinmetcalf/copyfiles#programic-api for more details.
    // no-promise-executor-return -- Necessary workaround because of the weird upstream implementation.
    return new Promise((resolve, reject) => copyFiles(
        [source, target],
        options,
        (value) => (value instanceof Error ? reject : resolve)(value)));
}

function copyFilesFromConfig(config) {
    return Promise.all(config
        .map((assetsGroup) => assetsGroup.sources.map((assetSource) => {
            // Normalize the relative path to the directory to remove trailing slashes and straighten out any anomalies.
            const directoryToCopy = path.normalize(path.resolve(projectPath, assetSource));
            const pattern = assetsGroup.pattern;
            logLine(`Copy assets from "${directoryToCopy}" using pattern "${pattern}"...`);

            return access(directoryToCopy).then(
                () => {
                    const pathPattern = path.join(directoryToCopy, pattern);
                    const targetPath = (process.platform === 'win32')
                        ? assetsGroup.target
                        : path.normalize(path.resolve(projectPath, assetsGroup.target));

                    // We want to copy all files matched by the given pattern into the target folder mirroring the
                    // source folder structure. This is done by removing the source folder path from the beginning
                    // which "copyfiles" does using the "up" option.
                    const depth = directoryToCopy.split(/[\\/]/).length;

                    return copyFilesAsync(pathPattern, targetPath, { verbose: verbose, up: depth });
                },
                (e) => handleErrorObject({
                    code: 'NE31',
                    path: 'AssetCopy',
                    message: `The directory "${directoryToCopy}" cannot be accessed. ` + JSON.stringify(
                        {
                            pattern: pattern,
                            assetSource: assetSource,
                            currentDirectory: process.cwd(),
                            error: e,
                            errorString: e.toString(),
                        }),
                }));
        }))
        .reduce((previousArray, currentArray) => [...previousArray, ...currentArray], []));
}

(async function main() {
    try {
        const assetsConfig = getConfig({ directory: projectPath, verbose: verbose }).assetsToCopy;

        if (assetsConfig) {
            const syncGroups = Map
                .groupBy(
                    assetsConfig.map((assetsGroup) => ({ sequence: 0, ...assetsGroup })),
                    (assetsGroup) => assetsGroup.sequence)
                .entries()
                .map((group) => group[1])
                .toArray()
                .sort((a, b) => a[0].sequence - b[0].sequence);

            for (let i = 0; i < syncGroups.length; i++) {
                // eslint-disable-next-line no-await-in-loop -- Intentionally not parallel.
                await copyFilesFromConfig(syncGroups[i]);
            }
        }
        else {
            logLine(`There was no "assetsToCopy" configuration in "${projectPath}".`);
        }
    }
    catch (error) {
        handleErrorObject(error);
    }

    logLine('Finished executing copy-assets.js.');
})();
