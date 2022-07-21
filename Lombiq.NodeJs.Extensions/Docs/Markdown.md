# Scripts for MD files

Since Markdown files don't need to be built, linting isn't included in the normal workflow but a separate target launches it for any project that uses _Lombiq.NodeJs.Extensions_. You can configure its behavior with the following MSBuild property:

- `<MarkdownAnalysis>`:
  - If unset, empty or "true", it engages the default behavior mentioned above.
  - If set to "false", Markdown linting is disabled.
  - If set to "solution", it will lint every _md_ file inside the `$(SolutionDir)`. This is useful to catch files not covered by an individual project, such as the root Readme. However, it can cause duplicate warnings for files in another project that uses `Lombiq.NodeJs.Extensions`.

Alternatively, you can use the NodeJS scripts [as described for JavaScript](JavaScript.md#how-to-get-started) with these:

- `lint:markdown`: Checks for _md_ files recursively in the working directory.
- `lint:markdown:args`: Checks for _md_ files recursively in the location provided by the `--directory=path` argument
- `lint:markdown:solution`: Checks for _md_ files recursively in the first parent directory that contains an _sln_ file.
