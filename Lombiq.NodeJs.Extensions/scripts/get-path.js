/**
 * @summary A helper script to return the respective directories to run our scripts in.
 * @description Returns paths based on optional parameters and default fallback values. This script also ensures
 *              OS-independent handling of the broken directory traversal via '..' in the shell used by pnpm.
 */
const fs = require('fs');
const path = require('path');
const process = require('process');
const getConfig = require('./get-config');

const args = process.argv.splice(2);

const type = args[0];
if (type !== 'js' && type !== 'scss') {
    throw Error('Please provide the type of files to process as the first argument: \'js\' or \'scss\'.');
}

const location = args[1];
if (location !== 'source' && location !== 'target') {
    throw Error('Please provide the location to retrieve as the second argument: \'source\' or \'target\'.');
}

const effectiveType = type === 'js' ? 'scripts' : 'styles';
const config = getConfig({ directory: path.resolve('..', '..'), verbose: false });
const effectiveDir = config[effectiveType][location];

const basePath = process.cwd();

// We traverse two levels up, because the Node.js Extensions npm package is located at ./node_modules/nodejs-extensions.
const effectivePath = path.resolve(basePath, '..', '..', effectiveDir);

// Return a relative path because it'll be much shorter than the absolute one; to avoid too long commands.
const relativePath = path.relative(basePath, effectivePath);

// Writing the existing path to stdout lets us consume it at the call site. When accessing 'target', we don't check for
// existence. If 'source' does not exist, we return '!'. Also, we replace '\' with '/' because postcss chokes on the
// backslashes 🤢.
process.stdout.write((location === 'target' || fs.existsSync(relativePath)) ? relativePath.replaceAll('\\', '/') : '!');
