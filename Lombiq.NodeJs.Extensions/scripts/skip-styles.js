/**
 * @summary A helper script to determine whether to skip running the styles pipeline.
 * @description Returns 0 if the styles pipeline should be skipped, else 1.
 */

const fs = require('fs');
const path = require('path');

const styleDirectoryExists = fs.existsSync(path.resolve('..', '..', process.env.SCSS_SOURCE));
process.exit(styleDirectoryExists ? 1 : 0);
