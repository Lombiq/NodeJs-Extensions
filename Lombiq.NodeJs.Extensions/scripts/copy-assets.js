/**
 * @summary A script to copy files around; expects configuration in assets-to-copy.json or package.json (assetsToCopy).
 * @description This script is a wrapper around the npm package "copyfiles". It reads its configuration from a file in
 *              the consuming project named "assets-to-copy.json" or the "assetsToCopy" node in package.json.
 */
import { promises as fsPromises } from 'fs';
import path from 'path';
import util from 'util';
import copyfiles from 'copyfiles';

import getConfig from './get-config.js';
import getProjectDirectory from './get-project-directory.js';
import { handleErrorObject, handleErrorObjectAndExit } from './handle-error.js';

const copy = util.promisify(copyfiles);
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

function copyFilesFromConfig(config) {
    return Promise.all(config
        .map((assetsGroup) => assetsGroup.sources.map((assetSource) => {
            // Normalize the relative path to the directory to remove trailing slashes and straighten out any anomalies.
            const directoryToCopy = path.normalize(path.resolve(projectPath, assetSource));
            const pattern = assetsGroup.pattern;
            logLine(`Copy assets from "${directoryToCopy}" using pattern "${pattern}"...`);

            return fsPromises.access(directoryToCopy).then(
                () => {
                    const pathPattern = path.join(directoryToCopy, pattern);
                    const targetPath = (process.platform === 'win32')
                        ? assetsGroup.target
                        : path.normalize(path.resolve(projectPath, assetsGroup.target));
                    const sourceAndTargetPaths = [pathPattern, targetPath];

                    // We want to copy all files matched by the given pattern into the target folder mirroring the
                    // source folder structure. This is done by removing the source folder path from the beginning
                    // which "copyfiles" does using the "up" option.
                    const depth = directoryToCopy.split(/[\\/]/).length;

                    // See https://github.com/calvinmetcalf/copyfiles#programic-api for more details.
                    return copy(sourceAndTargetPaths, { verbose: verbose, up: depth }, () => {});
                },
                () => handleErrorObject({
                    code: 'NE31',
                    path: 'AssetCopy',
                    message: `The directory "${directoryToCopy}" cannot be accessed to copy files from.` +
                        JSON.stringify({ pattern: pattern, assetSource: assetSource, currentDirectory: process.cwd() }),
                }));
        }))
        .reduce((previousArray, currentArray) => [...previousArray, ...currentArray], []));
}

(async function main() {
    try {
        const assetsConfig = getConfig({ directory: projectPath, verbose: verbose }).assetsToCopy;

        if (assetsConfig) {
            await copyFilesFromConfig(assetsConfig);
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
