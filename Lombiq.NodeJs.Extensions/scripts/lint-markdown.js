const fs = require('fs');
const path = require('path');
const process = require('process');

/* eslint-disable import/no-unresolved -- False positive, they are in the package.json. */
const textlintPluginMarkdown = require('@textlint/textlint-plugin-markdown').default;
const textLintFilterRuleComments = require('textlint-filter-rule-comments');
const textLintRuleCommonMisspellings = require('textlint-rule-common-misspellings').default;
const textLintRuleDoubledSpaces = require('textlint-rule-doubled-spaces').default;
const textLintRuleMaxComma = require('textlint-rule-max-comma').default;
const textLintRuleNoEmptySection = require('textlint-rule-no-empty-section');
const textLintRuleNoTodo = require('textlint-rule-no-todo').default;
const textLintRuleNoZeroWidthSpaces = require('textlint-rule-no-zero-width-spaces').default;
/* eslint-enable import/no-unresolved */

const findRecursively = require('./find-recursively');
const { handleErrorObject, handleWarningObject } = require('./handle-error');

const markdownlintConfig = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, '..', 'config', 'lombiq.markdownlint.json'), 'utf-8'));

const textLintConfig = {
    exclude: [
        // License files are full of legalese, which can't and shouldn't be analyzed with tools made for normal prose.
        'License.md',
    ],
    rules: [
        'common-misspellings',
        'max-comma',
        'no-empty-section',
        'no-todo',
        'no-zero-width-spaces',
        // 'no-start-duplicated-conjunction', // TODO: enable together with fix for HL/docs/Extensions.md
    ],
    filterRules: [
        'comments',
    ],
};

const textLintRules = {
    'textlint-filter-rule-comments': textLintFilterRuleComments,
    'textlint-rule-common-misspellings': textLintRuleCommonMisspellings,
    'textlint-rule-doubled-spaces': textLintRuleDoubledSpaces,
    'textlint-rule-max-comma': textLintRuleMaxComma,
    'textlint-rule-no-empty-section': textLintRuleNoEmptySection,
    'textlint-rule-no-todo': textLintRuleNoTodo,
    'textlint-rule-no-zero-width-spaces': textLintRuleNoZeroWidthSpaces,
};

if (process.platform !== 'win32') {
    // The doubled-spaces rule generates a lot of false positives on Windows. False negatives are avoided by linting
    // on Linux too.
    textLintConfig.rules.push('doubled-spaces');
}

function getMarkdownPaths() {
    const rootDirectory = process.argv.length > 2 ? process.argv[2] : '.';

    return findRecursively(
        rootDirectory,
        [/\.md$/i],
        [/^node_modules$/, /^\.git$/, /^\.vs$/, /^\.vscode$/, /^\.idea$/, /^obj$/, /^bin$/, /^wwwroot$/, /^ThirdParty$/]); // codespell:ignore
}

function handleError(error) {
    handleErrorObject(error);
    process.exit(1);
}

/**
 * Lints the provided files with markdownlint.
 * @param files {string[]} The paths of the Markdown files.
 */
async function useMarkdownLint(files) {
    // eslint-disable-next-line import/no-unresolved -- ESLint does not know where to find external modules.
    const { lint } = await import('markdownlint/promise');
    const results = await lint({ files: files, config: markdownlintConfig });

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

            handleWarningObject({
                path: fileName,
                line: warning.lineNumber,
                column: column,
                code: code,
                message: message,
            });
        });
    });
}

/**
 * Processes the provided textlint configuration into a format the low level kernel can understand.
 */
function newTextlintKernelOptions(config) {
    return {
        ...config,
        plugins: [
            {
                pluginId: 'markdown',
                plugin: textlintPluginMarkdown,
            },
        ],
        rules: config.rules.map((id) => ({ ruleId: id, rule: textLintRules['textlint-rule-' + id] })),
        filterRules: config.filterRules.map((id) => ({ ruleId: id, rule: textLintRules['textlint-filter-rule-' + id] })),
    };
}

/**
 * Lints the provided files with textlint.
 * @param files {string[]} The paths of the Markdown files.
 */
async function useTextLint(files) {
    // eslint-disable-next-line import/no-unresolved -- ESLint does not know where to find external modules.
    const { TextlintKernel } = await import('@textlint/kernel');

    const kernel = new TextlintKernel();
    const options = newTextlintKernelOptions(textLintConfig);
    const excludeLowerCase = Array.isArray(textLintConfig.exclude)
        ? textLintConfig.exclude.map((name) => name.toLowerCase())
        : [];

    const targetFiles = files
        .filter((file) => {
            const fileLower = file.toLowerCase();
            return !excludeLowerCase.some((exclude) => fileLower.includes(exclude));
        })
        .map((file) => fs.promises.readFile(file, 'utf-8')
            .then((fileContent) => kernel.lintText(fileContent, { ...options, filePath: file, ext: '.md' }))
            .then((result) => ({ file: file, messages: result.messages })));

    (await Promise.all(targetFiles))
        .forEach((result) => {
            const { file, messages } = result;

            messages
                .filter((message) => message.severity > 0)
                .forEach((message) => {
                    const start = message.loc.start;
                    handleWarningObject({
                        path: file,
                        line: start.line,
                        column: start.column,
                        code: message.ruleId,
                        message: message.message,
                    });
                });
        });
}

try {
    const files = getMarkdownPaths();
    const tasks = [useMarkdownLint, useTextLint];

    Promise.all(tasks.map((task) => task(files).catch(handleError)));
}
catch (error) {
    handleError(error);
}
