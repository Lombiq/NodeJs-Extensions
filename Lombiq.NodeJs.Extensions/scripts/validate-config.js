/**
 * @summary Validates the Node.js Extensions configuration object.
 * @description This script validates a configuration object against the format provided in @example.
 * @example "nodejsExtensions": {
 *            "assetsToCopy": [
 *              {
 *                "sources": [ "Assets/Images" ],
 *                "target": "wwwroot/images"
 *              },
 *              {
 *                "sources": [
 *                  "node_modules/marvelous/dist",
 *                  "node_modules/wonderful/bin"
 *                ],
 *                "pattern": "*",
 *                "target": "wwwroot"
 *              }
 *              // more groups, if needed
 *            ],
 *            "markdown": {
*               "source": '.' | '_solution_'
 *            },
 *            "scripts": {
 *              "source": "CustomJsFolder",
 *              "target": "wwwCustomRoot/jay-es"
 *            },
 *            "styles": {
 *              "source": "NonDefaultScssFolder",
 *              "target": "wwwNonDefaultCssFolder"
 *            }
 *          }
 */

const { handleErrorMessage } = require('./handle-error');

function validateAssetGroupsAndLogErrors(assetConfig) {
    if (!Array.isArray(assetConfig)) {
        handleErrorMessage('The configuration must be an array of asset groups of the form: ' +
            '{ sources: Array<string>, pattern: string [optional], target: string }.');
        return false;
    }

    return assetConfig.reduce((success, assetGroup) => {
        const errors = [];
        if (!Array.isArray(assetGroup.sources)) {
            errors.push('sources must be an array of strings');
        }
        if (assetGroup.pattern && typeof assetGroup.pattern !== 'string') {
            errors.push('pattern must be a glob string');
        }
        if (typeof assetGroup.target !== 'string') {
            errors.push('target must be a string');
        }
        if (errors.length > 0) {
            handleErrorMessage(`Invalid asset group: ${JSON.stringify(assetGroup)}: ${errors.join(', ')}.`);
        }
        return (errors.length === 0) && success;
    }, true);
}

function validateSimpleGroupAndLogErrors(group) {
    const errors = [];
    if (typeof group.source !== 'string') errors.push('source must be a string');
    if (typeof group.target !== 'string') errors.push('target must be a string');
    if (errors.length > 0) {
        handleErrorMessage(`Invalid group: ${JSON.stringify(group)}: ${errors.join(', ')}.`);
    }
    return errors.length === 0;
}

function validateAndLogErrors(nodejsExtensionsConfig) {
    return Object.entries(nodejsExtensionsConfig).every(([key, group]) => {
        switch (key) {
            case 'assetsToCopy':
                return validateAssetGroupsAndLogErrors(group);
            case 'markdown':
                return group === true || group === false || typeof group.source === 'string';
            case 'scripts':
            case 'styles':
                return validateSimpleGroupAndLogErrors(group);
            default:
                throw new Error(
                    `Found unexpected key "${key}" in Node.js Extensions configuration! Valid keys are: ` +
                    '"assetsToCopy", "scripts", "styles".');
        }
    });
}

module.exports = validateAndLogErrors;
