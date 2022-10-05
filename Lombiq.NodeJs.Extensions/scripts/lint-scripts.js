const path = require('path');
const { ESLint } = require("eslint");
const { handleWarningObject, handleErrorMessage } = require('./handle-error');

function formatResult(result) {
    result.messages?.forEach((warning) =>
        handleWarningObject({
            message: warning.fix
                ? `${warning.message} (An automatic fix is available with the ESLint CLI.)`
                : warning.message,
            code: warning.ruleId,
            path: result.filePath,
            line: warning.line,
            column: warning.column,
        }));
}

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
    results.forEach(formatResult);
})().catch((error) => {
    handleErrorMessage(error);
    process.exit(1);
});
