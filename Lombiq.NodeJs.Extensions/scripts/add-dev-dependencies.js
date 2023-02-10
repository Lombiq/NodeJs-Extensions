const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const { handleErrorObject } = require('./handle-error');

const configPath = path.resolve(__dirname, '..', 'package.json');
const nxDevDependencies = JSON.parse(fs.readFileSync(configPath)).devDependencies;
const eslintPackages = Object
    .entries(nxDevDependencies)
    .filter(([name]) => name.startsWith('eslint'))
    .map(([name, version]) => `${name}@"${version}"`)
    .join(' ');

// We need to install the ESLint plugin packages in the same folder that the active ESLint configuration file is located
// in for ESLint to actually find and use them. We manage them in Node.js Extensions' package.json file to avoid
// repetition inconsistencies across modules.
try {
    execSync('pnpm add --save-dev ' + eslintPackages);
}
catch (exception) {
    process.stderr.write('Failed to install packages: ' + eslintPackages);
    handleErrorObject(exception);
    process.exit(1);
}
