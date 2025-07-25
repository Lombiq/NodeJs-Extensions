import fs from 'fs';
import path from 'path';
import process from 'process';

import { globScripts } from './glob-files.js';
import { lintCode } from './lint-code.mjs';
import { handleErrorObjectAndExit } from './handle-error.js';

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
