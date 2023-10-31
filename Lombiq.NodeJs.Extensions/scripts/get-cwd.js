/**
 * @summary A helper script to return the current working directory, NOT resolving symlinks.
 * @description On non-Windows OSes, the current working directory of a symlinked directory will be reported as the
 *              target of that symlink. For Node.js Extensions, we need to work with the symlinked directory, though.
 */
const os = require('os');
const process = require('process');
const { execSync } = require('child_process');

function getCwd() {
    return os.platform() === 'win32' ? process.cwd() : execSync('pwd').toString().trim();
}

module.exports = getCwd;
