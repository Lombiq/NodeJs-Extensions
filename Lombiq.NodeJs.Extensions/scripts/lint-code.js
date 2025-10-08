import path from 'path';
import { ESLint } from 'eslint';

import { formatter } from './eslint-msbuild-formatter.js';
import { handleErrorMessage } from './handle-error.js';
import { getProjectDirectory } from './get-project-directory.js';

function getSourceType(filePath) {
    const parts = filePath.split('.');
    const extension = parts[parts.length - 1].toLowerCase();

    return extension === 'mjs' ? 'module' :
           extension === 'cjs' ? 'commonjs' :
           undefined;
}

export async function lintCode(code, id, firstRow = 1, overrideConfig = {}) {
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

    formatter(results);
}
