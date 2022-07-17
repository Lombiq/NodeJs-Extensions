const findRecursively = require('./find-recursively');
const markdownlint = require('markdownlint');
const process = require('process');

const files = findRecursively(
    process.argv.length > 2 ? process.argv[2] : '.',
    [/\.md$/i],
    [/^node_modules$/, /^\.git$/, /^obj$/, /^bin$/]);
const config = {
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

try {
    const results = markdownlint.sync({ files, config });

    Object.keys(results).forEach((fileName) => {
        results[fileName].forEach((warning) => {
            const line = warning.lineNumber;
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

            process.stdout.write(`${fileName}(${line},${column}): warning ${code}: ${message}\n`);
        });
    });
}
catch (error) {
    const code = error.code ? error.code : 'ERROR';
    process.stderr.write(`${error.path}(1,1): error ${code}: ${error.toString()}\n`);
    process.exit(1);
}
