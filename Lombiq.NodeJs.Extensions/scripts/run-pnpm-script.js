const fs = require('fs');
const path = require('path');
const { EOL } = require("os");
const { exec } = require('child_process');

const panic = require('./handle-error').handleErrorObjectAndExit;

const npmMissingError = 'PNPM is not installed. Please check the prerequisites for Lombiq Node.js Extensions at ' +
    'https://github.com/Lombiq/NodeJs-Extensions#prerequisites';

function writeLine(message, stream = 'stdout') {
    process[stream].write(message.toString() + EOL);
}

function writeError(message) {
    writeLine(message, 'stderr')
}

// Check if pnpm is installed.
async function throwIfPnpmIsNotInstalled() {
    for (let i = 1; i <= 10; i++) {
        try {
            return await call('pnpm -v');
        } catch (error) {
            if (i === 10) panic(npmMissingError);

            if (error?.stderr?.toString()?.includes('Access is denied')) {
                // It is okay to have a relatively long wait time here. It still adds up to less than a minute and if
                // this fails the whole build will fail anyway. It's not worth to have short waits, because previously
                // we noted that 2 seconds wasn't enough to clear the problem.
                writeError(`PNPM seems to exist but couldn't be accessed. (This was attempt #${i}.) It may be used ` +
                    'by another process. Waiting 5 seconds to give time for the process to be released');
                await new Promise((resolve) => setTimeout(resolve, 5000));
            }
        }
    }
}

// Load command line arguments.
const args = process.argv.slice(2);
if (args.length < 2) panic('USAGE: node scripts/run-pnpm-script <project-path> <script-name>');

// Initialize variables.
const [projectPath, script] = args;
const packageJsonPath = path.join(projectPath, 'package.json');
process.env.LOMBIQ_NODEJS_EXTENSIONS_PROJECT_DIRECTORY = projectPath;

function call(command) {
    writeLine(`Executing "${command}"...`);

    return new Promise((resolve, reject) => {
        exec(command, { }, (error, stdout, stderr) => {
            writeLine(stdout);
            writeError(stderr);
            (error ? reject : resolve)(error);
        });
    });
}

function callScriptInLibrary(scriptToExecute) {
    return call('npm explore nodejs-extensions -- pnpm ' + scriptToExecute);
}

async function main() {
    await throwIfPnpmIsNotInstalled();

    // Ensure the package.json file exists.
    if (!fs.existsSync(packageJsonPath)) {
        panic(`Couldn't find "${packageJsonPath}".`);
    }

    // Go to project directory and read the package.json file to find the scripts.
    process.chdir(projectPath);
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, { encoding: 'utf8' }));
    const scripts = packageJson.scripts ?? { };

    // The named script exists.
    if (script in scripts) {
        await call('pnpm ' + script);
        return;
    }

    const prefixedScriptTasks = Object
        .entries(scripts)
        .filter(([key]) => key.startsWith(script + ':'))
        .map((pair) => call(pair[1]));

    // There are scripts with this prefix, for example if script is "build" there is "build:scripts" and "build:styles".
    if (prefixedScriptTasks.length > 0) {
        await Promise.all(prefixedScriptTasks);
        return;
    }

    // Fall back to just using NodeJS Extensions.
    await callScriptInLibrary(script);
}

main().catch(panic);
