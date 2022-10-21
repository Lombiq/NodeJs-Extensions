const path = require('path');
const { ESLint } = require('eslint');

const formatter = require('./eslint-msbuild-formatter');
const { handleErrorMessage } = require('./handle-error');

const options = {
    cwd: path.resolve(process.argv.length > 2 ? process.argv[2] : '.'),
    errorOnUnmatchedPattern: false,
};

(async function main() {
    // 1. Create an instance.
    const eslint = new ESLint(options);

    // 2. Lint files.
    const results = await eslint.lintFiles('./**/*.js');
    if (!Array.isArray(results) || results.length === 0) return;

    // 3. Format the results.
    formatter(results);
})().catch((error) => {
    handleErrorMessage(error);
    process.exit(1);
});
