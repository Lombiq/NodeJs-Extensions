const child_process = require('child_process');
const fs = require('fs');
const path = require('path');

const { handleErrorMessage } = require('./handle-error');

function panic(message) {
    handleErrorMessage(message);
    process.exit(1);
}

// Check if pnpm is installed.
try { child_process.execSync('pnpm -v'); }
catch (_) { panic('This project requires pnpm. You can install it with the "npm install --global pnpm" command.'); }

// Load command line arguments.
const args = process.argv.splice(2);
if (args.length < 2) panic("USAGE: node scripts/run-pnpm-script project-path script")

// Initialize variables.
const [ projectPath, script ] = args;
const packageJsonPath = path.join(projectPath, 'package.json');

console.log('ARGS: ', projectPath, script, packageJsonPath);

try {
    // Handle if the package.json file doesn't exist.
    if (!fs.existsSync(packageJsonPath)) {
        fs.copyFileSync(
            path.resolve('..', 'config', 'consumer', 'package.project.json'),
            packageJsonPath);
    }

    // Go to project directory and read the package.json file to find the scripts.
    process.chdir(projectPath);
    let scripts = JSON.parse(fs.readFileSync(packageJsonPath, { encoding: 'utf8' })).scripts;
    if (!scripts) scripts = { };

    if (script in scripts) {
        child_process.execSync('pnpm run ' + script)
    }
}
catch (error) {
    panic(error)
}
