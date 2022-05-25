/* eslint-disable */
module.exports = {
    'extends': 'airbnb-base',

    'env': {
        'jquery': true,
        'browser': true,
    },

    'plugins': [
        'only-warn'
    ],

    // Here we can define our own rules overriding the base rules
    'rules': {
        // Lombiq rules
        'max-len': [
            'warn',
            // 150 characters is a hard limit but the soft limit is at 120.
            150,
            2,
            {
                'ignoreUrls': true,
                'ignoreComments': false,
                'ignoreRegExpLiterals': false,
                'ignoreStrings': false,
                'ignoreTemplateLiterals': false
            }
        ],

        'brace-style': [
            'warn',
            'stroustrup',
            { 'allowSingleLine': true }
        ],

        'prefer-template': 'off',

        'no-plusplus': [
            'warn',
            { 'allowForLoopAfterthoughts': true }
        ],

        'linebreak-style': ['warn', 'windows'],

        'no-param-reassign': [
            'warn',
            {
                'props': false
            }
        ],

        'wrap-iife': [
            'warn',
            'any', // outside originally
            { 'functionPrototypeMethods': false }
        ],

        'prefer-arrow-callback': [
            'warn',
            {
                'allowNamedFunctions': true, // false originally
                'allowUnboundThis': true
            }
        ],

        'no-underscore-dangle': [
            'warn',
            {
                'allowAfterThis': true
            }
        ],

        'no-restricted-syntax': [
            'warn',
            {
                'selector': 'ForOfStatement',
                'message': 'iterators/generators require regenerator-runtime, which is too heavyweight for this guide (https://github.com/airbnb/javascript/blob/master/packages/eslint-config-airbnb-base/rules/style.js) to allow them. Separately, loops should be avoided in favor of array iterations.'
            },
            {
                'selector': 'LabeledStatement',
                'message': 'Labels are a form of GOTO; using them makes code confusing and hard to maintain and understand.'
            },
            {
                'selector': 'WithStatement',
                'message': '`with` is disallowed in strict mode because it makes code impossible to predict and optimize.'
            }
        ],

        'no-unused-expressions': [
            'warn',
            {
                'allowShortCircuit': true,
                'allowTernary': false,
                'allowTaggedTemplates': false
            }
        ],

        'operator-linebreak': [
            'warn',
            'after',
            {
                'overrides': {
                    '=': 'none',
                    '?': 'ignore',
                    ':': 'ignore'
                }
            }
        ],

        'no-else-return': [
            'warn',
            { 'allowElseIf': true }
        ],

        'object-shorthand': [
            'warn',
            'consistent-as-needed'
        ],

        'prefer-destructuring': [
            'warn',
            {
                'VariableDeclarator': {
                    'array': false,
                    'object': false
                },
                'AssignmentExpression': {
                    'array': true,
                    'object': false
                }
            },
            {
                'enforceForRenamedProperties': false
            }
        ],

        'indent': [
            'warn',
            4,
            {
                'SwitchCase': 1,
                'VariableDeclarator': 1,
                'outerIIFEBody': 1,
                // MemberExpression: null,
                'FunctionDeclaration': {
                    'parameters': 1,
                    'body': 1
                },
                'FunctionExpression': {
                    'parameters': 1,
                    'body': 1
                },
                'CallExpression': {
                    'arguments': 1
                },
                'ArrayExpression': 1,
                'ObjectExpression': 1,
                'ImportDeclaration': 1,
                'flatTernaryExpressions': false,
                // list derived from https://github.com/benjamn/ast-types/blob/HEAD/def/jsx.js
                'ignoredNodes': ['JSXElement', 'JSXElement > *', 'JSXAttribute', 'JSXIdentifier', 'JSXNamespacedName', 'JSXMemberExpression', 'JSXSpreadAttribute', 'JSXExpressionContainer', 'JSXOpeningElement', 'JSXClosingElement', 'JSXFragment', 'JSXOpeningFragment', 'JSXClosingFragment', 'JSXText', 'JSXEmptyExpression', 'JSXSpreadChild'],
                'ignoreComments': false
            }
        ],

        'func-names': ['warn', 'as-needed'],

        'no-alert': 'off',

        'function-paren-newline': ['off', 'consistent'],

        'comma-dangle': ['warn', {
            arrays: 'always-multiline',
            objects: 'always-multiline',
            imports: 'always-multiline',
            exports: 'always-multiline',
            functions: 'never',
        }],

        'function-call-argument-newline': ['warn', 'consistent'],

        'strict': ['warn', 'safe'],

        'import/no-extraneous-dependencies': 'off',

        'no-warning-comments': 'warn'
    },

    // This is required for bleeding edge JS features like optional chaining (@babel/plugin-proposal-optional-chaining).
    'parserOptions': {
        'ecmaVersion': 2020
    },
}
