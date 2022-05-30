/**
 * @summary A helper script to return the target directory to run our scripts in - the consumer project's root folder.
 * @description This has become necessary due to inconsistent, OS-dependent handling of the broken directory traversal
 *              via '..' in the shell used by pnpm.
 */
function targetDir() {
    return require('path').resolve(process.cwd(), '..', '..');
}

console.log(targetDir());
