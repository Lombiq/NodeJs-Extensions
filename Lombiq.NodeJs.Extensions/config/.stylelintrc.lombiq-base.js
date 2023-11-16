module.exports = {
    extends: 'stylelint-config-standard-scss',
    rules: {
        'alpha-value-notation': 'number',
        'comment-word-disallowed-list': ['todo', 'fixme', 'xxx'],
        'declaration-no-important': true,
        'keyframes-name-pattern': null,
        'selector-class-pattern': null,
        'selector-id-pattern': null,
        'selector-no-qualifying-type': true,
    },
};
