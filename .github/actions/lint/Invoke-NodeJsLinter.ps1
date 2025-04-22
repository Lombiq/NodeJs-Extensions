param (
    $Packages,
    [string] $LibraryPath,
    [string] $Type,
    [string] $Paths)

function Test-NoPath($Paths) { -not (Test-Path -Path $Paths | Where-Object { $PSItem }) }

function Install-NodeJsPackage($Packages, $ProjectPath, $LibraryPath)
{
    Set-Location $ProjectPath

    if (Test-NoPath -Paths package.json, package.json5, package.yaml)
    {
        Copy-Item $LibraryPath/config/consumer/package.project.json package.json
    }

    if (Test-NoPath -Paths .eslintrc, .eslintrc.js)
    {
        Copy-Item $LibraryPath/config/consumer/.eslintrc.project.js .eslintrc.js
    }

    if (Test-NoPath -Paths .prettierrc, .prettierrc.js)
    {
        Copy-Item $LibraryPath/config/consumer/.prettierrc.project.js .prettierrc.js
    }

    $styleLintPaths = @(
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
    if (Test-NoPath -Paths $styleLintPaths)
    {
        Copy-Item $LibraryPath/config/consumer/.stylelintrc.project.js .stylelintrc.js
    }

    pnpm link --global nodejs-extensions
    pnpm install @Packages
}

if ($Paths.Trim())
{
    $Paths.Split(',') | ForEach-Object { $PSItem.Trim() } | Get-Item | ForEach-Object {
        Install-NodeJsPackage -Packages $Packages -ProjectPath $PSItem -LibraryPath $LibraryPath
        Invoke-NodeJsExtensions -Type $Type
    }
}
npm explore nodejs-extensions -- pnpm "lint:$Type"
