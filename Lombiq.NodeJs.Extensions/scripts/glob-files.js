const { glob } = require('glob');

/**
 * Finds all files in the source path and its subdirectories (excluding "node_modules") with the provided extensions.
 * @param sourcePath {string} The root directory of the search.
 * @param extensions {string[]} The supported extensions.
 * @returns {Promise<string[]>}
 */
async function globFiles(sourcePath, extensions) {
    const scriptFiles = await glob(
        '/**/*.{' + extensions.join(',') + '}',
        { root: sourcePath, ignore: 'node_modules/**' });

    await Promise.all(scriptFiles.map(async (filePath) => {
        return {
            filePath: filePath,
            isModule: filePath.toLowerCase().endsWith('.mjs'),
        }
    }));
}

/**
 * Finds all files in the source path and its subdirectories (excluding "node_modules") with the .js or .mjs extensions.
 * @param sourcePath {string} The root directory of the search.
 * @returns {Promise<{filePath: string, isModule: boolean}[]>}
 */
function globScripts(sourcePath) {
    return globFiles(sourcePath, ['js','mjs'])
        .then((filePaths) => filePaths.map((filePath) => ({
            filePath: filePath,
            isModule: filePath.toLowerCase().endsWith('.mjs'),
        })));
}

module.exports = {
    globFiles,
    globScripts,
};
