/**
 * @summary A helper function to recursively search for files (matched with regular expressions) while not traversing
 *          the excluded directories.
 * @description Returns an array of absolute paths inside the provided startPath that match the includeFiles and isn't
 *              located in a directory that match the excludeDirectories.
 */
const fs = require('fs');
const path = require('path');

function findRecursively(startPath, includeFiles, excludeDirectories) {
    const results = [];

    function addIfInclude(parentPath, fileEntity) {
        if (includeFiles.some((include) => fileEntity.name.match(include))) {
            results.push(path.resolve(parentPath, fileEntity.name))
        }
    }

    function findInner(here) {
        const segments = here.split(/[\\\/]+/);
        const name = segments[segments.length - 1];

        if (excludeDirectories.some((exclude) => name.match(exclude))) return;

        fs.readdirSync(here, { withFileTypes: true }).forEach((child) =>
            child.isDirectory()
                ? findInner(path.resolve(here, child.name))
                : addIfInclude(here, child));
    }

    findInner(path.resolve(startPath));

    return results;
}

module.exports = findRecursively;
