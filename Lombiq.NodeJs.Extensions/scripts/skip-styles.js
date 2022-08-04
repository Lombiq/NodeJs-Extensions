/**
 * @summary A helper script to determine whether to skip running the styles pipeline.
 * @description Returns 0 if the styles pipeline should be skipped, else 1.
 */

const { access } = require('fs').promises;
const path = require('path');

(async function main() {
    try {
        const stylesSourceDirectory = path.resolve('..', '..', process.env.SCSS_SOURCE);
        await access(stylesSourceDirectory);
        process.exit(1);
    }
    catch (_) {
        process.stdout.write('Skipping styles');
        process.exit(0);
    }
})();
