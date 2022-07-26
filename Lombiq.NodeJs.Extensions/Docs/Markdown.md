# Scripts for MD files

Since Markdown files don't need to be built, linting isn't included in the normal workflow but a separate target can launch it for any project that uses _Lombiq.NodeJs.Extensions_. You can configure its behavior with the following MSBuild property:

- `<MarkdownAnalysis>`:
  - If set to "false" or if unset (default), Markdown linting is disabled.
  - If set to "true", it lints every _md_ file inside the project's directory.
  - If set to "solution", it lints every _md_ file inside the `$(SolutionDir)`. This is useful to catch files not covered by an individual project, such as the root Readme. However, it can cause duplicate warnings for files in another project that uses `Lombiq.NodeJs.Extensions`. We suggest setting this value in the solution's "entry" project such your Web project (e.g. [Lombiq.OSOCE.NuGet.Web.csproj](https://github.com/Lombiq/Open-Source-Orchard-Core-Extensions/blob/dev/NuGetTest/src/Lombiq.OSOCE.NuGet.Web/Lombiq.OSOCE.NuGet.Web.csproj)). If you are not doing anything else there, also include the properties `<ExecDotnetPostcleanCommand>false</ExecDotnetPostcleanCommand>` and `<ExecDotnetPrebuildCommand>false</ExecDotnetPrebuildCommand>` to avoid running the JS/SCSS/Assets pipelines.

> ℹ If you include the repository as submodule and want Solution-wide Markdown analysis it's better to add the [Lombiq.NodeJs.Extensions.SolutionMarkdownAnalysis](../../Lombiq.NodeJs.Extensions.SolutionMarkdownAnalysis/Readme.md) project to your solution.

Alternatively, you can use the following `npm` scripts [as described for JavaScript](JavaScript.md#how-to-get-started):

- `lint:markdown`: Checks for _md_ files recursively in the working directory.
- `lint:markdown:args`: Checks for _md_ files recursively in the location provided by the `--directory=path` argument
- `lint:markdown:solution`: Checks for _md_ files recursively in the first parent directory that contains an _sln_ file.
