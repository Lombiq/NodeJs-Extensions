const fs = require('fs');
const markdownlint = require('markdownlint'); // eslint-disable-line import/no-unresolved -- False positive, it's in the package.json.
const path = require('path');
const process = require('process');
const textlint = require('textlint'); // eslint-disable-line import/no-unresolved -- False positive, it's in the package.json.
const findRecursively = require('./find-recursively');

const markdownlintConfig = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', 'config', 'lombiq.markdownlint.json')));

const textLintConfig = {
    exclude: [
        // License files are full of legalese, which can't and shouldn't be analyzed with tools made for normal prose.
        'License.md',
    ],
    rules: [
        'common-misspellings',
        'doubled-spaces',
        // "no-dead-link", // Disabled because it can't ignore relative links and can't reliably verify GitHub URLs.
        'no-todo',
        'no-zero-width-spaces',
        'no-start-duplicated-conjunction',
        'max-comma',
        'no-empty-section',
    ],
};

function getMarkdownPaths() {
    let rootDirectory = process.argv.length > 2 ? process.argv[2] : '.';

    // Traverse up the path until a .NET solution file (sln) is found.
    if (rootDirectory === '_solution_') {
        rootDirectory = path.resolve('.');
        while (!fs.readdirSync(rootDirectory).some((name) => name.endsWith('.sln'))) {
            const newPath = path.resolve(rootDirectory, '..');
            if (rootDirectory === newPath) throw new Error("Couldn't find a .NET solution (.sln) file.");
            rootDirectory = newPath;
        }
    }

    return findRecursively(
        rootDirectory,
        [/\.md$/i],
        [/^node_modules$/, /^\.git$/, /^\.vs$/, /^\.vscode$/, /^\.idea$/, /^obj$/, /^bin$/, /^wwwroot$/]);
}

function handleWarning(fileName, line, column, code, message) {
    process.stdout.write(`\r${fileName}(${line},${column}): warning ${code}: ${message}\n`);
}

function handleError(error) {
    const code = error.code || 'ERROR';
    process.stdout.write(`\r${error.path}(1,1): error ${code}: ${error.toString()}\n`);
    if (error.stack) process.stdout.write(error.stack + '\n');
    process.exit(1);
}

function useMarkdownLint(files) {
    const results = markdownlint.sync({ files: files, config: markdownlintConfig });

    Object.keys(results).forEach((fileName) => {
        results[fileName].forEach((warning) => {
            const column = (Array.isArray(warning.errorRange) && !Number.isNaN(warning.errorRange[0]))
                ? warning.errorRange[0]
                : 1;
            const [code, name] = Array.isArray(warning.ruleNames)
                ? warning.ruleNames
                : ['WARN', 'unknown-warning'];

            // License files don't need a title.
            if (code === 'MD041' && fileName.toLowerCase().endsWith('license.md')) return;

            let message = `${name || code}: ${warning.ruleDescription.trim()}`;
            if (!message.endsWith('.')) message += '.';
            if (warning.fixInfo) message += ' An automatic fix is available with markdownlint-cli.';
            if (warning.ruleInformation) message += ` Rule information: ${warning.ruleInformation}`;

            handleWarning(fileName, warning.lineNumber, column, code, message);
        });
    });
}

async function useTextLint(files) {
    const options = textLintConfig;
    const excludeLowerCase = Array.isArray(options.exclude) ? options.exclude.map((name) => name.toLowerCase()) : [];
    const engine = new textlint.TextLintEngine(options);

    const targetFiles = files
        .filter((file) => {
            const fileLower = file.toLowerCase();
            return !excludeLowerCase.some((exclude) => fileLower.includes(exclude));
        })
        .map((file) => fs.promises.readFile(file, 'utf-8')
            .then((fileContent) => engine.executeOnText(fileContent, '.md'))
            .then((result) => ({ file: file, messages: result[0].messages })));

    (await Promise.all(targetFiles))
        .forEach((result) => {
            const { file, messages } = result;

            messages
                .filter((message) => message.severity > 0)
                .forEach((message) => {
                    const start = message.loc.start;
                    handleWarning(file, start.line, start.column, message.ruleId, message.message);
                });
        });
}

try {
    const files = getMarkdownPaths();

    useMarkdownLint(files);
    useTextLint(files).catch(handleError);
}
catch (error) {
    handleError(error);
}
