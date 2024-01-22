const fs = require('fs');
const path = require('path');
const { EOL } = require("os");
const { execSync, exec } = require('child_process');

const { handleErrorObject, handleWarningObject } = require('./handle-error');

const npmMissingError = 'PNPM is not installed. Please check the prerequisites for Lombiq Node.js Extensions at ' +
    'https://github.com/Lombiq/NodeJs-Extensions#prerequisites';

function writeLine(message, stream = 'stderr') {
    process[stream].write(message.toString() + EOL);
}

function panic(message) {
    handleErrorObject(message);
    process.exit(1);
}

// Check if pnpm is installed.
try { writeLine(execSync('pnpm -v'), 'stdout'); }
catch (error) {
    // In a GitHub environment displaying errors won't suppress logs as it usually does in IDEs, so it's fine to leave
    // this warning in case this actually becomes a problem.
    if ('GITHUB_ENV' in process.env) {
        writeLine(error.stderr);
        writeLine('::warning::Could not execute the "pnpm -v" command. This could be innocent, but if you face any ' +
            'further errors then please verify your logs as most likely ' + npmMissingError);
    }
    else {
        panic(npmMissingError);
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
    process.stdout.write(`Executing "${command}"...${EOL}`);

    return new Promise((resolve, reject) => {
        exec(command, { }, (error, stdout, stderr) => {
            process.stdout.write(stdout);
            process.stderr.write(stderr);
            (error ? reject : resolve)(error);
        });
    });
}

function callScriptInLibrary(scriptToExecute) {
    return call('npm explore nodejs-extensions -- pnpm ' + scriptToExecute);
}

async function main() {
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
