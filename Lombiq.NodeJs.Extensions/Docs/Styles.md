# Scripts for SCSS files

The below scripts lint (with [Stylelint](https://stylelint.io/)), compile, autoprefix, and minify the given SCSS files into an output folder. Beyond that, there are also `clean` and `watch` scripts.

Looking for something similar for .NET? Check out our [.NET Analyzers project](https://github.com/Lombiq/.NET-Analyzers).

## Source and target paths

The default paths for SCSS input files and CSS output files are _Assets/Styles_ and _wwwroot/css_, respectively. The existing folder structure in the input folder will be mirrored in the output, e.g. _Assets/Styles/app/main.scss_ will be transformed into _wwwroot/css/app/main.css_, together with _wwwroot/css/app/main.min.css_ and _wwwroot/css/app/main.css.map_.

### Overriding the defaults

Those defaults can be overridden by providing the following properties in your project's _package.json_ file:

```json
"nodejsExtensions": {
  "styles": {
    "source": "path/to/raw-scss",
    "target": "www/css-files"
  }
}
```

## How to get started

To use the `npm` scripts defined in this project, add any or all of the following entries to the `scripts` property in your project's _package.json_:

```json
"scripts": {
  "build:styles": "npm explore nodejs-extensions -- pnpm build:styles",
  "clean:styles": "npm explore nodejs-extensions -- pnpm clean:styles",
  "watch:styles": "npm explore nodejs-extensions -- pnpm watch:styles",
}
```

To see the different configurations of default and non-default paths in action, please check out our dedicated [Samples](../../Lombiq.NodeJs.Extensions.Samples/Readme.md) [projects](../../Lombiq.NodeJs.Extensions.Samples.NuGet/Readme.md).

### Integration with Visual Studio (Code)

Unfortunately, there's currently no Visual Studio editor support to see linter violations in real-time. You can, however, write SCSS in Visual Studio Code and use the official [Stylelint extension](https://marketplace.visualstudio.com/items?itemName=stylelint.vscode-stylelint) there. Just install and configure it to validate SCSS files under its "Stylelint: Validate" option, or use the below snippet in VS Code's _settings.json_:

```json
"stylelint.validate": [
  "css",
  "less",
  "postcss",
  "scss"
],
```

## Stylelint rules

The rules are found in 2 files:

- _.stylelintrc.lombiq-base.json_: These rules are Lombiq overrides for [stylelint-config-standard-scss](https://www.npmjs.com/package/stylelint-config-standard-scss).
- _.stylelintrc.json_: In this file you can define your own overriding rules.

The _.stylelintrc.json_ file initially extends _.stylelintrc.lombiq-base.js_ from the Node.js Extensions `npm` package. It will automatically be created in your project during the first build. Should you prefer to use a global _.stylelintrc.json_ file for your whole solution, you can instruct Node.js Extensions to create that file in the location specified by the MSBuild property `<NodeJsExtensionsGlobalESLintConfigurationDirectory>`. This property is easiest added in a _Directory.Build.props_ file in your solution's root directory as follows:

```xml
<NodeJsExtensionsGlobalStylelintConfigurationDirectory>$(MSBuildThisFileDirectory)</NodeJsExtensionsGlobalStylelintConfigurationDirectory>
```

> ⓘ Please edit _.stylelintrc.json_ once it has been created, and adjust the path to _.stylelintrc.lombiq-base.js_ according to your solution's directory structure.

Details on rules can be found in the [Stylelint documentation](https://stylelint.io/user-guide/rules/list/). If you want to find out what the currently applied configuration is, coming from all the various extended configuration files, then run `npx stylelint --print-config . > rules.json` at the given location.

The MSBuild or `npm` script output will show you all of the Stylelint rule violations in a detailed manner.

If a certain rule's violation is incorrect in a given location, or you want to suppress it locally, [you can ignore the affected code](https://stylelint.io/user-guide/ignore-code/). Just always comment such ignores to clarify why they were necessary.
