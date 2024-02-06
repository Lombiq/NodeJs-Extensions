const babel = require('@babel/core');
const path = require('path');
const process = require('process');

const { glob } = require('glob');
const { minify } = require("terser");
const { readFile, writeFile, mkdir } = require('fs').promises;

const { handleErrorObjectAndExit } = require('./handle-error');

const [ sourcePath, destinationPath, configPath ] = process.argv.slice(2);

function readJsonConfig(fileName) {
    return readFile(path.join(configPath, fileName), 'utf8')
        .then(text => JSON.parse(text));
}

async function compileScripts() {
    const browserConfig = readJsonConfig('babel.config.json');
    const moduleConfig = readJsonConfig('babel.module.config.json');
    const scriptFiles = await glob('/**/*.{js,mjs}', { root: sourcePath, ignore: 'node_modules/**' });

    await Promise.all(scriptFiles.map(async filePath => {
        const config = filePath.toLowerCase().endsWith('.mjs') ? moduleConfig : browserConfig;
        const result = await babel.transformFileAsync(filePath, config);

        const destinationFilePath = path.join(destinationPath, path.relative(sourcePath, filePath))
        await mkdir(path.dirname(destinationFilePath), { recursive: true });
        await writeFile(destinationFilePath, result.code);

        const minifiedPath = destinationFilePath.replace(/\.(m?js)$/, '.min.$1')
        const sourceMapOptions = { content: 'inline', url : path.basename(minifiedPath) + '.map' };
        const minifiedCode = await minify(result.code, { sourceMap: sourceMapOptions });
        await writeFile(minifiedPath, minifiedCode.code);
        await writeFile(minifiedPath + ".map", minifiedCode.map);
    }));
}

compileScripts().catch(handleErrorObjectAndExit);