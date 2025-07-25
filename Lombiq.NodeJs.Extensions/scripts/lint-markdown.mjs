import fs from 'fs';
import lint from 'markdownlint/promise';
import path from 'path';
import process from 'process';
import { TextlintKernel, TextlintKernelOptions } from '@textlint/kernel';

import findRecursively from './find-recursively.js';
import { handleErrorObject, handleWarningObject } from './handle-error.js';

const markdownlintConfig = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, '..', 'config', 'lombiq.markdownlint.json'), 'utf-8'));

const textLintConfig = {
    exclude: [
        // License files are full of legalese, which can't and shouldn't be analyzed with tools made for normal prose.
        'License.md',
    ],
    rules: [
        'common-misspellings',
        // "no-dead-link", // Disabled because it can't ignore relative links and can't reliably verify GitHub URLs.
        'no-todo',
        'no-zero-width-spaces',
        // 'no-start-duplicated-conjunction', // TODO: enable together with fix for HL/docs/Extensions.md
        'max-comma',
        'no-empty-section',
    ],
    filterRules: [
        'comments',
    ],
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
        [/^node_modules$/, /^\.git$/, /^\.vs$/, /^\.vscode$/, /^\.idea$/, /^obj$/, /^bin$/, /^wwwroot$/]);
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
 * @returns {Promise<TextlintKernelOptions>}
 */
async function newTextlintKernelOptions(textLintConfig) {
    return {
        rules: await Promise.all(textLintConfig.rules.map(async (rule) => ({
            ruleId: rule,
            rule: await import('textlint-rule-' + rule),
        }))),
        filterRules: await Promise.all(textLintConfig.filterRules.map(async (filterRule) => ({
            ruleId: filterRule,
            rule: await import('textlint-filter-rule-' + filterRule),
        }))),
    };
}

/**
 * Lints the provided files with textlint.
 * @param files {string[]} The paths of the Markdown files.
 */
async function useTextLint(files) {
    const kernel = new TextlintKernel()
    const options = await newTextlintKernelOptions(textLintConfig);

    const excludeLowerCase = Array.isArray(textLintConfig.exclude)
        ? textLintConfig.exclude.map((name) => name.toLowerCase())
        : [];

    const targetFiles = files
        .filter((file) => {
            const fileLower = file.toLowerCase();
            return !excludeLowerCase.some((exclude) => fileLower.includes(exclude));
        })
        .map((file) => fs.promises.readFile(file, 'utf-8')
            .then((fileContent) => kernel.lintText(fileContent, options))
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
