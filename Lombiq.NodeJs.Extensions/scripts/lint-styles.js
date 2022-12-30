const stylelint = require('stylelint');
const { handleWarningObject, handleErrorMessage, handleWarningMessage } = require('./handle-error');

function isFailed(result) {
    return !result.ignored && (
        result.errored ||
        result.warnings?.length ||
        result.deprecations?.length ||
        result.invalidOptionWarnings?.length ||
        result.parseErrors?.length);
}

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
    .then((lint) => {
        if (!Array.isArray(lint.results)) return;

        const failed = lint.results.filter(isFailed);
        if (failed.length === 0) return;

        handleWarningMessage('Style linting failed on files: ' + failed
            .map((result) => result.source)
            .join(', '));
    })
    .catch((error) => {
        handleErrorMessage(error);
        process.exit(1);
    });
