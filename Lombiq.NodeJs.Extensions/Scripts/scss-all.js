const path = require('path');
const stylelint = require('stylelint');

console.log('args:', process.argv);

// The caller's root directory is two levels up since it accesses this package through node_modules:
const nodejsExtensionRootDir = process.env.npm_config_local_prefix;
const callerRootDir = path.join(nodejsExtensionRootDir, '..', '..');

console.log('root:', callerRootDir);
console.log('ENV :', process.env);

// execute CLI commands: https://stackoverflow.com/a/37438131/177710
