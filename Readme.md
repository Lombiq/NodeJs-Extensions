# Lombiq Node.js Extensions



[![Lombiq.NodeJs.Extensions NuGet](https://img.shields.io/nuget/v/Lombiq.NodeJs.Extensions?label=Lombiq.NodeJs.Extensions)](https://www.nuget.org/packages/Lombiq.NodeJs.Extensions/)


## About

Contains `npm scripts` to lint, compile, and watch *SCSS* files, and clean their generated assets.

This project allows you to use predefined build scripts for *SCSS* files without having to manage neither the scripts nor the necessary *npm* packages yourself.

Also see our [NPM MSBuild Targets](https://github.com/Lombiq/NPM-Targets) library which can make NPM package management a lot easier.

Do you want to quickly try out this project and see it in action? Check it out, together with its accompanying [samples](../Lombiq.NodeJs.Extensions.Samples) project, in our [Open-Source Orchard Core Extensions](https://github.com/Lombiq/Open-Source-Orchard-Core-Extensions) full Orchard Core solution and also see our other useful Orchard Core-related open-source projects!


## Installation and usage

It's recommended to put this project into a folder named _Lombiq.NodeJs.Extensions_ under the _src/Utilities_ folder, but you can put it anywhere. Then add it as an `npm` package to your own project running:

```
npm install --save-dev ../../Utilities/Lombiq.NodeJs.Extensions/Lombiq.NodeJs.Extensions
```
This will be the path if your project resides in a child of the *src* folder. Adjust it to your needs.

Afterwards, you can use any of the [available scripts](#available-scripts) in this package.


### Integrating with MSBuild

If you want to integrate Stylelint into MSBuild builds, then you need to include Lombiq's [NPM MSBuild Targets](https://github.com/Lombiq/NPM-Targets), too. Make sure you have a _package.json_ file with the `dotnet-prebuild` and `dotnet-postclean` scripts as indicated in the repository's readme. In the affected projects, you need to import these files in the `.csproj` file:

```xml
<Import Project="..\..\Utilities\Lombiq.Npm.Targets\Lombiq.Npm.Targets.props" />
<Import Project="..\..\Utilities\Lombiq.Npm.Targets\Lombiq.Npm.Targets.targets" />
<Import Project="..\..\Utilities\Lombiq.NodeJs.Extensions\Lombiq.NodeJs.Extensions\Lombiq.NodeJs.Extensions.targets"/>
```

Then, warnings will be sent to the error list if the linter finds rule violations.


## Available scripts

Here's an overview of all of the scripts this project makes available, categorized by file type:

1. [Styles](Docs/Styles.md)
2. JavaScript - coming soon

For even more examples and a mixed setup of default and non-default paths, please check out our dedicated [Samples](Lombiq.NodeJs.Extensions.Samples) project.

To see and run all of the defined scripts in the Visual Studio Task Runner Explorer console, you need to install the [NPM Task Runner](https://marketplace.visualstudio.com/items?itemName=MadsKristensen.NpmTaskRunner64) extension for Visual Studio. You can then run the given scripts and inspect any errors and linter rule violations in the attached console.


## Using pnpm

[pnpm](https://pnpm.io/) is a faster and more efficient package manager. This project uses it both for package management and script execution.

### Installation and usage

If you're using *Node.js* 16.9 or later, you can enable *pnpm* by once executing `corepack enable`. In earlier versions of *Node.js* you will need to install *pnpm* globally by running this command: `npm install pnpm -g`.


## Contributing and support

Bug reports, feature requests, comments, questions, code contributions, and love letters are warmly welcome, please do so via GitHub issues and pull requests. Please adhere to our [open-source guidelines](https://lombiq.com/open-source-guidelines) while doing so.

This project is developed by [Lombiq Technologies](https://lombiq.com/). Commercial-grade support is available through Lombiq.
