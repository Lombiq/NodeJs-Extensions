const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const { handleErrorObject } = require('./handle-error');

const configPath = path.resolve(__dirname, '..', 'config', 'consumer', 'package.global.json');
const devDependencies = JSON.parse(fs.readFileSync(configPath)).devDependencies;
const packages = Object
    .entries(devDependencies)
    .map(([name, version]) => `${name}@${version}`)
    .join(' ');

// Ensure each of the default development dependencies are installed. If they already are, this finishes very quickly.
// It is necessary, because by default NPM and PNPM don't install the dependencies of local packages, see here:
// https://docs.npmjs.com/cli/v9/configuring-npm/package-json#local-paths
try {
    execSync('pnpm install --save-dev ' + packages);
}
catch (exception) {
    process.stderr.write('Failed to install packages: ' + packages);
    handleErrorObject(exception);
    process.exit(1);
}
