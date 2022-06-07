/**
 * @summary A helper script to return the target directory to run our scripts in - the consumer project's root folder.
 * @description This has become necessary due to inconsistent, OS-dependent handling of the broken directory traversal
 *              via '..' in the shell used by pnpm.
 */
function getSourceDir() {
    const jsSourceKey = 'npm_config_target';
    const sourceDir = process.env[jsSourceKey] || 'wwwroot/css';
    return require('path').resolve(process.cwd(), '..', '..', sourceDir);
}

const sourceDir = getSourceDir();

console.log(require('fs').existsSync(sourceDir) ? sourceDir : 'NOK');
