# Lombiq Node.js Extensions

[![Lombiq.NodeJs.Extensions NuGet](https://img.shields.io/nuget/v/Lombiq.NodeJs.Extensions?label=Lombiq.NodeJs.Extensions)](https://www.nuget.org/packages/Lombiq.NodeJs.Extensions/)

## About

Contains `npm scripts` to lint, compile, minify, and watch SCSS and JS files, and clean their generated assets.

This project allows you to use predefined build scripts for SCSS and JS files without having to manage either the scripts or the necessary `npm` packages yourself.

Also see our [NPM MSBuild Targets](https://github.com/Lombiq/NPM-Targets) library, which this project uses under the hood, and which can make NPM package management in your project a lot easier, too.

Do you want to quickly try out this project and see it in action? Check it out, together with its accompanying [samples](Lombiq.NodeJs.Extensions.Samples/Readme.md) [projects](Lombiq.NodeJs.Extensions.Samples.NuGet/Readme.md), in our [Open-Source Orchard Core Extensions](https://github.com/Lombiq/Open-Source-Orchard-Core-Extensions) full Orchard Core solution. You will find our other useful Orchard Core-related open-source projects there, too.

## Installation and usage

This project can be consumed as a `git` submodule or as a `NuGet` package.

### As a Git submodule

In the case of using `Lombiq.NodeJs.Extensions` as a git submodule, it is recommended to put it into a folder named _Lombiq.NodeJs.Extensions_ under the _src/Utilities_ folder, but you are free to use a different location. You need to add [`Lombiq.Npm.Targets`](https://github.com/Lombiq/NPM-Targets) to the same folder, though.

Then, add a project reference to _Lombiq.NodeJs.Extensions/Lombiq.NodeJs.Extensions.csproj_ and the following `Import` statements to your project file:

```xml
<!-- At the top: -->
<Import Project="..\..\Utilities\Lombiq.NodeJs.Extensions\Lombiq.NodeJs.Extensions\Lombiq.NodeJs.Extensions.props" />

<!-- At the bottom: -->
<Import Project="..\..\Utilities\Lombiq.NodeJs.Extensions\Lombiq.NodeJs.Extensions\Lombiq.NodeJs.Extensions.targets" />
```

In case you've placed the submodule in a different location, adjust the paths as necessary.

### As a NuGet package

When adding `Lombiq.NodeJs.Extensions` as a NuGet package, no further steps are necessary.

### Integration with MSBuild

`Lombiq.NodeJs.Extensions` tightly integrates with MSBuild and executes linting, compilation, and minification tasks transparently. In case of warnings or errors during the execution of those tasks, respective MSBuild warnings and errors will be generated and surfaced.

During the first build of your project after adding `Lombiq.NodeJs.Extensions`, it will additionally be added as an `npm` package to your project, which allows you to run the contained `npm` scripts from your project. Refer to the [available scripts](#available-scripts) section for more information.

### Troubleshooting

You may encounter the following error:

```text
ENOENT: no such file or directory, realpath [...]
```

In this case, please try moving your solution to a folder with a shorter path. Should this not be enough, try to override the `NodeJsExtensionsNpmPackageSourcePath` property with something shorter than the default value of `./node_modules/.nx`. You can try to use `.nx`, but you then need to add _.nx_ to your _.gitignore_ file. If this still doesn't work, please set `NodeJsExtensionsNpmPackageSourcePath` to the relative path to your solution root or a similar location.

The underlying problem is a too long path name on Windows, and the error appears even when the support for path lengths of over 260 characters has been enabled.

## Available scripts

Here's an overview of all of the scripts this project makes available, categorized by file type:

1. [Styles](Lombiq.NodeJs.Extensions/Docs/Styles.md)
2. [JavaScript](Lombiq.NodeJs.Extensions/Docs/JavaScript.md)
3. [Markdown](Lombiq.NodeJs.Extensions/Docs/Markdown.md)

Please check out our dedicated [Samples](Lombiq.NodeJs.Extensions.Samples/Readme.md) project to see the integration in action.

The [NuGet Samples](Lombiq.NodeJs.Extensions.Samples.NuGet/Readme.md) project serves as an example of how to use `Lombiq.NodeJs.Extensions` from its NuGet package.

To see and run all of the defined scripts in the Visual Studio Task Runner Explorer, please install the [NPM Task Runner](https://marketplace.visualstudio.com/items?itemName=MadsKristensen.NpmTaskRunner64) extension for Visual Studio. You can then run the given scripts and inspect any errors and linter rule violations in the attached console.

## Using pnpm

[pnpm](https://pnpm.io/) is a faster and more efficient package manager. This project uses `pnpm` both for package management and script execution.

If you're using `Node.js` 16.9 or later, `pnpm` will be used automatically. With earlier versions of `Node.js` you will need to install `pnpm` version 6 globally by running this command: `npm install pnpm@v6 -g`.

## Contributing and support

Bug reports, feature requests, comments, questions, code contributions and love letters are warmly welcome. You can send them to us via GitHub issues and pull requests. Please adhere to our [open-source guidelines](https://lombiq.com/open-source-guidelines) while doing so.

This project is developed by [Lombiq Technologies](https://lombiq.com/). Commercial-grade support is available through Lombiq.
