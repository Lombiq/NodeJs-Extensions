/**
 * @summary Helper functions to display MSBuild-compatible warnings and errors.
 */

const os = require('os');

function handleErrorObjectInner(error, type, defaultCode) {
    if (!error) {
        return handleErrorObjectInner(Error('Missing error argument'), 'error', 'META-ERROR');
    }

    const code = error.code || defaultCode;
    const path = error.path || 'no-path';
    const message = (error.message || error)?.toString().replace(/^error[ :]+/i, '');
    const line = 'line' in error && error.line !== undefined ? error.line : 1;
    const column = 'column' in error && error.column !== undefined ? error.column : 1;

    let output = `${os.EOL}${path}(${line},${column}): ${type} ${code}: ${message}${os.EOL}`;
    if (error.stack) output += error.stack + os.EOL;
    process.stderr.write(output);

    return error;
}

/**
 * Displays an MSBuild error from an object.
 * @param error The object describing the error. Must have a `message` property or `toString` implementation. It may
 *              also have `code`, `path`, `line`, `column` and `stack` properties.
 * @param defaultCode If `error.code` is not available then this value is used.
 */
function handleErrorObject(error, defaultCode = 'ERROR') {
    return handleErrorObjectInner(error, 'error', defaultCode);
}

/**
 * Displays an MSBuild warning from an object.
 * @param error The object describing the warning. Must have a `message` property or `toString` implementation. It may
 *              also have `code`, `path`, `line`, `column` and `stack` properties.
 * @param defaultCode If `error.code` is not available then this value is used.
 */
function handleWarningObject(error, defaultCode = 'WARN') {
    return handleErrorObjectInner(error, 'warning', defaultCode);
}

/**
 * Displays an MSBuild error from a message.
 * @param message This value is converted to `string` before it's displayed.
 */
function handleErrorMessage(message) { return handleErrorObject({ message: message.toString() }); }

/**
 * Displays an MSBuild warning from a message.
 * @param message This value is converted to `string` before it's displayed.
 */
function handleWarningMessage(message) { return handleWarningObject({ message: message.toString() }); }

/**
 * Catches the promise if it's rejected and displays the value with handleWarningObject.
 * @param promise The promise to handle.
 * @param panic If true, the process is terminated with exit code 1.
 */
function handlePromiseRejectionAsError(promise, panic = false) {
    return promise
        .catch((error) => {
            handleErrorObject(error ?? new Error("An unknown error has occurred during promise resolution"));
            if (panic) process.exit(1);
            return error;
        });
}

module.exports = {
    handleErrorObject,
    handleWarningObject,
    handleErrorMessage,
    handleWarningMessage,
    handlePromiseRejectionAsError
};
