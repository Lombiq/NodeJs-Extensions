/**
 * @summary A helper script to determine whether a given path exists.
 */
const fs = require('fs');

process.exit(fs.existsSync(process.argv[2]) ? 0 : 1);
