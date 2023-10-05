const fs = require('fs');
const path = require('path');
const process = require('process');
const { execSync } = require('child_process');
const { EOL } = require('os');

const getCwd = require('./get-cwd');
const { handleErrorObject } = require('./handle-error');

const currentDevDependencies = JSON.parse(fs.readFileSync('package.json')).devDependencies;

function isGreaterThanCurrent([name, version]) {
    if (!currentDevDependencies) return true;

    const splitVersion = (text) => (typeof text !== 'string' || !text.match(/^[0-9]/)
        ? null
        : text.split('.').map((item) => parseInt(item, 10)));

    const newVersion = splitVersion(version);
    const oldVersion = splitVersion(currentDevDependencies[name]);

    if (newVersion === null) return false;
    if (oldVersion === null) return true;

    for (let i = 0; i < newVersion.length; i++) {
        if (newVersion[i] > oldVersion[i] || oldVersion[i] === undefined) return true;
        if (Number.isNaN(newVersion[i]) || Number.isNaN(oldVersion[i])) return version > currentDevDependencies[name];
    }

    return false;
}

const configPath = path.resolve(__dirname, '..', 'package.json');
const nxDevDependencies = JSON.parse(fs.readFileSync(configPath)).devDependencies;
const eslintPackages = Object
    .entries(nxDevDependencies)
    .filter(([name, version]) => name !== 'jest' && version)
    .map(([name, version]) => [name, version.replace(/^\s*\^/, '')])
    .filter(isGreaterThanCurrent)
    .map(([name, version]) => `${name}@"${version}"`)
    .join(' ');

// In order for ESLint to find and use the ESLint plugin packages, we need to install them in the folder that ESLint is
// executed in, which is the NE-consuming project's folder. We manage the packages in Node.js Extensions' package.json
// file to avoid repetition and inconsistencies across projects, and to enable automatic upgrades.
try {
    if (eslintPackages) {
        process.stdout.write(`Installing packages using \`${eslintPackages}\`.${EOL}`);
        execSync('pnpm add --save-dev --save-exact ' + eslintPackages);
    }
    else {
        const projectFullPath = path.join(getCwd(), 'package.json');
        process.stdout.write(`All dev dependencies are up to date in "${projectFullPath}".${EOL}`);
    }
}
catch (exception) {
    process.stderr.write(`Failed to install packages: ${eslintPackages}${EOL}`);

    const lines = exception
        .output
        .map((line) => line?.toString()?.replace(/[\r\n]+/g, EOL).replace(/\u2009/g, '').trim())
        .filter((line) => line);

    // There is intentionally no newline between the exception message and the first line, this way the full output is
    // displayed but the first line that will likely contain the error code is included in the MSBuild error message.
    handleErrorObject({
        message: `${exception.message}$ ${lines.join(EOL)}`,
        path: __filename,
    });

    process.exit(1);
}
