const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const { handleErrorMessage } = require('./handle-error');

function panic(message) {
    handleErrorMessage(message);
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

function main() {
    // Create the package.json file if it doesn't exist.
    if (!fs.existsSync(packageJsonPath)) {
        panic(`Couldn't find "${packageJsonPath}".`);
    }

    // Go to project directory and read the package.json file to find the scripts.
    process.chdir(projectPath);
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, { encoding: 'utf8' }));
    const scripts = packageJson.scripts ?? { };

    // Handle copy:assets which is a special case during build/compile.
    if ((script === 'build' || script === 'compile') && 'assetsToCopy' in packageJson) {
        execSync('npm explore nodejs-extensions -- pnpm copy:assets');
    }

    // The named script exists.
    if (script in scripts) {
        execSync('pnpm run ' + script);
        return;
    }

    const prefixedScripts = Object
        .entries(scripts)
        .filter((pair) => pair[0].startsWith(script + ':'));

    // There are scripts with this prefix, for example if script is "build" there is "build:scripts" and "build:styles".
    if (prefixedScripts.length > 0) {
        for (const pair of prefixedScripts) {
            execSync(pair[1]);
        }

        return;
    }

    // Fall back to just using NodeJS Extensions.
    execSync('npm explore nodejs-extensions -- pnpm ' + script);
}

try {
    main();
}
catch (error) {
    panic(error);
}
