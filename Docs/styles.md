# Scripts for SCSS files



These scripts lint (with [Stylelint](https://stylelint.io/)), compile, autoprefix, and minify the given *scss* files into an output folder. Beyond that, there are also a *clean*  and a *watch* script.

Looking for something similar for .NET? Check out our [.NET Analyzers project](https://github.com/Lombiq/.NET-Analyzers).

You can use it as follows:

1. Copy *example.stylelintrc* from the *Stylelint* folder of this project to the root folder of your solution (i.e. where you have the *.sln* file), rename it to *.stylelintrc*, and optionally adjust the location of *lombiq-base.stylelintrc* inside the file.
2. In your *package.json*, add any or all of the following entries to the `scripts` property:
    - If you're using the default source path *Assets/Styles* and target path *wwwroot/css*, then this will do:
      ```json
      "scripts": {
        "build": "npm run build:styles",
        "build:styles": "npm explore nodejs-extensions -- npm run build:styles",
        "clean": "npm run clean:styles",
        "clean:styles": "npm explore nodejs-extensions -- npm run clean:styles",
        "watch": "npm run watch:styles",
        "watch:styles": "npm explore nodejs-extensions -- npm run watch:styles",
      }
      ```
    - If you're using the non-default paths, then you will need to add the following:
      ```json
      "scripts": {
        "build": "npm run build:styles",
        "build:styles": "npm explore nodejs-extensions -- npm run build:styles:args --source=<path/to/scss> --target=<path-to-css>",
        "clean": "npm run clean:styles",
        "clean:styles": "npm explore nodejs-extensions -- npm run clean:styles:args --target=<path-to-css>",
        "watch": "npm run watch:styles",
        "watch:styles": "npm explore nodejs-extensions -- npm run watch:styles:args --source=<path/to/scss> --target=<path-to-css>",
      }
      ```
3. For even more examples and a mixed setup of default and non-default paths, please check out our dedicated [Samples](../Lombiq.NodeJs.Extensions.Samples) project.

To see and run all of the defined scripts in the Visual Studio Task Runner Explorer console, you need to install the [NPM Task Runner](https://marketplace.visualstudio.com/items?itemName=MadsKristensen.NpmTaskRunner64) extension for Visual Studio. You can then run the given scripts and inspect any errors and linter rule violations in the attached console.

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

Details on rules can be found in the [Stylelint documentation](https://stylelint.io/user-guide/rules/list). If you want to find out what the currently applied configuration is, coming from all the various extended configuration files, then run `npx stylelint --print-config . > rules.json` at the given location.

The MSBuild or npm script output will show you all of the Stylelint rule violations in a detailed manner.

If a certain rule's violation is incorrect in a given location, or you want to suppress it locally, [you can ignore the affected code](https://stylelint.io/user-guide/ignore-code/). Just always comment such ignores so it's apparent why it was necessary.
