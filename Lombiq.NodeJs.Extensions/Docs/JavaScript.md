# Pipeline for JavaScript files

This project contains the following pipeline steps for JavaScript files:

- Lint (with [ESLint](https://eslint.org/))
- Minify incl. source map generation
- Clean output folder
- Watch for changes and re-run pipeline

> Looking for something similar for .NET? Check out our [.NET Analyzers project](https://github.com/Lombiq/.NET-Analyzers).

## Configuration

The scripts pipeline needs a `source` and a `target` path. The default configuration looks like this:

```json
"nodejsExtensions": {
  "scripts": {
    "source": "Assets/Scripts",
    "target": "wwwroot/js"
  }
}
```

In case you want to stick to the defaults, the `scripts` node can be omitted completely; otherwise, you need to specify both, `source` and a `target` paths.

To see the different configurations of default and custom paths in action, please check out our dedicated [Samples](../../Lombiq.NodeJs.Extensions.Samples/Readme.md) and [NuGet Samples](../../Lombiq.NodeJs.Extensions.Samples.NuGet/Readme.md) projects.

## Generated files

During processing of the JavaScript files underneath the `source` path, any existing folder structure will be mirrored in the `target` path.

Given the following asset:

- _Assets/Scripts/app/main.js_

The following files will be generated:

- _wwwroot/js/app/main.js_
- _wwwroot/js/app/main.min.js_
- _wwwroot/js/app/main.min.js.map_

## Available scripts

To use the `npm` scripts defined in this project, please follow the setup instructions in the root [Readme](../../Readme.md#how-to-trigger-pipelines-on-demand).

Now, you can add any or all of the following entries to the `scripts` property in your project's _package.json_ to call only the desired pipeline steps:

```json
"scripts": {
  "build:scripts":   "npm explore nodejs-extensions -- pnpm build:scripts",
  "compile:scripts": "npm explore nodejs-extensions -- pnpm compile:scripts",
  "lint:scripts":    "npm explore nodejs-extensions -- pnpm lint:scripts",
  "clean:scripts":   "npm explore nodejs-extensions -- pnpm clean:scripts",
  "watch:scripts":   "npm explore nodejs-extensions -- pnpm watch:scripts"
}
```

The `build:scripts` script is a wrapper to execute the `lint:scripts` and `compile:scripts` scripts in parallel.

## ESLint rules

The rules are found in 2 files:

- _.eslintrc.lombiq-base.js_: This file contains Lombiq overrides for the [airbnb-base](https://www.npmjs.com/package/eslint-config-airbnb-base) rules. You can find the file [here](../config/.eslintrc.lombiq-base.js).
- _.eslintrc.js_: In this file you can override the above Lombiq rules, or define your own [ESLint configuration](https://eslint.org/docs/latest/user-guide/configuring/configuration-files) altogether.

The _.eslintrc.js_ file will automatically be created in your project during the first build. Please open it and adjust the path to _.eslintrc.lombiq-base.js_ according to your solution's directory structure.

### Using a solution-wide configuration

> ℹ This option only works when using Node.js Extensions from a submodule, **not** from the NuGet package.

In order to use a global _.eslintrc.js_ file for your whole solution, you can instruct Node.js Extensions to create that file in the location specified by the MSBuild property `<NodeJsExtensionsGlobalESLintConfigurationDirectory>`. This property is easiest to add in a _Directory.Build.props_ file in your solution's root directory as follows:

```xml
<NodeJsExtensionsGlobalESLintConfigurationDirectory>$(MSBuildThisFileDirectory)</NodeJsExtensionsGlobalESLintConfigurationDirectory>
```

Details on rules can be found in the [ESLint documentation](https://eslint.org/docs/latest/rules/).

If a certain rule's violation is incorrect in a given location, or you want to suppress it locally, [you can ignore the affected code](https://eslint.org/docs/latest/user-guide/configuring/rules). Just always comment such ignores to clarify why they were necessary.

### Integration with Visual Studio (Code)

Visual Studio supports ESLint out of the box. You can enable it by ticking the checkbox "Enable ESLint" under _Tools → Options → Text Editor → JavaScript/TypeScript → Linting → General_. To use ESLint in Visual Studio Code, you can use e.g. Microsoft's official [ESLint plugin](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint).

In order for Visual Studio to use the ESLint configuration provided by Node.js Extensions instead of its own, VS needs to be able to access the necessary ESLint plugins. That's why Node.js Extensions automatically copies those dependencies into your project's (or solution's) _package.json_ file.

## Operating System Compatibility Regarding Git and Line Breaks

For historical reasons, Windows uses the `\r\n` character combination (also known as CR-LF) to denote a line break, while Unix-like operating systems such as Linux and macOS simply use a single `\n` character (LF). Git (made by the creator of Linux) treats the Unix-style line endings as the only right option. If you are on Windows your Git client is almost certainly configured to "Checkout Windows-style, commit Unix-style" by default to overcome this cultural difference, but if not then it's a good practice to [configure Git](https://git-scm.com/book/en/v2/Customizing-Git-Git-Configuration#_formatting_and_whitespace) to ensure your line endings are consistent. We've disabled the [`linebreak-style`](https://eslint.org/docs/latest/rules/linebreak-style) rule to avoid cross compatibility issues.

To ensure that the files have consistent line endings in the remote repository, you can add the following _.gitattributes_ file:

```gitattributes
* text=auto
```

This will enforce the aforementioned Git configuration on a per-repository basis. The files will be checked out using your operating system's native line endings but will be committed using the Unix-style line endings. Note that the conversion only happens once you add your files to the staged changes.
