/**
 * @summary A helper script to return the respective directories to run our scripts in.
 * @description Returns paths based on optional parameters and default fallback values. This script also ensures
 *              OS-independent handling of the broken directory traversal via '..' in the shell used by pnpm.
 */
const fs = require('fs');
const path = require('path');
const process = require('process');
const getConfig = require('./get-config');

const verbose = false;
const solutionFolderMarker = '_solution_';
const extensionToTypeMap = {
    js: 'scripts',
    md: 'markdown',
    scss: 'styles',
};
const log = (message) => {
    if (verbose) process.stderr.write(`# ${message}\n`);
};

const args = process.argv.splice(2);
const [extension, location] = args;
const type = extensionToTypeMap[extension];

if (!type) {
    throw Error('Please provide the type of files to process as the first argument: \'js\', \'md\' or \'scss\'.');
}

if (location !== 'source' && location !== 'target') {
    throw Error('Please provide the location to retrieve as the second argument: \'source\' or \'target\'.');
}

function getSolutionDir(initialDirectory) {
    // Traverse up the path until a .NET solution file (sln) is found.
    let rootDirectory = initialDirectory;
    while (!fs.readdirSync(rootDirectory).some((name) => name.endsWith('.sln'))) {
        const newPath = path.resolve(rootDirectory, '..');
        if (rootDirectory === newPath) throw new Error("Couldn't find any .NET solution (.sln) file.");
        rootDirectory = newPath;
    }
    return path.relative(initialDirectory, rootDirectory);
}

function getRelativePath() {
    const initialDirectory = path.resolve('..', '..');
    const config = getConfig({ directory: initialDirectory, verbose: verbose });
    let effectiveDir = config[type][location];

    if (!effectiveDir) return undefined;

    if (effectiveDir === solutionFolderMarker) {
        effectiveDir = getSolutionDir(initialDirectory);
    }

    log(`effectiveDir: ${effectiveDir}`);

    // We traverse two levels up, because the Node.js Extensions NPM package is located at
    // ./node_modules/nodejs-extensions.
    const effectivePath = path.resolve(initialDirectory, effectiveDir);

    // Return a relative path because it'll be much shorter than the absolute one; to avoid too long commands.
    return path.relative('.', effectivePath);
}

const relativePath = getRelativePath();

// Writing the existing path to stdout lets us consume it at the call site. When accessing 'target', we don't check for
// existence. If 'source' does not exist, we return '!'. Also, we replace '\' with '/' because postcss chokes on the
// backslashes 🤢.
let result;

const normalizedPath = relativePath?.replace(/\\/g, '/');

switch (true) {
    case location === 'target':
        result = normalizedPath;
        break;
    case extension === 'md':
        result = location === solutionFolderMarker ? location : normalizedPath;
        break;
    case fs.existsSync(relativePath):
        result = normalizedPath;
        break;
    default:
        result = '!';
        break;
}

log(`get-path.js ${args.join(' ')} returns ${result}.`);

process.stdout.write(result);
