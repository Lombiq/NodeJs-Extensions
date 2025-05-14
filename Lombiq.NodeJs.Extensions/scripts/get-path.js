/**
 * @summary A helper script to return the respective directories to run our scripts in.
 * @description Returns paths based on optional parameters and default fallback values. This script also ensures
 *              OS-independent handling of the broken directory traversal via '..' in the shell used by pnpm.
 */
const fs = require('fs');
const path = require('path');
const process = require('process');

const getConfig = require('./get-config');
const getProjectDirectory = require('./get-project-directory');
const { handleErrorObject, handleErrorObjectAndExit } = require('./handle-error');

const verbose = false;
const solutionFolderMarker = '_solution_';
const extensionToTypeMap = {
    js: 'scripts',
    md: 'markdown',
    css: 'styles',
    scss: 'styles',
};

const SOURCE = 'source';
const TARGET = 'target';

function log(message) {
    process.stderr.write(`# get-path.js: ${message}\n`);
}

function getLocationType(locationArgument, initialDirectory, config, type) {
    switch (locationArgument?.toLowerCase()) {
        case SOURCE: return SOURCE;
        case TARGET: return TARGET;
        case 'source-or-target': {
            const sourcePath = config?.[type]?.[SOURCE];
            const sourceExists = sourcePath && fs.existsSync(path.join(initialDirectory, sourcePath));
            return sourceExists ? SOURCE : TARGET;
        }
        default:
            return handleErrorObjectAndExit(new Error(
                'Please provide the location to retrieve as the second argument: "source" or "target" (current value: ' +
                JSON.stringify(locationArgument) + ').'));
    }
}

const args = process.argv.slice(2);
const extension = args[0]?.toLocaleLowerCase();
const locationArgument = args[1];
const type = extensionToTypeMap[extension];

if (!type) {
    handleErrorObjectAndExit(new Error(
        'Please provide the type of files to process as the first argument: "js", "md", "css" or "scss".'));
}

function getSolutionDir(initialDirectory) {
    // Traverse up the path until a .NET solution file (sln) is found.
    let rootDirectory = initialDirectory;
    while (!fs.readdirSync(rootDirectory).some((name) => name.endsWith('.sln'))) {
        const newPath = path.resolve(rootDirectory, '..');
        if (rootDirectory === newPath) throw new Error("Couldn't find any .NET solution (.sln) file.");
        rootDirectory = newPath;
    }
    const result = path.relative(initialDirectory, rootDirectory);
    log(`getSolutionDir(${initialDirectory}) returns "${result}".`);
    return result;
}

function getPathContext() {
    const initialDirectory = getProjectDirectory() ?? '.';
    const config = getConfig({ directory: initialDirectory, verbose: verbose });
    const locationType = getLocationType(locationArgument, initialDirectory, config, type);

    if (!config) throw new Error(`Config ${JSON.stringify({ directory: initialDirectory, verbose: verbose })} is missing.`);
    return { initialDirectory, config, locationType };
}

function getRelativePath(initialDirectory, config, locationType) {
    if (!config?.[type]?.[locationType]) return null;

    const effectiveDir = config[type][locationType] === solutionFolderMarker
        ? getSolutionDir(initialDirectory)
        : config[type][locationType];
    log(`effectiveDir: "${effectiveDir}"`);

    // We traverse two levels up, because the Node.js Extensions NPM package is located at
    // ./node_modules/nodejs-extensions.
    const effectivePath = path.resolve(initialDirectory, effectiveDir);

    // On Windows return a relative path because it'll be much shorter than the absolute one; to avoid too long commands.
    return (process.platform === 'win32') ? path.relative(process.cwd(), effectivePath) : effectivePath;
}

// Writing the existing path to stdout lets us consume it at the call site. If the path doesn't exist we return an error
// message and output nothing. Also, we replace '\' with '/' because postcss chokes on the backslashes 🤢.
try {
    const { initialDirectory, config, locationType } = getPathContext();
    const relativePath = getRelativePath(initialDirectory, config, locationType);
    const normalizedPath = relativePath?.replace(/\\/g, '/');
    let result = '!';

    if (normalizedPath) {
        if (locationType === TARGET) {
            result = normalizedPath;
        }
        else if (extension === 'md') {
            result = locationType === solutionFolderMarker ? locationType : normalizedPath;
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
