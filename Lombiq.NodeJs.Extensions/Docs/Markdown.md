# Scripts for MD files

## Usage

Since Markdown files don't need to be built, linting them isn't included in the normal workflow. Instead, a separate target can launch it for any project that uses _Lombiq.NodeJs.Extensions_. You can configure its behavior with the following MSBuild property:

- `<NodeJsExtensionsMarkdownAnalysisMode>`:
  - If set to "false" or if unset (default), Markdown linting is disabled.
  - If set to "true", it lints every _md_ file inside the project's directory.
  - If set to "solution", it lints every _md_ file inside the `$(SolutionDir)`. This is useful to catch files not covered by an individual project, such as the root Readme. However, it can cause duplicate warnings for files in another project that uses `Lombiq.NodeJs.Extensions`. We suggest setting this value in the solution's "entry" project such as your Web project (e.g. [_Lombiq.OSOCE.NuGet.Web.csproj_](https://github.com/Lombiq/Open-Source-Orchard-Core-Extensions/blob/dev/NuGetTest/src/Lombiq.OSOCE.NuGet.Web/Lombiq.OSOCE.NuGet.Web.csproj)). If you are not doing anything else there, also include the properties `<ExecDotnetPostcleanCommand>false</ExecDotnetPostcleanCommand>` and `<ExecDotnetPrebuildCommand>false</ExecDotnetPrebuildCommand>` to avoid running the JS/SCSS/Assets pipelines.

> ℹ If you include the repository as submodule and want Solution-wide Markdown analysis it's better to add the [Lombiq.NodeJs.Extensions.SolutionMarkdownAnalysis](../../Lombiq.NodeJs.Extensions.SolutionMarkdownAnalysis/Readme.md) project to your solution.

Alternatively, you can use the following `npm` scripts [as described for JavaScript](JavaScript.md#how-to-get-started):

- `lint:markdown`: Checks for _md_ files recursively in the working directory.
- `lint:markdown:args`: Checks for _md_ files recursively in the location provided by the `--directory=path` argument
- `lint:markdown:solution`: Checks for _md_ files recursively in the first parent directory that contains an _sln_ file.

## Auto-fixing

Many markdownlint [warnings](https://github.com/DavidAnson/markdownlint/blob/main/doc/Rules.md) (error codes starting with MD00) can be auto-fixed. The MSBuild warning include “An automatic fix is available with markdownlint-cli.” when this is applicable.

1. Install [markdownlint-cli](https://github.com/igorshubovych/markdownlint-cli), e.g. by typing `pnpm install -g markdownlint-cli`
2. Locate or download our [markdownlint configuration file](../config/lombiq.markdownlint.json).
3. Execute `markdownlint --fix --config path\to\lombiq.markdownlint.json path\to\file.md`
