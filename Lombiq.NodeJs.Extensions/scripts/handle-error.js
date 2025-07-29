/**
 * @summary Helper functions to display MSBuild-compatible warnings and errors.
 */

import fs from 'fs';
import os from 'os';
import { join as pathJoin, relative as pathRelative } from 'path';

function handleErrorObjectForGitHub(type, code, message, path, line, column) {
    const parameters = ['title=' + code];
    const gitHubActionsRoot = process.env.LOMBIQ_NODEJS_EXTENSIONS_GITHUB_ACTIONS_ROOT;

    let updatedMessage = message?.trim() ? message : code;

    if (path) {
        const file = gitHubActionsRoot ? pathRelative(gitHubActionsRoot, path) : path;
        parameters.push('file=' + file);
        parameters.push('line=' + line);
        parameters.push('col=' + column);

        // Occasionally, GitHub won't include the message in the Annotations box of the summary. This usually happens if
        // the file is in a Git submodule, but sometimes also if the workflow step terminated with a non-zero exit code.
        // In this case, the logs won't contain the additional formatting information, just the message itself, so the
        // path has to be appended to the message.
        updatedMessage = `[${code}] ${updatedMessage.trim()} at ${file}:${line}:${column}`;
    }

    process.stderr.write(`${os.EOL}::${type} ${parameters.join(',')}::${updatedMessage}${os.EOL}`);

    if (type === 'error') {
        const stampFile = pathJoin(gitHubActionsRoot ?? '', 'github.error');
        fs.writeFileSync(stampFile, '');
    }
}

function handleErrorObjectInner(error, type, defaultCode) {
    if (!error) {
        return handleErrorObjectInner(Error('Missing error argument'), 'error', 'META-ERROR');
    }

    // Normalize error input into an object.
    if (typeof error !== 'object') {
        return handleErrorObjectInner({ message: error }, 'error', 'META-ERROR');
    }

    // Check if warnings should be replaced with errors.
    if (type !== 'error' && process.env.LOMBIQ_NODEJS_EXTENSIONS_WARN_AS_ERROR?.toLowerCase() === 'true') {
        return handleErrorObjectInner(error, 'error', defaultCode);
    }

    const isErrorObject = isErrorWithStack(error);
    const code = error.code || defaultCode;
    const message = isErrorObject
        ? error.stack
        : (error.message?.toString() ?? JSON.stringify(error)).replace(/^error[ :]+/i, '');
    let line = 'line' in error && error.line !== undefined && `${error.line}` !== 'NaN' ? error.line : 1;
    let column = 'column' in error && error.column !== undefined && `${error.column}` !== 'NaN' ? error.column : 1;

    if (process.env.LOMBIQ_NODEJS_EXTENSIONS_GITHUB_ACTIONS?.toLowerCase() === 'true') {
        handleErrorObjectForGitHub(type, code, message, error.path, line, column);
        return error;
    }

    const path = error.path || 'no-path';

    let output = `${os.EOL}${path}(${line},${column}): ${type} ${code}: ${message}${os.EOL}`;
    if (error.stack) output += error.stack + os.EOL;

    process.stderr.write(output);

    // If there is no path information, try to provide additional context.
    if (!isErrorObject && error.messageOnly !== true && path === 'no-path') {
        if (error.toString() !== '[object Object]') process.stderr.write(error + '\n');
        process.stderr.write(`Current Stack Trace: ${JSON.stringify(error)}\n${new Error().stack}\n`);
    }

    return error;
}

/**
 * Displays an MSBuild error from an object.
 * @param error The object describing the error. Must have a `message` property or `toString` implementation. It may
 *              also have `code`, `path`, `line`, `column` and `stack` properties.
 * @param defaultCode If `error.code` is not available then this value is used.
 */
export function handleErrorObject(error, defaultCode = 'ERROR') {
    return handleErrorObjectInner(error, 'error', defaultCode);
}

/**
 * Displays an MSBuild warning from an object.
 * @param error The object describing the warning. Must have a `message` property or `toString` implementation. It may
 *              also have `code`, `path`, `line`, `column` and `stack` properties.
 * @param defaultCode If `error.code` is not available then this value is used.
 */
export function handleWarningObject(error, defaultCode = 'WARN') {
    return handleErrorObjectInner(error, 'warning', defaultCode);
}

function isErrorWithStack(value) {
    return !!(JSON.stringify(value) === '{}' && value.stack?.toString());
}

function convertMessageToObject(message) {
    let text = message.toString();

    if (isErrorWithStack(message)) {
        text += '\n' + message.stack;
    }

    return { message: text, messageOnly: true };
}

/**
 * Displays an MSBuild error from a message.
 * @param message This value is converted to `string` before it's displayed.
 */
export function handleErrorMessage(message) { return handleErrorObject(convertMessageToObject(message)); }

/**
 * Displays an MSBuild warning from a message.
 * @param message This value is converted to `string` before it's displayed.
 */
export function handleWarningMessage(message) { return handleWarningObject(convertMessageToObject(message)); }

/**
 * Catches the promise if it's rejected and displays the value with handleErrorObject.
 * @param promise The promise to handle.
 * @param panic If true, the process is terminated with exit code 1.
 */
export function handlePromiseRejectionAsError(promise, panic = false) {
    return promise
        .catch((error) => {
            handleErrorObject(error ?? new Error('An unknown error has occurred during promise resolution'));
            if (panic) process.exit(1);
            return error;
        });
}

export function handleErrorObjectAndExit(error, defaultCode = 'ERROR') {
    handleErrorObject(error, defaultCode);
    process.exit(1);

    // Only needed to avoid the "Void function result is used" warning when using it with the null coalescing operator.
    return error;
}

export default {
    handleErrorMessage,
    handleErrorObjectAndExit,
    handleErrorObject,
    handlePromiseRejectionAsError,
    handleWarningMessage,
    handleWarningObject,
};
