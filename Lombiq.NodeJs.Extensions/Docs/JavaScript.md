# Scripts for JS files



The scripts below lint (with [ESLint](https://eslint.org/)), transpile to ES5, and minify the given JS files into an output folder. Beyond that, there are also `clean` and `watch` scripts.

The usage of these scripts is optional. `Lombiq Node.js Extensions` is able to process your JS files during the regular build of your project via MSBuild or the `dotnet` CLI without further work from your side. These scripts are meant to be used during development for short feedback loops, most of all the `watch` script.

Looking for something similar for .NET? Check out our [.NET Analyzers project](https://github.com/Lombiq/.NET-Analyzers).


## Source and target paths

The default paths for JS input and output files are *Assets/Scripts* and *wwwroot/js*, respectively. The existing folder structure in the input folder will be mirrored in the output, e.g. *Assets/Scripts/app/main.js* will be transformed into *wwwroot/js/app/main.js*, together with *wwwroot/js/app/main.min.js* and *wwwroot/js/app/main.js.map*.

### Overriding the defaults - coming soon!

Those defaults can be overridden by providing the following MSBuild properties in your project file:

```xml
<NodeJsExtensionsScriptsSourceFolder>Assets/Scripts</NodeJsExtensionsScriptsSourceFolder>
<NodeJsExtensionsScriptsTargetFolder>wwwroot/js</NodeJsExtensionsScriptsTargetFolder>
```


## How to get started

To use the `npm` scripts defined in this project, add any or all of the following entries to the `scripts` property in your project's *package.json*:

- If you're using the default paths, then use these:

  ```json
  "scripts": {
    "build": "npm run build:scripts",
    "build:scripts": "npm explore nodejs-extensions -- pnpm run build:scripts",
    "clean": "npm run clean:scripts",
    "clean:scripts": "npm explore nodejs-extensions -- pnpm run clean:scripts",
    "watch": "npm run watch:scripts",
    "watch:scripts": "npm explore nodejs-extensions -- pnpm run watch:scripts",
  }
  ```

- If you're using non-default paths (support for which is coming soon), then you will need to add the following entries (using the example paths above):

  ```json
  "scripts": {
    "build": "npm run build:scripts",
    "build:scripts": "npm explore nodejs-extensions -- npm run build:scripts:args --source=path/to/my/js-files --target=path/to/my/js-files",
    "clean": "npm run clean:scripts",
    "clean:scripts": "npm explore nodejs-extensions -- npm run clean:scripts:args --target=path/to/my/js-files",
    "watch": "npm run watch:scripts",
    "watch:scripts": "npm explore nodejs-extensions -- npm run watch:scripts:args --source=path/to/my/js-files --target=path/to/my/js-files",
  }
  ```

To see the different configurations of default and non-default paths in action, please check out our dedicated [Samples](../../Lombiq.NodeJs.Extensions.Samples/Readme.md) [projects](../../Lombiq.NodeJs.Extensions.Samples.NuGet/Readme.md).

### Integration with Visual Studio (Code)

Visual Studio supports ESLint out of the box. You can enable it by ticking the checkbox "Enable ESLint" under *Tools -> Options -> Text Editor -> JavaScript/TypeScript -> Linting -> General*. Visual Studio will use the ESLint configuration provided by Node.js Extensions which allows to keep development and build time error reporting in sync.

To use ESLint in Visual Studio Code, you can use e.g. Microsoft's official [ESLint plugin](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint).


## ESLint rules

The rules are found in 2 files:
- *.eslintrc.lombiq-base.js*: This file contains Lombiq overrides for the [airbnb-base](https://www.npmjs.com/package/eslint-config-airbnb-base) rules. It is located in *node_modules/nodejs-extensions/config*.
- *.eslintrc.json*: In this file you can override the above Lombiq rules, or define your own [ESLint configuration](https://eslint.org/docs/user-guide/configuring/configuration-files) altogether.

The *.eslintrc.json* file initially extends *.eslintrc.lombiq-base.js* from the Node.js Extensions `npm` package. It will automatically be created in your project during the first build. Should you prefer to use a global *.eslintrc* for your whole solution, or use any other way of [configuring ESLint](https://eslint.org/docs/user-guide/configuring/configuration-files), you can disable this behavior by adding the following property to your project file:

```xml
<NodeJsExtensionsCreateESLintConfigurationFile>false</NodeJsExtensionsCreateESLintConfigurationFile>
```

You can use a single *.eslintrc* configuration file for all projects in a solution as follows:

1. Move *.eslintrc.json* from your project into the root folder of your solution, i.e. next to your solution file.
2. Edit *.eslintrc.json* and adjust the path to *.eslintrc.lombiq-base.js*.


## Operating System Compatibility Regarding Git and Line Breaks

For historical reasons, Windows uses the `\r\n` character combination (also known as CR-LF) to denote a line break, while Unix-like operating systems such as Linux and macOS simply use a single `\n` character (LF). Git (made by the creator of Linux) treats the Unix-style line endings as the only right option. If you are on Windows your Git client is almost certainly configured to "Checkout Windows-style, commit Unix-style" by default to overcome this cultural difference, but if not then it's a good practice to [configure Git](https://git-scm.com/book/en/v2/Customizing-Git-Git-Configuration#_formatting_and_whitespace) to ensure your line endings are consistent. We've disabled the [`linebreak-style`](https://eslint.org/docs/rules/linebreak-style) rule to avoid cross compatibility issues.

To ensure that the files have consistent line endings in the remote repository, you can add the following _.gitattributes_ file:

```
* text=auto
```

This will enforce the aforementioned Git configuration on a per-repository basis. The files will be checked out using your operating system's native line endings but will be committed using the Unix-style line endings. Note that the conversion only happens once you add your files to the staged changes.
