const fs = require('fs');
const path = require('path');
const process = require('process');

const { globScripts } = require('./glob-files');
const { lintCode } = require('./lint-code');
const { handleErrorObjectAndExit } = require('./handle-error');

const sourcePath = path.resolve(process.argv.length > 2 ? process.argv[2] : '.');

(async function main() {
    try {
        const scriptFiles = await globScripts(sourcePath);

        for (let i = 0; i < scriptFiles.length; i++) {
            const {filePath} = scriptFiles[i];
            const code = await fs.promises.readFile(filePath, {encoding: 'utf8'});

            await lintCode(code, filePath);
        }
    }
    catch (error) {
        process.stderr.write(`LINT SCRIPTS:${error}\n${typeof error}\n${JSON.stringify(error)}\n\n`);
        handleErrorObjectAndExit(error);
    }
})();
