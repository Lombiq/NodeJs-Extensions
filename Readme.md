# Lombiq Node.js Extensions



[![Lombiq.NodeJs.Extensions NuGet](https://img.shields.io/nuget/v/Lombiq.NodeJs.Extensions?label=Lombiq.NodeJs.Extensions)](https://www.nuget.org/packages/Lombiq.NodeJs.Extensions/)


## About

Contains `npm scripts` to lint, compile, and watch *SCSS* files, and clean their generated assets.

This project allows you to use predefined build scripts for *SCSS* files without having to manage either the scripts or the necessary `npm` packages yourself.

Also see our [NPM MSBuild Targets](https://github.com/Lombiq/NPM-Targets) library which this project uses under the hood, and which can make NPM package management in your project a lot easier, too.

Do you want to quickly try out this project and see it in action? Check it out, together with its accompanying [samples](Lombiq.NodeJs.Extensions.Samples) [projects](Lombiq.NodeJs.Extensions.Samples.NuGet), in our [Open-Source Orchard Core Extensions](https://github.com/Lombiq/Open-Source-Orchard-Core-Extensions) full Orchard Core solution. You will find our other useful Orchard Core-related open-source projects there, too.


## Installation and usage

This project can be consumed as a `git` submodule or as a `NuGet` package.

### As a git submodule
In the case of using it as a git submodule, it is recommended to put the [main](../Lombiq.NodeJs.Extensions) project into a folder named _Lombiq.NodeJs.Extensions_ under the _src/Utilities_ folder, but this is not mandatory.

Then, add a project reference to _Lombiq.NodeJs.Extensions.csproj_ and add the following `Import` statements to your project file:

```xml
<Import Project="..\..\Utilities\Lombiq.NodeJs.Extensions\Lombiq.NodeJs.Extensions\Lombiq.NodeJs.Extensions.props"/>
<Import Project="..\..\Utilities\Lombiq.NodeJs.Extensions\Lombiq.NodeJs.Extensions\Lombiq.NodeJs.Extensions.targets"/>
```
In case you've placed the submodule in a different location, adjust the paths as necessary.

### As a NuGet package

When adding _Lombiq.NodeJs.Extensions_ as a NuGet package, no further steps are necessary.

### Integration with MSBuild

_Lombiq.NodeJs.Extensions_ tightly integrates with the MSBuild build system and executes linting and compilation tasks transparently. In case of warnings or errors during the execution of those tasks, respective warnings and errors will be generated with MSBuild and brought to your attention.

During the first build of your project after adding _Lombiq.NodeJs.Extensions_, it will additionally be added as an `npm` package to your project, which allows you to run the contained `npm` scripts from your project. Refer to the [available scripts](#available-scripts) section for more information.


## Available scripts

Here's an overview of all of the scripts this project makes available, categorized by file type:

1. [Styles](Docs/Styles.md)
2. JavaScript - coming soon

For even more examples and a mixed setup of default and non-default paths, please check out our dedicated [Samples](Lombiq.NodeJs.Extensions.Samples) project.

The [NuGet Samples](Lombiq.NodeJs.Extensions.Samples.NuGet) project serves as an example of how to use _Lombiq.NodeJs.Extensions_ from its NuGet package.

To see and run all of the defined scripts in the Visual Studio Task Runner Explorer, please install the [NPM Task Runner](https://marketplace.visualstudio.com/items?itemName=MadsKristensen.NpmTaskRunner64) extension for Visual Studio. You can then run the given scripts and inspect any errors and linter rule violations in the attached console.


## Using pnpm

[pnpm](https://pnpm.io/) is a faster and more efficient package manager. This project uses it both for package management and script execution.

### Installation and usage

If you're using *Node.js* 16.9 or later, you can enable *pnpm* by once executing `corepack enable`. In earlier versions of *Node.js* you will need to install *pnpm* globally by running this command: `npm install pnpm -g`.


## Contributing and support

Bug reports, feature requests, comments, questions, code contributions, and love letters are warmly welcome, please submit them via GitHub issues and pull requests. Please adhere to our [open-source guidelines](https://lombiq.com/open-source-guidelines) while doing so.

This project is developed by [Lombiq Technologies](https://lombiq.com/). Commercial-grade support is available through Lombiq.
