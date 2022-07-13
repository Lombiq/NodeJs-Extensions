/**
 * @summary A wrapper script to allow minification per file as opposed to minification into a single output file.
 */

/* eslint-disable no-console -- Writing to the console is part of the functionality of this script. */

const path = require('path');
const exec = require('child_process').exec;

/* eslint-disable-next-line import/no-unresolved -- ESLint does not know where to find external modules; ignore. */
const walk = require('klaw');

// Get the target folder from the invocation.
const args = process.argv.splice(2);

if (args.length !== 1) {
    throw Error('Please provide the folder to process as the only argument.');
}

// Switch to the desired working directory.
process.chdir(args[0]);

const workingDir = process.cwd();

console.debug(`Minifying files in "${workingDir}" ...`);

const fsItems = [];
// Walk the directory tree.
walk(workingDir)
    .on('data', (item) => fsItems.push(item))
    .on('end', () => {
        fsItems.forEach((item) => {
            const isFile = item.stats.isFile();
            const filePath = item.path;

            // We only care for .js files.
            if (!isFile || !filePath.endsWith('.js') || filePath.endsWith('.min.js')) return;

            const destination = path.join(path.dirname(filePath), path.basename(filePath, '.js') + '.min.js');
            const sourceMapUrl = path.basename(destination) + '.map';

            // Prefer the terser CLI for simplicity over the API. See https://github.com/terser/terser for details.
            const command = [
                'terser',
                `"${filePath}"`,
                `--output "${destination}"`,
                '--compress',
                '--mangle',
                `--source-map "content=inline,url='${sourceMapUrl}'"`,
            ].join(' ');

            exec(command, (err, stdout, stderr) => {
                if (err) {
                    console.error(`${filePath}: ${err}`);
                }
                else {
                    // Print the *entire* stdout and stderr (buffered).
                    stdout && console.log(`${filePath}: ${stdout}`);
                    stderr && console.log(`${filePath}: ${stderr}`);
                }
            });
        });

        console.log('Done minifying.');
    });
