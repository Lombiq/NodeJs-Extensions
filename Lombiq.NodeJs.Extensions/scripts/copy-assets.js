/**
 * @summary A script to copy files around, based on sources and target groups defined in an assets-to-copy.json file.
 * @description This script is a wrapper around the npm package "copyfiles". It reads its configuration from a file in
 *              the consuming project named "assets-to-copy.json" which has the following format:
 *              [
 *                {
 *                  "sources": [ "Assets/Images" ],
 *                  "target": "wwwroot/images"
 *                },
 *                {
 *                  "sources": [
 *                    "node_modules/marvelous/dist"
 *                    "node_modules/wonderful/bin"
 *                  ],
 *                  "pattern": "*",
 *                  "target": "wwwroot"
 *                }
 *                // more groups, if needed
 *              ]
 */
const fs = require('fs');
const path = require('path');
const copyfiles = require('copyfiles');

const verbose = false;
const assetsFileName = 'assets-to-copy.json';
const filePattern = '**/*';

// Change to consuming project's directory.
process.chdir('..');
process.chdir('..');

const assetsFile = path.resolve(process.cwd(), assetsFileName);

if (fs.existsSync(assetsFile)) {
    const assetsConfig = JSON.parse(fs.readFileSync(assetsFile, 'utf8'));
    for (let i = 0; i < assetsConfig.length; i++) {
        const assetsGroup = assetsConfig[i];

        for (let j = 0; j < assetsGroup.sources.length; j++) {
            // Normalize the relative path to the directory to remove trailing slashes and straighten out any anomalies.
            const directoryToCopy = path.relative('.', assetsGroup.sources[j]);

            fs.access(directoryToCopy, (err) => {
                if (err) {
                    process.stderr.write(`The directory "${directoryToCopy}" cannot be accessed to copy files from.`);
                }
                else {
                    const pathPattern = path.join(directoryToCopy, assetsGroup.pattern || filePattern);
                    const sourceAndTargetPaths = [pathPattern, assetsGroup.target];

                    // We want to copy all files matched by the given pattern into the target folder mirroring the
                    // source folder structure. This is done by removing the source folder path from the beginning which
                    // "copyfiles" does using the "up" option.
                    const depth = directoryToCopy.split(/[\\/]/).filter().length;

                    // https://github.com/calvinmetcalf/copyfiles#programic-api
                    copyfiles(sourceAndTargetPaths, { verbose: verbose, up: depth }, () => {});
                }
            });
        }
    }
}
