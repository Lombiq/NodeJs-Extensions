# Pipeline for Markdown files

This project provides a way to lint all Markdown files in your project, a given folder, or the whole solution.

## Configuration

By default, the markdown pipeline is disabled. You need to provide a valid `source` path in order to enable it. The path must be relative to the project directory, e.g. `.`:

```json
"nodejsExtensions": {
  "markdown": {
    "source": "."
  }
}
```

### Linting the solution directory

You can use the special value `_solution_` as the source to lint every _md_ file in your solution directory. The solution directory is considered to be the first parent directory of your project that contains a _sln_ file.

This is useful to catch files not covered by an individual project, such as the root _Readme_. However, it can cause duplicate warnings for files in other projects that use `Lombiq.NodeJs.Extensions`. We suggest setting this value in the solution's "entry" project such as your Web project (e.g. [_Lombiq.OSOCE.NuGet.Web.csproj_](https://github.com/Lombiq/Open-Source-Orchard-Core-Extensions/blob/dev/NuGetTest/src/Lombiq.OSOCE.NuGet.Web/Lombiq.OSOCE.NuGet.Web.csproj)).

> ℹ When using Lombiq Node.js Extensions from a submodule, solution-wide Markdown analysis can more easily be achieved by adding the [Lombiq.NodeJs.Extensions.SolutionMarkdownAnalysis](../../Lombiq.NodeJs.Extensions.SolutionMarkdownAnalysis/Readme.md) project to your solution as well.

## Available scripts

To use the `npm` scripts defined in this project, please follow the setup instructions in the root [Readme](../../Readme.md#how-to-trigger-pipelines-on-demand).

Now, you can use either of the following `npm` scripts to lint Markdown files:

```json
"scripts": {
  "build:markdown": "npm explore nodejs-extensions -- pnpm build:markdown",
  "lint:markdown":  "npm explore nodejs-extensions -- pnpm lint:markdown"
}
```

> ℹ Remember to provide a valid [configuration](#configuration).

The difference between the two scripts is that `build:markdown` validates the `source` path before triggering the linting while `lint:markdown` will simply fail on an invalid path.

## Auto-fixing

Many markdownlint [warnings](https://github.com/DavidAnson/markdownlint/blob/main/doc/Rules.md) (error codes starting with MD00) can be auto-fixed. The MSBuild warning include “An automatic fix is available with markdownlint-cli.” when this is applicable.

1. Install [markdownlint-cli](https://github.com/igorshubovych/markdownlint-cli), e.g. by typing `pnpm install -g markdownlint-cli`
2. Locate or download our [markdownlint configuration file](../config/lombiq.markdownlint.json).
3. Execute `markdownlint --fix --config path\to\lombiq.markdownlint.json path\to\file.md`
