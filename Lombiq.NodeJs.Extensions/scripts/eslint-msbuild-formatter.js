const { handleWarningObject, handleErrorObject } = require('./handle-error');

function numberOrOne(value) {
    const number = Number.parseInt(value);
    return Number.isNaN(number) ? 1 : number;
}

function formatter(results) {
    results.forEach(
        (result) => {
            result.messages?.forEach(
                (message) => {
                    const notes = [];

                    if (typeof result.filePath === 'string' && result.filePath.includes('?')) {
                        const queryString = result.filePath.substring(result.filePath.indexOf('?') + 1);
                        notes.push(`(?${queryString})`);
                    }

                    if (message.fix) {
                        notes.push('(An automatic fix is available with the ESLint CLI.)');
                    }

                    const messageText = `${message.message} ${notes.join(' ')}\n${JSON.stringify(message)}\n` +
                        new Error('ESLint call trace').stack.replace(/^Error: /, '');

                    // See https://eslint.org/docs/latest/developer-guide/nodejs-api#-lintmessage-type for details.
                    const isWarning = message.severity === 1 && message.fatal !== true;
                    const handle = isWarning ? handleWarningObject : handleErrorObject;
                    handle({
                        message: messageText,
                        code: message.ruleId,
                        path: result.filePath?.replace(/\?.*$/, ''),
                        line: numberOrOne(message.line),
                        column: numberOrOne(message.column),
                    });
                });
        });

    // The return value is irrelevant. This formatter always outputs directly to standard output because it's meant to
    // be consumed by the IDE via MSBuild. A return value is provided anyway, because ESLint formatters expect it.
    return '';
}

module.exports = { formatter };
