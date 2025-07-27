/**
 * @summary A helper function to recursively search for files (matched with regular expressions) while skipping the
 *          excluded directories.
 * @description Returns an array of absolute paths inside the provided startPath which match the includeFiles and aren't
 *              located in a directory that matches the excludeDirectories.
 */
import fs from 'fs';
import path from 'path';

/**
 * Searches the start path and all of its subdirectories for files matching the provided file name regular expressions.
 * @param startPath {string} The path of the search root directory.
 * @param includeFiles {RegExp[]} If any matches against the file name, then it's included in the results.
 * @param excludeDirectories {RegExp[]} If any matches against the directory name, then none of its files or
 *                                      subdirectories are checked.
 * @returns {string[]} The resolved file paths.
 */
export function findRecursively(startPath, includeFiles, excludeDirectories) {
    const results = [];

    function addIfInclude(parentPath, fileEntity) {
        if (includeFiles.some((include) => fileEntity.name.match(include))) {
            results.push(path.resolve(parentPath, fileEntity.name));
        }
    }

    function findInner(here) {
        const segments = here.split(/[\\/]+/);
        const name = segments[segments.length - 1];

        if (excludeDirectories.some((exclude) => name.match(exclude))) return;

        fs.readdirSync(here, { withFileTypes: true }).forEach((child) => (child.isDirectory()
            ? findInner(path.join(here, child.name))
            : addIfInclude(here, child)));
    }

    findInner(startPath);

    return results;
}

export default findRecursively;
