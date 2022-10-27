/* eslint-env jest */

const validateConfig = require('../scripts/validate-config');

test('empty configuration is valid', () => {
    expect(validateConfig({})).toBe(true);
});

test('empty assetsToCopy array is valid', () => {
    expect(validateConfig({ assetsToCopy: [] })).toBe(true);
});

test('object as assetsToCopy value is invalid', () => {
    expect(validateConfig({ assetsToCopy: {} })).toBe(false);
});

test('empty assetGroup is invalid', () => {
    expect(validateConfig({ assetsToCopy: [{}] })).toBe(false);
});

test('assetGroup with all properties is valid', () => {
    expect(validateConfig({
        assetsToCopy: [
            {
                sources: [],
                pattern: '',
                target: '',
            },
        ],
    })).toBe(true);
});

test('empty scripts group is invalid', () => {
    expect(validateConfig({ scripts: {} })).toBe(false);
});

test('scripts group with all properties is valid', () => {
    expect(validateConfig({ scripts: { source: '', target: '' } })).toBe(true);
});
