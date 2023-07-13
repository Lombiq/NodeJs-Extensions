# Pipeline for SCSS files

This project contains the following pipeline steps for SCSS files:

- Lint (with [Stylelint](https://stylelint.io/))
- Compile to CSS
- Autoprefix <!-- #spell-check-ignore-line -->
- Minify incl. source map generation
- Clean output folder
- Watch for changes and re-run pipeline

> Looking for something similar for .NET? Check out our [.NET Analyzers project](https://github.com/Lombiq/.NET-Analyzers).

## Configuration

The styles pipeline needs a `source` and a `target` path. The default configuration looks like this:

```json
"nodejsExtensions": {
  "styles": {
    "source": "Assets/Styles",
    "target": "wwwroot/css"
  }
}
```

In case you want to stick to the defaults, the `styles` node can be omitted completely; otherwise, you need to specify both, `source` and a `target` paths.

To see the different configurations of default and custom paths in action, please check out our dedicated [Samples](../../Lombiq.NodeJs.Extensions.Samples/Readme.md) and [NuGet Samples](../../Lombiq.NodeJs.Extensions.Samples.NuGet/Readme.md) projects.

## Generated files

During processing of the SCSS files underneath the `source` path, any existing folder structure will be mirrored in the `target` path.

Given the following asset:

- _Assets/Styles/app/main.scss_

The following files will be generated:

- _wwwroot/css/app/main.css_
- _wwwroot/css/app/main.min.css_
- _wwwroot/css/app/main.css.map_

## Available scripts

To use the `npm` scripts defined in this project, please follow the setup instructions in the root [Readme](../../Readme.md#how-to-trigger-pipelines-on-demand).

Now, you can add any or all of the following entries to the `scripts` property in your project's _package.json_ to call only the desired pipeline steps:

```json
"scripts": {
  "build:styles":   "npm explore nodejs-extensions -- pnpm build:styles",
  "compile:styles": "npm explore nodejs-extensions -- pnpm compile:styles",
  "lint:styles":    "npm explore nodejs-extensions -- pnpm lint:styles",
  "clean:styles":   "npm explore nodejs-extensions -- pnpm clean:styles",
  "watch:styles":   "npm explore nodejs-extensions -- pnpm watch:styles"
}
```

The `build:styles` script is a wrapper to execute the `lint:styles` and `compile:styles` scripts in parallel.

## Stylelint rules

The rules are found in 2 files:

- _.stylelintrc.lombiq-base.js_: These rules are Lombiq overrides for [stylelint-config-standard-scss](https://www.npmjs.com/package/stylelint-config-standard-scss). You can find the file [here](../config/.stylelintrc.lombiq-base.js).
- _.stylelintrc.js_: In this file you can override the above Lombiq rules, or define your own [Stylelint configuration](https://stylelint.io/user-guide/configure/) altogether.

The _.stylelintrc.js_ file will automatically be created in your project during the first build. Please open it and adjust the path to _.stylelintrc.lombiq-base.js_ according to your solution's directory structure.

### Using a solution-wide configuration

> ℹ This option only works when using Node.js Extensions from a submodule, **not** from the NuGet package.

In order to use a global _.stylelintrc.js_ file for your whole solution, you can instruct Node.js Extensions to create that file in the location specified by the MSBuild property `<NodeJsExtensionsGlobalStylelintConfigurationDirectory>`. This property is easiest to add in a _Directory.Build.props_ file in your solution's root directory as follows:

```xml
<NodeJsExtensionsGlobalStylelintConfigurationDirectory>$(MSBuildThisFileDirectory)</NodeJsExtensionsGlobalStylelintConfigurationDirectory>
```

Details on rules can be found in the [Stylelint documentation](https://stylelint.io/user-guide/rules/list/). If you want to find out what the currently applied configuration is, coming from all the various extended configuration files, then run `npx stylelint --print-config . > rules.json` at the given location.

### Integration with Visual Studio (Code)

Unfortunately, there's currently no Visual Studio editor support to see linter violations from Stylelint in real-time. You can, however, write SCSS in Visual Studio Code and use the official [Stylelint extension](https://marketplace.visualstudio.com/items?itemName=stylelint.vscode-stylelint) there. Just install and configure it to validate SCSS files under its "Stylelint: Validate" option, or use the below snippet in VS Code's _settings.json_:

```json
"stylelint.validate": [
  "css",
  "less",
  "postcss",
  "scss"
],
```

The MSBuild or `npm` script output will show you all of the Stylelint rule violations in a detailed manner.

If a certain rule's violation is incorrect in a given location, or you want to suppress it locally, [you can ignore the affected code](https://stylelint.io/user-guide/ignore-code/). Just always comment such ignores to clarify why they were necessary.
