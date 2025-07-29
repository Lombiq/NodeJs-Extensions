/* eslint-disable import/no-unresolved -- ESLint does not know where to find external modules. */
import babel from '@babel/core';
import path from 'path';
import process from 'process';

import { minify } from 'terser';
import { promises as fsPromises } from 'fs';
const { readFile, writeFile, mkdir } = fsPromises;

import { globScripts } from './glob-files.js';
import { handleErrorObjectAndExit } from './handle-error.js';

const [sourcePath, destinationPath, configPath] = process.argv.slice(2);

function readJsonConfig(fileName) {
    return readFile(path.join(configPath, fileName), 'utf8')
        .then((text) => JSON.parse(text));
}

async function compileScripts() {
    const browserConfig = readJsonConfig('babel.config.json');
    const moduleConfig = readJsonConfig('babel.module.config.json');
    const scriptFiles = await globScripts(sourcePath);

    for (let i = 0; i < scriptFiles.length; i++) {
        const {filePath, isModule} = scriptFiles[i];
        const config = isModule ? moduleConfig : browserConfig;
        const result = await babel.transformFileAsync(filePath, config);

        const destinationFilePath = path.join(destinationPath, path.relative(sourcePath, filePath));
        await mkdir(path.dirname(destinationFilePath), { recursive: true });
        await writeFile(destinationFilePath, result.code);

        const minifiedPath = destinationFilePath.replace(/\.([cm]?js)$/, '.min.$1');
        const sourceMapOptions = { content: 'inline', url: path.basename(minifiedPath) + '.map' };
        const minifiedCode = await minify(result.code, { sourceMap: sourceMapOptions });
        await writeFile(minifiedPath, minifiedCode.code);
        await writeFile(minifiedPath + '.map', minifiedCode.map);
    }
}

compileScripts().catch(handleErrorObjectAndExit);
