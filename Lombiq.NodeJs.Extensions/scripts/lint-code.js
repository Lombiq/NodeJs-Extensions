import { ESLint } from 'eslint';

import { formatter } from './eslint-msbuild-formatter.js';

async function lintCode(code, id, firstRow = 1) {
    const eslint = new ESLint({ errorOnUnmatchedPattern: false });
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

export default {
    lintCode,
};
