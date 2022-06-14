/**
 * @summary A wrapper script to allow minification per file as opposed to minification into a single output file.
 */
const fs = require('fs');
const path = require('path');
const exec = require('child_process').exec;

// Get the target folder from the invocation.
const args = process.argv.splice(2);

if (args.length !== 1) {
    throw Error('Please provide the folder to process as the only argument.');
}

const workingDir = args[0];

// Go up two levels into the consumer project's root.
process.chdir(workingDir);

console.debug(`Minifying ${process.cwd()}.`);

fs.readdir('.', (error, files) => {
    files.forEach((file) => {
        if (!file.endsWith('.js') || file.endsWith('.min.js')) return;

        const destination = path.basename(file, '.js') + '.min.js';

        // Prefer the terser CLI for simplicity over the API. See https://github.com/terser/terser for more information.
        const command =
            `terser "${file}" --output "${destination}" --compress --mangle --source-map "content=inline,url='${destination}'"`;

        exec(command, (err, stdout, stderr) => {
            if (err) {
                console.error(`${file}: ${err}`);
            }
            else {
                // Print the *entire* stdout and stderr (buffered).
                stdout && console.log(`${file}: ${stdout}`);
                stderr && console.log(`${file}: ${stderr}`);
            }
        });
    });
});
