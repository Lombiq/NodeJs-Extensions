# Lombiq NodeJs Extensions



## About

Contains `npm scripts` to lint, compile, and watch *SCSS* files, and clean their generated assets.

This project allows you to use predefined build scripts for *SCSS* files without having to manage neither the scripts nor the necessary *npm* packages yourself.

Also see our [NPM MSBuild Targets](https://github.com/Lombiq/NPM-Targets) library which can make NPM package management a lot easier.

Do you want to quickly try out this project and see it in action? Check it out, together with its accompanying [samples](../Lombiq.NodeJs.Extensions.Samples) project, in our [Open-Source Orchard Core Extensions](https://github.com/Lombiq/Open-Source-Orchard-Core-Extensions) full Orchard Core solution and also see our other useful Orchard Core-related open-source projects!


## Getting started

First, add this project to your solution. We recommend to place it under *src/Utilities*, but you can put it anywhere. Then add it as an `npm` package to your own project running:

```
npm install --save-dev ../Utilities/Lombiq.NodeJs.Extensions/Lombiq.NodeJs.Extensions
```
This will be the path if your project resides in a child of the *src* folder. Adjust it to your needs.

Afterwards, you can define any of the scripts available in this package. Here's an overview of all of them, categorized by file type:

1. [Styles](Docs/Styles.md)

## Using pnpm

[pnpm](https://pnpm.io/) is a faster and more efficient package manager. This project uses it both for package management and script execution.

### Installation and usage

If you're using *Node.js* 16.9 or later, you can enable *pnpm* by once executing `corepack enable`. In earlier versions of *Node.js* you will need to install *pnpm* globally by running this command: `npm install pnpm -g`.


## Contributing and support

Bug reports, feature requests, comments, questions, code contributions, and love letters are warmly welcome, please do so via GitHub issues and pull requests. Please adhere to our [open-source guidelines](https://lombiq.com/open-source-guidelines) while doing so.

This project is developed by [Lombiq Technologies](https://lombiq.com/). Commercial-grade support is available through Lombiq.
