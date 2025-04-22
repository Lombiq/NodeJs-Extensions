param (
    $Packages,
    [string] $LibraryPath,
    [string] $Type,
    [string] $Paths)

function Test-NoPath($Paths) { -not (Test-Path -Path $Paths | Where-Object { $PsItem }) }

function Install-NodeJsExtensions($Path)
{
    Set-Location $Path

    if (Test-NoPath -Paths package.json,package.json5,package.yaml) {
        Copy-Item $LibraryPath/config/consumer/package.project.json package.json
    }

    if (Test-NoPath -Paths .eslintrc,.eslintrc.js) {
        Copy-Item $LibraryPath/config/consumer/.eslintrc.project.js .eslintrc.js
    }

    if (Test-NoPath -Paths .prettierrc,.prettierrc.js) {
        Copy-Item $LibraryPath/config/consumer/.prettierrc.project.js .prettierrc.js
    }

    $StyleLintPaths = @(
        '.stylelintrc'
        '.stylelintrc.js'
        '.stylelintrc.mjs'
        '.stylelintrc.cjs'
        '.stylelintrc.yml'
        '.stylelintrc.yaml'
        '.stylelintrc.json'
        'stylelint.config.js'
        'stylelint.config.mjs'
        'stylelint.config.cjs'
    )
    if (Test-NoPath -Paths $StyleLintPaths) {
        Copy-Item $LibraryPath/config/consumer/.stylelintrc.project.js .stylelintrc.js
    }

    pnpm link --global nodejs-extensions
    pnpm install @Packages
}

function Invoke-NodeJsExtensions($Type, $Paths) {
    if ($Paths.Trim()) {
        $Paths.Split(',') | ForEach-Object { $PsItem.Trim() } | Get-Item | ForEach-Object {
            Install-NodeJsExtensions -Path $PsItem
            Invoke-NodeJsExtensions -Type $Type
        }
    }
    npm explore nodejs-extensions -- pnpm "lint:$Type"
}
