# Scripts for JS files

The scripts below lint (with [ESLint](https://eslint.org/)), transpile to ES5, and minify the given JS files into an output folder. Beyond that, there are also `clean` and `watch` scripts.

Looking for something similar for .NET? Check out our [.NET Analyzers project](https://github.com/Lombiq/.NET-Analyzers).

## Source and target paths

The default paths for JS input and output files are _Assets/Scripts_ and _wwwroot/js_, respectively. The existing folder structure in the input folder will be mirrored in the output, e.g. _Assets/Scripts/app/main.js_ will be transformed into _wwwroot/js/app/main.js_, together with _wwwroot/js/app/main.min.js_ and _wwwroot/js/app/main.min.js.map_.

### Overriding the defaults

Those defaults can be overridden by providing the following properties in your project's _package.json_ file:

```json
"nodejsExtensions": {
  "scripts": {
    "source": "path/to/raw-js",
    "target": "www/js-files"
  }
}
```

## How to get started

To use the `npm` scripts defined in this project, add any or all of the following entries to the `scripts` property in your project's _package.json_:

```json
"scripts": {
  "build:scripts": "npm explore nodejs-extensions -- pnpm build:scripts",
  "clean:scripts": "npm explore nodejs-extensions -- pnpm clean:scripts",
  "watch:scripts": "npm explore nodejs-extensions -- pnpm watch:scripts",
}
```

To see the different configurations using default and non-default paths in action, please check out our dedicated [Samples](../../Lombiq.NodeJs.Extensions.Samples/Readme.md) [projects](../../Lombiq.NodeJs.Extensions.Samples.NuGet/Readme.md).

## ESLint rules

The rules are found in 2 files:

- _.eslintrc.lombiq-base.js_: This file contains Lombiq overrides for the [airbnb-base](https://www.npmjs.com/package/eslint-config-airbnb-base) rules. It is located in _node_modules/nodejs-extensions/config_.
- _.eslintrc.js_: In this file you can override the above Lombiq rules, or define your own [ESLint configuration](https://eslint.org/docs/latest/user-guide/configuring/configuration-files) altogether.

The _.eslintrc.js_ file initially extends _.eslintrc.lombiq-base.js_ from the Node.js Extensions `npm` package. It will automatically be created in your project during the first build. Should you prefer to use a global _.eslintrc.js_ file for your whole solution, you can instruct Node.js Extensions to create that file in the location specified by the MSBuild property `<NodeJsExtensionsGlobalESLintConfigurationDirectory>`. This property is easiest added in a _Directory.Build.props_ file in your solution's root directory as follows:

```xml
<NodeJsExtensionsGlobalESLintConfigurationDirectory>$(MSBuildThisFileDirectory)</NodeJsExtensionsGlobalESLintConfigurationDirectory>
```

> ⓘ Please edit _.eslintrc.js_ once it has been created, and adjust the path to _.eslintrc.lombiq-base.js_ according to your solution's directory structure.

Details on rules can be found in the [ESLint documentation](https://eslint.org/docs/latest/rules/).

If a certain rule's violation is incorrect in a given location, or you want to suppress it locally, [you can ignore the affected code](https://eslint.org/docs/latest/user-guide/configuring/rules). Just always comment such ignores to clarify why they were necessary.

### Integration with Visual Studio (Code)

Visual Studio supports ESLint out of the box. You can enable it by ticking the checkbox "Enable ESLint" under _Tools → Options → Text Editor → JavaScript/TypeScript → Linting → General_. To use ESLint in Visual Studio Code, you can use e.g. Microsoft's official [ESLint plugin](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint).

In order for Visual Studio to use the ESLint configuration provided by Node.js Extensions instead of its own, it needs to be able to access the necessary ESLint plugins. Here's how to set this up:

#### At the project level

1. `<NodeJsExtensionsGlobalESLintConfigurationDirectory>` is empty or not set.
2. If the consuming project does not contain a _package.json_ file yet, Node.js Extensions will create it.
3. In case you already have a _package.json_ file there, copy the `devDependencies` node from _./config/consumer/package.project.json_ into it.
4. Building your project will install the necessary dependencies.

#### At the solution level

1. `<NodeJsExtensionsGlobalESLintConfigurationDirectory>` is set to a valid directory path.
2. If a _package.json_ file does not exist at that path yet, Node.js Extensions will create it (only when using Node.js Extensions from a submodule).
3. Otherwise, copy the `devDependencies` node from _./config/consumer/package.global.json_ into it.
4. Building your solution will install the necessary dependencies.

Afterwards, Visual Studio will show ESLint warnings already during development, using the same configuration that will be used during the build.

## Operating System Compatibility Regarding Git and Line Breaks

For historical reasons, Windows uses the `\r\n` character combination (also known as CR-LF) to denote a line break, while Unix-like operating systems such as Linux and macOS simply use a single `\n` character (LF). Git (made by the creator of Linux) treats the Unix-style line endings as the only right option. If you are on Windows your Git client is almost certainly configured to "Checkout Windows-style, commit Unix-style" by default to overcome this cultural difference, but if not then it's a good practice to [configure Git](https://git-scm.com/book/en/v2/Customizing-Git-Git-Configuration#_formatting_and_whitespace) to ensure your line endings are consistent. We've disabled the [`linebreak-style`](https://eslint.org/docs/latest/rules/linebreak-style) rule to avoid cross compatibility issues.

To ensure that the files have consistent line endings in the remote repository, you can add the following _.gitattributes_ file:

```gitattributes
* text=auto
```

This will enforce the aforementioned Git configuration on a per-repository basis. The files will be checked out using your operating system's native line endings but will be committed using the Unix-style line endings. Note that the conversion only happens once you add your files to the staged changes.
