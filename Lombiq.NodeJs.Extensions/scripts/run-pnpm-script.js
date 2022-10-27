const fs = require('fs');
const path = require('path');
const { execSync, exec } = require('child_process');

const { handleErrorObject } = require('./handle-error');

function panic(message) {
    handleErrorObject(message);
    process.exit(1);
}

// Check if pnpm is installed.
try { execSync('pnpm -v'); }
catch (_) { panic('This project requires pnpm. You can install it with the "npm install --global pnpm" command.'); }

// Load command line arguments.
const args = process.argv.splice(2);
if (args.length < 2) panic('USAGE: node scripts/run-pnpm-script project-path script');

// Initialize variables.
const [projectPath, script] = args;
const packageJsonPath = path.join(projectPath, 'package.json');

function call(command) {
    process.stdout.write(`Executing "${command}"...`);

    return new Promise((resolve, reject) => {
        exec(command, { }, function (error, stdout, stderr) {
            process.stdout.write(stdout);
            process.stderr.write(stderr);
            (error ? reject : resolve)(error);
        });
    });
}

function callScriptInLibrary(script) {
    return call('npm explore nodejs-extensions -- pnpm ' + script);
}

async function main() {
    // Create the package.json file if it doesn't exist.
    if (!fs.existsSync(packageJsonPath)) {
        panic(`Couldn't find "${packageJsonPath}".`);
    }

    // Go to project directory and read the package.json file to find the scripts.
    process.chdir(projectPath);
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, { encoding: 'utf8' }));
    const scripts = packageJson.scripts ?? { };

    // Handle copy:assets which is a special case during build/compile.
    if ((script === 'build' || script === 'compile') && Array.isArray(packageJson.nodejsExtensions?.assetsToCopy)) {
        await callScriptInLibrary('copy:assets');
    }

    // The named script exists.
    if (script in scripts) {
        await call('pnpm run ' + script);
        return;
    }

    const prefixedScriptTasks = Object
        .entries(scripts)
        .filter(([key, _]) => key.startsWith(script + ':'))
        .map(([_, command]) => call(command));

    // There are scripts with this prefix, for example if script is "build" there is "build:scripts" and "build:styles".
    if (prefixedScriptTasks.length > 0) {
        await Promise.all(prefixedScriptTasks);
        return;
    }

    // Fall back to just using NodeJS Extensions.
    await callScriptInLibrary(script);
}

main().catch(panic);
