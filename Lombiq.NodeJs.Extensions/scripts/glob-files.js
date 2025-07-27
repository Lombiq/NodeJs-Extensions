import { glob } from 'glob';

/**
 * Finds all files in the source path and its subdirectories (excluding "node_modules") with the provided extensions.
 * @param sourcePath {string} The root directory of the search.
 * @param extensions {string[]} The supported extensions.
 * @returns {Promise<string[]>}
 */
export function globFiles(sourcePath, extensions) {
    return glob(
        '/**/*.{' + extensions.join(',') + '}',
        { root: sourcePath, ignore: 'node_modules/**' });
}

/**
 * Finds all files in the source path and its subdirectories (excluding "node_modules") with the .js or .mjs extensions.
 * @param sourcePath {string} The root directory of the search.
 * @returns {Promise<{filePath: string, isModule: boolean}[]>}
 */
export function globScripts(sourcePath) {
    return globFiles(sourcePath, ['js','mjs'])
        .then((filePaths) => filePaths.map((filePath) => ({
            filePath: filePath,
            isModule: filePath.toLowerCase().endsWith('.mjs'),
        })));
}
