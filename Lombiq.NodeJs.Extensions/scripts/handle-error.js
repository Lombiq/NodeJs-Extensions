/**
 * @summary Helper functions to display errors in the format MSBuild can understand.
 */

const os = require('os');

function handleErrorObjectInner(error, type, defaultCode) {
    if (!error) {
        handleErrorObjectInner(Error('Missing error argument'), 'error', 'META-ERROR');
        return;
    }

    const code = error.code || defaultCode;
    const path = error.path || 'no-path';
    const message = (error.message || error)?.toString().replace(/^error[ :]+/i, '');
    const line = 'line' in error ? error.line : 1;
    const column = 'column' in error ? error.column : 1;

    let output = `${os.EOL}${path}(${line},${column}): ${type} ${code}: ${message}${os.EOL}`;
    if (error.stack) output += error.stack + os.EOL;
    process.stderr.write(output);
}

/**
 * @summary Displays an MSBuild error from an object.
 * @param error The object describing the error. Must have a `message` property or `toString` implementation. It may
 *              also have `code`, `path`, `line`, `column` and `stack` properties.
 * @param defaultCode If `error.code` is not available then this value is used.
 */
function handleErrorObject(error, defaultCode = 'ERROR') {
    return handleErrorObjectInner(error, 'error', defaultCode);
}

/**
 * @summary Displays an MSBuild warning from an object.
 * @param error The object describing the warning. Must have a `message` property or `toString` implementation. It may
 *              also have `code`, `path`, `line`, `column` and `stack` properties.
 * @param defaultCode If `error.code` is not available then this value is used.
 */
function handleWarningObject(error, defaultCode = 'WARN') {
    return handleErrorObjectInner(error, 'warning', defaultCode);
}

/**
 * @summary Displays an MSBuild error from a value.
 * @param message This value is converted to `string` before it's displayed.
 */
function handleErrorMessage(message) { handleErrorObject({ message: message.toString() }); }


/**
 * @summary Displays an MSBuild warning from a value.
 * @param message This value is converted to `string` before it's displayed.
 */
function handleWarningMessage(message) { handleWarningObject({ message: message.toString() }); }

module.exports = {
    handleErrorObject,
    handleWarningObject,
    handleErrorMessage,
    handleWarningMessage,
};
