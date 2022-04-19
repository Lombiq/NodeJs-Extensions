# Scripts for SCSS files



The below scripts lint (with [Stylelint](https://stylelint.io/)), compile, autoprefix, and minify the given SCSS files into an output folder. Beyond that, there are also `clean` and `watch` scripts.

The usage of these scripts is optional. `Lombiq Node.js Extensions` is able to process your SCSS files during the regular build of your project via MSBuild or the `dotnet` CLI without further work from your side. These scripts are meant to be used during development for short feedback loops, most of all the `watch` script.

Looking for something similar for .NET? Check out our [.NET Analyzers project](https://github.com/Lombiq/.NET-Analyzers).


## Source and target paths

The default paths for SCSS input files and CSS output files are *Assets/Styles* and *wwwroot/css*, respectively. The existing folder structure in the input folder will be mirrored in the output, e.g. *Assets/Styles/app/main.scss* will be transformed into *wwwroot/css/app/main.css*, together with *wwwroot/css/app/main.min.css* and *wwwroot/css/app/main.css.map*.

Those defaults can be overridden by providing the following MSBuild properties in your project file:

```xml
<NodeJsExtensionsStylesSourceFolder>path/to/my/scss-files</NodeJsExtensionsStylesSourceFolder>
<NodeJsExtensionsStylesTargetFolder>path/to/my/css-files</NodeJsExtensionsStylesTargetFolder>
```


## How to get started

To use the `npm` scripts defined in this project, add any or all of the following entries to the `scripts` property in your project's *package.json*:

- If you're using the default paths, then use these:

  ```json
  "scripts": {
    "build": "npm run build:styles",
    "build:styles": "npm explore nodejs-extensions -- pnpm run build:styles",
    "clean": "npm run clean:styles",
    "clean:styles": "npm explore nodejs-extensions -- pnpm run clean:styles",
    "watch": "npm run watch:styles",
    "watch:styles": "npm explore nodejs-extensions -- pnpm run watch:styles",
  }
  ```

- If you're using non-default paths, then you will need to add the following entries (using the example paths above):

  ```json
  "scripts": {
    "build": "npm run build:styles",
    "build:styles": "npm explore nodejs-extensions -- npm run build:styles:args --source=path/to/my/scss-files --target=path/to/my/css-files",
    "clean": "npm run clean:styles",
    "clean:styles": "npm explore nodejs-extensions -- npm run clean:styles:args --target=path/to/my/css-files",
    "watch": "npm run watch:styles",
    "watch:styles": "npm explore nodejs-extensions -- npm run watch:styles:args --source=path/to/my/scss-files --target=path/to/my/css-files",
  }
  ```

To see the different configurations of default and non-default paths in action, please check out our dedicated [Samples](../Lombiq.NodeJs.Extensions.Samples/Readme.md) [projects](../Lombiq.NodeJs.Extensions.Samples.NuGet/Readme.md).

### Integration with Visual Studio (Code)

Unfortunately, there's currently no Visual Studio editor support to see linter violations in real-time. You can, however, write SCSS in Visual Studio Code and use the official [Stylelint extension](https://marketplace.visualstudio.com/items?itemName=stylelint.vscode-stylelint) there. Just install and configure it to validate SCSS files under its "Stylelint: Validate" option, or use the below snippet in VS Code's *settings.json*:

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
- *lombiq-base.stylelintrc.json*: These rules are Lombiq overrides for [stylelint-config-standard-scss](https://www.npmjs.com/package/stylelint-config-standard-scss).
- *.stylelintrc*: In this file you can define your own overriding rules.

The *.stylelintrc* file will automatically be created in your project during the first build, and extends *lombiq-base.stylelintrc.json* from the Node.js Extensions `npm` package. Should you be using, or want to use, a global *.stylelintrc* for your whole solution, or use any other way of [configuring Stylelint](https://github.com/stylelint/stylelint/blob/main/docs/user-guide/configure.md#configuration), you can disable this behavior by setting `<NodeJsExtensionsCreateStylelintConfigurationFile>` to `false` in your project file.

Details on rules can be found in the [Stylelint documentation](https://stylelint.io/user-guide/rules/list). If you want to find out what the currently applied configuration is, coming from all the various extended configuration files, then run `npx stylelint --print-config . > rules.json` at the given location.

The MSBuild or `npm` script output will show you all of the Stylelint rule violations in a detailed manner.

If a certain rule's violation is incorrect in a given location, or you want to suppress it locally, [you can ignore the affected code](https://stylelint.io/user-guide/ignore-code/). Just always comment such ignores so it's apparent why it was necessary.
