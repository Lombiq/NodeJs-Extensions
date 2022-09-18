const fs = require('fs');
const path = require('path');
const { ESLint } = require("eslint");
const { handleWarningObject, handleErrorMessage, handleWarningMessage } = require('./handle-error');

process.stdout.write('FORMATTER!1\n');

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

process.stdout.write('FORMATTER!3\n');
(async function main() {
    // 1. Create an instance.
    process.stdout.write('FORMATTER!4\n');
    const eslint = new ESLint(options);

    // 2. Lint files.
    process.stdout.write('FORMATTER!5\n');
    const results = await eslint.lintFiles('./**/*.js');
    process.stdout.write('FORMATTER: ' + JSON.stringify(results) + '!\n');
    if (!Array.isArray(results) || results.length === 0) return;

    // 3. Format the results.
    process.stdout.write('FORMATTER!6\n');
    results.forEach(formatResult);
})().catch((error) => {
    handleErrorMessage(error);
    process.exit(1);
});
