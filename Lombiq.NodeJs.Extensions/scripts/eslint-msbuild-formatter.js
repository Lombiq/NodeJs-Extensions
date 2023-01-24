const { handleWarningObject, handleErrorObject } = require('./handle-error');

function formatter(results) {
    results.forEach(
        (result) => {
            result.messages?.forEach(
                (message) => {
                    // See https://eslint.org/docs/latest/developer-guide/nodejs-api#-lintmessage-type for details.
                    const isWarning = message.severity === 1 && message.fatal !== true;
                    const handle = isWarning ? handleWarningObject : handleErrorObject;
                    handle({
                        message: message.fix
                            ? `${message.message} (An automatic fix is available with the ESLint CLI.)`
                            : message.message,
                        code: message.ruleId,
                        path: result.filePath,
                        line: message.line,
                        column: message.column,
                    });
                });
        });

    // The return value is irrelevant. This formatter always outputs directly to standard output because it's meant to
    // be consumed by the IDE via MSBuild. A return value is provided anyway, because ESLint formatters expect it.
    return '';
}

module.exports = { formatter };
