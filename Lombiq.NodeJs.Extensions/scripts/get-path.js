/**
 * @summary A helper script to return the respective directories to run our scripts in.
 * @description Returns paths based on optional parameters and default fallback values. This script also ensures
 *              OS-independent handling of the broken directory traversal via '..' in the shell used by pnpm.
 */
const fs = require('fs');
const path = require('path');
const process = require('process');
const getCwd = require('./get-cwd');
const getConfig = require('./get-config');
const { handleErrorObject } = require('./handle-error');

const verbose = false;
const solutionFolderMarker = '_solution_';
const extensionToTypeMap = {
    js: 'scripts',
    md: 'markdown',
    scss: 'styles',
};
const log = (message) => {
    if (verbose) process.stderr.write(`# get-path.js: ${message}\n`);
};

const args = process.argv.slice(2);
const [extension, location] = args;
const type = extensionToTypeMap[extension];
const cwd = getCwd();

function fail(message) {
    handleErrorObject({ path: __filename, message });
    process.exit(1);
}

if (!type) {
    fail('Please provide the type of files to process as the first argument: \'js\', \'md\' or \'scss\'.');
}

if (location !== 'source' && location !== 'target') {
    fail('Please provide the location to retrieve as the second argument: \'source\' or \'target\'.');
}

function getSolutionDir(initialDirectory) {
    // Traverse up the path until a .NET solution file (sln) is found.
    let rootDirectory = initialDirectory;
    while (!fs.readdirSync(rootDirectory).some((name) => name.endsWith('.sln'))) {
        const newPath = path.resolve(rootDirectory, '..');
        if (rootDirectory === newPath) throw Error("Couldn't find any .NET solution (.sln) file.");
        rootDirectory = newPath;
    }
    const result = path.relative(initialDirectory, rootDirectory);
    log(`getSolutionDir(${initialDirectory}) returns "${result}".`);
    return result;
}

function getRelativePath() {
    const initialDirectory = path.resolve(cwd, '..', '..');
    const config = getConfig({ directory: initialDirectory, verbose: verbose });

    if (!config) throw Error(`Config ${JSON.stringify({ directory: initialDirectory, verbose: verbose })} is missing.`);
    if (!config[type][location]) return null;

    const effectiveDir = config[type][location] === solutionFolderMarker
        ? getSolutionDir(initialDirectory)
        : config[type][location];
    log(`effectiveDir: "${effectiveDir}"`);

    // We traverse two levels up, because the Node.js Extensions NPM package is located at
    // ./node_modules/nodejs-extensions.
    const effectivePath = path.resolve(initialDirectory, effectiveDir);

    // Return a relative path because it'll be much shorter than the absolute one; to avoid too long commands.
    return path.relative(cwd, effectivePath);
}

// Writing the existing path to stdout lets us consume it at the call site. If the path doesn't exist we return an error
// message and output nothing. Also, we replace '\' with '/' because postcss chokes on the backslashes 🤢.
try {
    const relativePath = getRelativePath();
    const normalizedPath = relativePath?.replace(/\\/g, '/');
    let result = '!';

    if (normalizedPath) {
        if (location === 'target') {
            result = normalizedPath;
        }
        else if (extension === 'md') {
            result = location === solutionFolderMarker ? location : normalizedPath;
        }
        else if (fs.existsSync(relativePath)) {
            result = normalizedPath;
        }
    }

    log(`"get-path ${args.join(' ')}" returns "${result}".`);
    process.stdout.write(result);
}
catch (error) {
    handleErrorObject(error);
    process.exit(1);
}
