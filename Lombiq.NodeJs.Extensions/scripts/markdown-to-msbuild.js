const fs = require('fs');
const markdownlint = require('markdownlint');
const path = require('path');
const process = require('process');
const textlint = require('textlint');
const findRecursively = require('./find-recursively');

const markdownlintConfig = {
    default: true,
    MD013: false,
    MD033: {
        allowed_elements: [
            // A special element in GitHub to indicate a keyboard key. Other Markdown formatters that don't support it
            // will safely ignore the tags and render the content as inline text without adverse effects.
            'kbd',
        ],
    },
};
const textLintConfig = {
    exclude: [
        // License files are full of legalese, which can't and shouldn't be analyzed with tools made for normal prose.
        'License.md',
        // The wwwwroot directory contains built and vendor assets. Any Markdown file there is not our responsibility.
        'wwwroot',
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

function mergeConfigs(baseConfiguration, rcFileName) {
    const customOptions = fs.existsSync(rcFileName) ? JSON.parse(fs.readFileSync(rcFileName, 'utf8')) : {};

    return {
        ...baseConfiguration,
        ...customOptions,
    };
}

function getMarkdownPaths() {
    let rootDirectory = process.argv.length > 2 ? process.argv[2] : '.';

    // Traverse up the path until a .NET solution file (sln) is found.
    if (rootDirectory === '_solution_') {
        rootDirectory = path.resolve('.');
        while (!fs.readdirSync(rootDirectory).some((name) => name.endsWith('.sln'))) {
            rootDirectory = path.resolve(rootDirectory, '..');
        }
    }

    return findRecursively(rootDirectory, [/\.md$/i], [/^node_modules$/, /^\.git$/, /^obj$/, /^bin$/]);
}

function handleWarning(fileName, line, column, code, message) {
    process.stdout.write(`\r${fileName}(${line},${column}): warning ${code}: ${message}\n`);
}

function handleError(error) {
    const code = error.code ? error.code : 'ERROR';
    process.stdout.write(`\r${error.path}(1,1): error ${code}: ${error.toString()}\n`);
    if (error.stack) process.stdout.write(error.stack);
    process.exit(1);
}

function useMarkdownLint(files) {
    const results = markdownlint.sync({ files: files, config: mergeConfigs(markdownlintConfig, '.markdownlintrc') });

    Object.keys(results).forEach((fileName) => {
        results[fileName].forEach((warning) => {
            const column = (Array.isArray(warning.errorRange) && !Number.isNaN(warning.errorRange[0]))
                ? warning.errorRange[0]
                : 1;
            const [code, name] = Array.isArray(warning.ruleNames)
                ? warning.ruleNames
                : ['WARN', 'unknown-warning'];

            // License files don't need title.
            if (fileName.toLowerCase().endsWith('license.md') && code === 'MD041') return;

            let message = `${name || code}: ${warning.ruleDescription.trim()}`;
            if (!message.endsWith('.')) message += '.';
            if (warning.fixInfo) message += ' An automatic fix is available with markdownlint-cli.';
            if (warning.ruleInformation) message += ' Rule information: ' + warning.ruleInformation;

            handleWarning(fileName, warning.lineNumber, column, code, message);
        });
    });
}

async function useTextLint(files) {
    const options = mergeConfigs(textLintConfig, '.textlintrc');
    const excludeLowerCase = Array.isArray(options.exclude) ? options.exclude.map((name) => name.toLowerCase()) : [];
    const engine = new textlint.TextLintEngine(options);

    const targetFiles = files
        .filter((file) => {
            const fileLower = file.toLowerCase();
            return !excludeLowerCase.some((exclude) => fileLower.includes(exclude));
        })
        .map((file) => fs.promises.readFile(file, { encoding: 'utf-8' })
            .then((fileContent) => engine.executeOnText(fileContent, '.md'))
            .then((result) => ({ file: file, messages: result[0].messages })));

    (await Promise.all(targetFiles))
        .forEach((result) => {
            const { file, messages } = result;

            messages
                .filter((message) => message.severity > 0)
                .forEach((message) => {
                    const start = message.loc.start;
                    handleWarning(file, start.line, start.column, message.ruleId, `${message.message}`);
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
