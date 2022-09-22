# Notes when editing files in this folder

## .eslint.*.json

Keep the _.eslint.global.json_ and _.eslint.project.json_ files in sync, except for the path in the `extends` property..

## .stylelint.*.json

Keep the _.stylelint.global.json_ and _.stylelint.project.json_ files in sync, except for the path in the `extends` property..

## package.*.json

The `eslint*` entries in `devDependencies` in both _package.global.json_ and _package.project.json_ should be kept in sync. Consuming project should keep their _package.json_ in sync with the aforementioned files.
