/**
 * @summary A helper script to return the respective directories to run our scripts in.
 * @description Returns paths based on optional parameters and default fallback values. This script also ensures
 *              OS-independent handling of the broken directory traversal via '..' in the shell used by pnpm.
 */
const fs = require('fs');
const path = require('path');

const defaults = {
    js_source: 'Assets/Scripts',
    js_target: 'wwwroot/js',
    scss_source: 'Assets/Styles',
    scss_target: 'wwwroot/css',
};

const args = process.argv.splice(2);

const type = args[0];
if (type !== 'js' && type !== 'scss') {
    throw Error('Please provide the type of files to process as the first argument: \'js\' or \'scss\'.');
}

const location = args[1];
if (location !== 'source' && location !== 'target') {
    throw Error('Please provide the location to retrieve as the second argument: \'source\' or \'target\'.');
}

const configuration = `${type}_${location}`;

// The npm_config_* environment variables are automatically created when passing arguments to scripts; e.g.
// --js-source=my/path will lead to the existence of npm_config_js_source=my/path.
const envKey = `npm_config_${configuration}`;
const effectiveDir = process.env[envKey] || defaults[configuration];

// We traverse two levels up, because the Node.js Extensions npm package is located at ./node_modules/nodejs-extensions.
const effectivePath = path.resolve(process.cwd(), '..', '..', effectiveDir);

// Return a relative path because it'll be much shorter than the absolute one; to avoid too long commands.
const relativePath = path.relative(process.cwd(), effectivePath);

// Writing the existing path to stdout lets us consume it at the call site. If source does not exist, we return '!'.
process.stdout.write((location === 'target' || fs.existsSync(relativePath)) ? relativePath : '!');
