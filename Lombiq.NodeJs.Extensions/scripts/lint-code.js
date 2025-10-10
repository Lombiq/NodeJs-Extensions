const path = require('path');
const { ESLint } = require('eslint');

const { formatter } = require('.nx/scripts/eslint-msbuild-formatter');
const { handleErrorMessage } = require('./handle-error');

function getSourceType(filePath) {
    const parts = filePath.split('.');
    const extension = parts[parts.length - 1].toLowerCase();

    return extension === 'mjs' ? 'module' :
        extension === 'cjs' ? 'commonjs' :
            undefined;
}

async function lintCode(code, id, firstRow = 1, overrideConfig = {}, formatterBeforeHandle = null) {
    if (!code?.trim()) handleErrorMessage('lintCode: Missing "code" parameter.');
    if (!id?.trim()) handleErrorMessage('lintCode: Missing "id" parameter.');
    const filePath = path.resolve(id.split('?')[0]);

    const options = {
        cwd: path.dirname(filePath),
        overrideConfig: { ...overrideConfig }
    };

    if (!options.overrideConfig.languageOptions?.sourceType) {
        if (!options.overrideConfig.languageOptions) options.overrideConfig.languageOptions = {};
        options.overrideConfig.languageOptions.sourceType = getSourceType(filePath);
    }

    const eslint = new ESLint(options);
    const results = await eslint.lintText(code, { filePath });

    if (!Array.isArray(results) || results.length === 0) return;

    for (let i = 0; i < results.length; i++) {
        const result = results[i];

        for (let j = 0; j < result.messages.length; j++) {
            const message = result.messages[j];
            message.line += firstRow - 1;
        }
    }

    formatter(results, formatterBeforeHandle);
}

module.exports = { lintCode };
