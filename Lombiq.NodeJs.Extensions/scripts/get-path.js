/**
 * @summary A helper script to return the target directory to run our scripts in - the consumer project's JS folder.
 * @description This has become necessary due to inconsistent, OS-dependent handling of the broken directory traversal
 *              via '..' in the shell used by pnpm.
 */
const fs = require('fs');
const path = require('path');

const args = process.argv.splice(2);
const type = process.args[0];

if (type !== 'js' && type !== 'scss') {
    throw Error('Please provide the folder to process as the only argument.');
}

const jsSourceKey = 'npm_config_js_source';
const sourceDir = process.env[jsSourceKey] || 'Assets/Scripts';
const sourcePath = path.resolve(process.cwd(), '..', '..', sourceDir);

process.stdout.write(fs.existsSync(sourcePath) ? sourcePath : '!');
