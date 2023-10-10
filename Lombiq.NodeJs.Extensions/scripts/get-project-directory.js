/**
 * @summary A helper script to return the current project's location (the directory where the package.json file is).
 * @description It uses the "npm_config_local_prefix" environment variable which NPM automatically exports. A fallback
 * is provided using the grandparent of the current working directory, although that should never be necessary.
 */

function getProjectDirectory() {
    return process.env.npm_config_local_prefix ?? path.join(require('./get-cwd')(), '..', '..');
}

module.exports = getProjectDirectory;
