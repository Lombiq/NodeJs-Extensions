# Lombiq Node.js Extensions

[![Lombiq.NodeJs.Extensions NuGet](https://img.shields.io/nuget/v/Lombiq.NodeJs.Extensions?label=Lombiq.NodeJs.Extensions)](https://www.nuget.org/packages/Lombiq.NodeJs.Extensions/)

## About

This project provides several MSBuild-integrated frontend asset pipelines - for SCSS, JS, Markdown and other arbitrary files. It uses static configuration from your _package.json_ with sensible defaults to free you from managing NPM packages and scripts yourself.

It makes use of our [NPM MSBuild Targets](https://github.com/Lombiq/NPM-Targets) project, which can make NPM package management in your project a lot easier, too.

If you're interested in an overview of the rationale behind this project, and a glimpse at its inner workings, see [our blog post](https://orcharddojo.net/blog/delivering-a-node-js-asset-pipeline-as-a-nuget-package).

Do you want to quickly try out this project and see it in action? Check it out, together with its accompanying [samples](Lombiq.NodeJs.Extensions.Samples/Readme.md) [projects](Lombiq.NodeJs.Extensions.Samples.NuGet/Readme.md), in our [Open-Source Orchard Core Extensions](https://github.com/Lombiq/Open-Source-Orchard-Core-Extensions) full Orchard Core solution. You will find our other useful Orchard Core-related open-source projects there, too.

## Prerequisites

To use this project, you will most of all need [Node.js](https://nodejs.org/) and [PNPM](https://pnpm.io) (for package management and script execution).

❕ Please follow our recommended setup guides for [Windows](Lombiq.NodeJs.Extensions/Docs/SetupWindows.md) or [Linux](Lombiq.NodeJs.Extensions/Docs/SetupLinux.md), as applicable. ❕

- Should you need an older Node.js version for some reason, try to use **v16.9** or above, or **v14.19** or above, as those allow the usage of `pnpm` via `corepack` without any additional installation.
- On Node.js versions older than the recommended ones, install PNPM globally: `npm install pnpm --global`.

## Installation

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

> ℹ In case you've placed the submodule in a different location or your consuming project is nested deeper, adjust the paths as necessary.

### As a NuGet package

When adding `Lombiq.NodeJs.Extensions` as a NuGet package, no further steps are necessary.

## Usage

### Integration with MSBuild

The Lombiq Node.js Extensions project tightly integrates with MSBuild and executes linting, compilation and minification tasks as part of the project's regular build process. All generated assets will be properly embedded in the project's assembly.

In case of warnings or errors during the execution of the different pipelines, respective MSBuild warnings and errors will be generated and surfaced. To increase the log verbosity, set `<NxVerbosity>` to a higher [importance](https://learn.microsoft.com/en-us/dotnet/api/microsoft.build.framework.messageimportance) value than the default `Low` in your project file.

### Configuration

This project contains some default configuration which can be customized to suit your needs. Your configuration needs to be placed in your project's _package.json_ file like so:

```json
"nodejsExtensions": {
  "assetsToCopy": [ { }, { } ],
  "scripts": { },
  "styles": { },
}
```

Refer to the respective [pipelines](#available-pipelines) for details.

### Available pipelines

Here's an overview of the asset pipelines this project makes available:

- [Asset Copying](Lombiq.NodeJs.Extensions/Docs/AssetCopying.md)
- [JavaScript](Lombiq.NodeJs.Extensions/Docs/JavaScript.md)
- [Markdown](Lombiq.NodeJs.Extensions/Docs/Markdown.md)
- [Styles](Lombiq.NodeJs.Extensions/Docs/Styles.md)

Please check out our dedicated [Samples](Lombiq.NodeJs.Extensions.Samples/Readme.md) project to see the integration in action. The [NuGet Samples](Lombiq.NodeJs.Extensions.Samples.NuGet/Readme.md) project shows how to use `Lombiq.NodeJs.Extensions` as a NuGet package.

### How to trigger pipelines on demand

Many of the pipeline steps can be run from the _Visual Studio Task Runner Explorer_ to avoid building the whole project. Follow these steps to set this up:

1. Build your project once to bootstrap the integration of Lombiq Node.js Extensions into your project.
2. Ensure any or all of the following `scripts` entries are part of your _package.json_:

    ```json
    "scripts": {
      "build":   "npm explore nodejs-extensions -- pnpm build",
      "compile": "npm explore nodejs-extensions -- pnpm compile",
      "lint":    "npm explore nodejs-extensions -- pnpm lint",
      "clean":   "npm explore nodejs-extensions -- pnpm clean",
      "watch":   "npm explore nodejs-extensions -- pnpm watch"
    }
    ```

3. Install the [NPM Task Runner](https://marketplace.visualstudio.com/items?itemName=MadsKristensen.NpmTaskRunner64) extension.
4. Open the _Task Runner Explorer_ window and select your project. You should now see the above scripts under the `Custom` node.
5. Execute any of the available scripts by double-clicking.
6. You will now be able to inspect any errors and linter violations directly in the attached console.

### Scripts details

The `build` script is a wrapper for the `build:styles`, `build:scripts` and `build:assets` scripts, which each constitute their own pipeline, and which are executed in parallel. This is the script that's used during the regular project build.

The `compile` script is a wrapper for the `compile:styles`, `compile:scripts` and `compile:assets` scripts, which are also executed in parallel. This is the script that's used during NuGet packaging.

The `lint` script calls respective linting scripts for SCSS, JavaScript and Markdown files, which are part of their respective pipelines and are executed in parallel.

## Contributing and support

Bug reports, feature requests, comments, questions, code contributions and love letters are warmly welcome. You can send them to us via GitHub issues and pull requests. Please adhere to our [open-source guidelines](https://lombiq.com/open-source-guidelines) while doing so.

This project is developed by [Lombiq Technologies](https://lombiq.com/). Commercial-grade support is available through Lombiq.
