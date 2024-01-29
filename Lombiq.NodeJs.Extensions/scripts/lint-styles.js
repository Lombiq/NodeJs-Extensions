/* eslint-disable-next-line import/no-unresolved -- ESLint does not know where to find external modules. */
const stylelint = require('stylelint');

const { handleWarningObject, handleErrorMessage } = require('./handle-error');

function formatResult(result) {
    if (result.ignored) return;

    result.warnings?.forEach((warning) => handleWarningObject({
        message: warning.text,
        code: warning.rule,
        path: result.source,
        line: warning.line,
        column: warning.column,
    }));

    result.deprecations?.forEach((deprecation) => handleWarningObject({
        message: `${deprecation.text} (${deprecation.reference})`,
        code: 'stylelint-deprecation',
        path: result.source,
    }));

    result.invalidOptionWarnings?.forEach((warning) => handleWarningObject({
        message: warning.text,
        code: 'stylelint-invalid-option',
        path: result.source,
    }));

    result.parseErrors?.forEach((error) => handleWarningObject({
        message: JSON.stringify(error),
        code: 'stylelint-parse-error',
        path: result.source,
    }));
}

const options = {
    files: process.argv.length > 2 ? process.argv[2] : '**/*.scss',
    formatter: (results) => results.forEach(formatResult),
};

stylelint
    .lint(options)
    .catch((error) => {
        handleErrorMessage(error);
        process.exit(1);
    });
