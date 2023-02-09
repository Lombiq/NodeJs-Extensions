const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const { handleErrorObject } = require('./handle-error');

const configPath = path.resolve(__dirname, '..', 'package.json');
const nxDependencies = JSON.parse(fs.readFileSync(configPath)).dependencies;
const eslintPackages = Object
    .entries(nxDependencies)
    .filter(([name]) => name.startsWith('eslint'))
    .map(([name, version]) => `${name}@"${version}"`)
    .join(' ');

// Ensure each of the default development dependencies are installed. If they already are, this finishes very quickly.
// It is necessary, because by default NPM and PNPM don't install the dependencies of local packages, see here:
// https://docs.npmjs.com/cli/v9/configuring-npm/package-json#local-paths
try {
    execSync('pnpm add --save-dev ' + eslintPackages);
}
catch (exception) {
    process.stderr.write('Failed to install packages: ' + eslintPackages);
    handleErrorObject(exception);
    process.exit(1);
}
