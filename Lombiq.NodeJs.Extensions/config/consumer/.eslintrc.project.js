const fs = require('fs');
const { FlatCompat } = require('@eslint/eslintrc');
const compat = new FlatCompat({ baseDirectory: __dirname });

let eslintrc = compat.config({
    // The following path may have to be adjusted to your directory structure.
    extends: './node_modules/nodejs-extensions/config/.eslintrc.lombiq-base.js',

    // Add custom rules and overrides here.
    rules: {
    },
});

if (fs.existsSync('./.eslintrc.js')) {
    eslintrc = require('./.eslintrc.js');
}

module.exports = [ ...eslintrc ];
