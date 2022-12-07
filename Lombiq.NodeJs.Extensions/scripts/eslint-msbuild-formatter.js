const { handleWarningObject } = require('./handle-error');

function formatter(results) {
    results.forEach(
        (result) => result.messages?.forEach(
            (warning) => handleWarningObject({
                message: warning.fix
                    ? `${warning.message} (An automatic fix is available with the ESLint CLI.)`
                    : warning.message,
                code: warning.ruleId,
                path: result.filePath,
                line: warning.line,
                column: warning.column,
            })));

    // The return value is irrelevant. This formatter always outputs directly to standard output because it's meant to
    // be consumed by the IDE via MSBuild. A return value is provided anyway, because ESLint formatters expect it.
    return '';
}

module.exports = { formatter };
