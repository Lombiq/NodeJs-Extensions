const fs = require('fs');
const stylelint = require('stylelint');
const { handleWarningObject, handleErrorMessage, handleWarningMessage } = require('./handle-error');

function formatResult(result) {
    if (result.ignored) return;

    result.warnings.forEach((warning) =>
        handleWarningObject({
            message: warning.text,
            code: warning.rule,
            path: result.source,
            line: warning.line,
            column: warning.column,
        }));

    result.deprecations.forEach((deprecation) =>
        handleWarningObject({
            message: `${deprecation.text} (${deprecation.reference})`,
            code: 'stylelint-deprecation',
            path: result.source,
        }));

    result.invalidOptionWarnings.forEach((warning) =>
        handleWarningObject({
            message: warning.text,
            code: 'stylelint-invalid-option',
            path: result.source,
        }));
}

const options = {
    files: process.argv.length > 0 ? process.argv : '**/*.scss',
    formatter: (results) => results.forEach(formatResult),
};

if (!fs.existsSync('.stylelintrc')) options.config = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, '..', 'Stylelint', 'lombiq-base.stylelintrc.json'), 'utf-8'));

stylelint.lint(options)
    .then((lint) => lint.results?.length
        ? handleWarningMessage('Style linting failed on files: ' + lint
            .results
            .map((error) => error.source)
            .join(', '))
        : true)
    .catch((error) => {
        handleErrorMessage(error);
        process.exit(1);
    })
