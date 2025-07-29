import { ESLint } from 'eslint';

import { formatter } from './eslint-msbuild-formatter.js';
import { getProjectDirectory } from './get-project-directory.js';

function getSourceType(id) {
    const parts = `${id}`.replace(/\?.*/, '').split('.');
    const extension = parts[parts.length - 1].toLowerCase();

    return extension === 'mjs' ? 'module' :
           extension === 'cjs' ? 'commonjs' :
           undefined;
}

export async function lintCode(code, id, firstRow = 1) {
    const options = {
        cwd: getProjectDirectory(),
        overrideConfig: {
            languageOptions: {
                sourceType: getSourceType(id),
            }
        }
    };

    const eslint = new ESLint(options);
    const results = await eslint.lintText(code, { filePath: id });

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
