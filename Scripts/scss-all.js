const path = require('path');

console.log('args:', process.argv);

// The caller's root directory is two levels up since it accesses this package through node_modules:
const nodejsExtensionRootDir = process.env.npm_config_local_prefix;
const callerRootDir = path.join(nodejsExtensionRootDir, '..', '..');

console.log('root:', callerRootDir);
