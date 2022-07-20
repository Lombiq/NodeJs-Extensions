const findRecursively = require('./find-recursively');
const fs = require('fs');
const fsPromises = require('node:fs/promises');
const markdownlint = require('markdownlint');
const path = require('path');
const process = require('process');
const textlint = require("textlint");

const markdownlintConfig = {
    default: true,
    MD013: false,
    MD033: {
        allowed_elements: [
            // A special element in GitHub to indicate a keyboard key. Other Markdown formatters that don't support it will
            // safely ignore the tags and render the content as inline text without adverse effects.
            'kbd',
        ]
    }
};
const textLintConfig = {
    // License files are full of legalese, which can't and shouldn't be analysed with tools made for normal prose.
    exclude: [ 'License.md' ],
    rules: {
        "common-misspellings": true,
        "doubled-spaces": true,
        "no-dead-link": {
            "ignore": [
                "https://github.com/*" // The rule usually returns "429 too many requests" on GitHub links.
            ]
        },
        "no-todo": true,
        "no-zero-width-spaces": true,
    },
}

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

function useMarkdownLint(files) {
    const results = markdownlint.sync({ files, config: mergeConfigs(markdownlintConfig, '.markdownlintrc') });

    Object.keys(results).forEach((fileName) => {
        results[fileName].forEach((warning) => {
            const column = (Array.isArray(warning.errorRange) && !isNaN(warning.errorRange[0]))
                ? warning.errorRange[0]
                : 1;
            const [code, name] = Array.isArray(warning.ruleNames)
                ? warning.ruleNames
                : ['WARN', 'unknown-warning'];

            // License files don't need title.
            if (fileName.toLowerCase().endsWith('license.md') && code === 'MD041') return;

            let message = `${name ? name : code}: ${warning.ruleDescription.trim()}`;
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
    const id = Math.random();

    for (let i = 0; i < files.length; i++) {
        const file = files[i]

        if (excludeLowerCase.includes(path.basename(file).toLowerCase())) continue;

        const fileContent = await fsPromises.readFile(file, { encoding: 'utf-8' });
        const messages = (await engine.executeOnText(fileContent, '.md'))[0].messages;

        messages
            .filter((message) => message.severity > 0)
            .forEach((message) => {
                const start = message.loc.start;
                handleWarning(file, start.line, start.column, message.ruleId, `${message.message}`);
            });
    }
    console.log("END " + id);
}

function handleWarning(fileName, line, column, code, message) {
    process.stdout.write(`\r${fileName}(${line},${column}): warning ${code}: ${message}\n`);
}

function handleError(error) {
    const code = error.code ? error.code : 'ERROR';
    process.stdout.write(`\r${error.path}(1,1): error ${code}: ${error.toString()}\n`);
    process.exit(1);
}

try {
    const files = getMarkdownPaths();

    useMarkdownLint(files);
    useTextLint(files).catch(handleError);
}
catch (error) {
    handleError(error);
}
