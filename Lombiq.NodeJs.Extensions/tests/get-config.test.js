/* eslint-env jest */

const fs = require('fs');
const path = require('path');
const getConfig = require('../scripts/get-config');
const validate = require('../scripts/validate-config');

const verbose = false;
let packageJson = null;

jest.mock('fs');
jest.mock('path');
jest.mock('../scripts/validate-config');
fs.readFileSync.mockImplementation(() => packageJson);
path.resolve.mockImplementation(() => 'string value');
validate.mockResolvedValue(true);

test('having no configuration is valid', () => {
    packageJson = '{}';
    const config = getConfig({ verbose });
    expect(config).toHaveProperty('scripts');
    expect(config).toHaveProperty('styles');
});

test('empty configuration is valid', () => {
    packageJson = '{ "nodejsExtensions": {} }';
    const config = getConfig({ verbose });
    expect(config).toHaveProperty('scripts');
    expect(config).toHaveProperty('styles');
});

test('empty configuration returns default values', () => {
    packageJson = '{ "nodejsExtensions": {} }';
    const config = getConfig({ verbose });
    expect(config.scripts.source).toBe('Assets/Scripts');
    expect(config.scripts.target).toBe('wwwroot/js');
    expect(config.styles.source).toBe('Assets/Styles');
    expect(config.styles.target).toBe('wwwroot/css');
});

test('assetToCopy configuration without pattern will have default pattern', () => {
    packageJson = '{ "nodejsExtensions": { "assetsToCopy": [{ "sources": [], "target": "" }] } }';
    const assetConfig = getConfig({ verbose }).assetsToCopy[0];
    expect(assetConfig.pattern).toBe('**/*');
});

test('configuration returns custom scripts paths', () => {
    packageJson = '{ "nodejsExtensions": { "scripts": { "source": "CustomJs", "target": "CustomWww" } } }';
    const config = getConfig({ verbose }).scripts;
    expect(config.source).toBe('CustomJs');
    expect(config.target).toBe('CustomWww');
});
