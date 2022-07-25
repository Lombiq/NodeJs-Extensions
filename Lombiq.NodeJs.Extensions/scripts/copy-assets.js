/**
 * @summary A script to copy files around, based on sources and target groups defined in an assets-to-copy.json file.
 * @description This script is a wrapper around the npm package "copyfiles". It reads its configuration from a file in
 *              the consuming project named "assets-to-copy.json" which has the following format:
 *              [
 *                {
 *                  "sources": [ "Assets/Images/*.*" ],
 *                  "target": "wwwroot/images"
 *                },
 *                {
 *                  "sources": [
 *                    "node_modules/marvelous/** /*"
 *                    "node_modules/wonderful/** /*"
 *                  ],
 *                  "target": "wwwroot"
 *                }
 *                // more groups, if needed
 *              ]
 */
const fs = require('fs');
const path = require('path');
const copyfiles = require('copyfiles');
const assetFileName = 'assets-to-copy.json';

// Change to consuming project's directory.
process.chdir('..');
process.chdir('..');

const assetsFile = path.resolve(process.cwd(), assetFileName);

if (fs.existsSync(assetsFile)) {
    const assetsConfig = JSON.parse(fs.readFileSync(assetsFile, 'utf8'));
    for (let i = 0; i < assetsConfig.length; i++) {
        const assetsGroup = assetsConfig[i];
        const paths = [...assetsGroup.sources, assetsGroup.target];

        // https://www.npmjs.com/package/copyfiles#programic-api
        copyfiles(paths, {}, () => {});
    }
}
