param (
    [string] $LibraryPath,
    [string] $Type,
    [string] $Paths)

function Test-NoPath($Paths) { -not (Test-Path -Path $Paths | Where-Object { $PSItem }) }

function Install-NodeJsPackage($LibraryPath)
{
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
    node $LibraryPath/scripts/add-dev-dependencies.js
}

# $Paths can be:
# { "path1": { "source": "...", "target": "..." },  "path2": { "source": "...", "target": "..." } }
# or
# path1,path2,path3

if ($Paths.Trim())
{
    $startPath = $PWD.Path

    if ($Paths.Trim().StartsWith('{'))
    {
        $pathItems = $Paths | ConvertFrom-Json -AsHashtable
        $pathItems.Keys | ForEach-Object {
            # In this case we assume that there is no project.json file, otherwise the config would already be in it.
            $projectPath = (Get-Item $PSItem).FullName
            Set-Location $projectPath

            Copy-Item (Join-Path $LibraryPath 'config' 'consumer' 'package.project.json') 'package.json'
            $packageConfig = Get-Content package.json | ConvertFrom-Json

            Write-Output "$PSItem = '$($pathItems[$PSItem])'"
            $configuration = $pathItems[$PSItem] | ConvertFrom-Json
            $packageConfig | Add-Member -Type NoteProperty -Name 'nodejsExtensions' $configuration

            $packageConfig | ConvertTo-Json | Out-File -FilePath package.json

            Set-Location $startPath
        }

        $Paths = $pathItems.Keys -join ','
    }

    $absolutePaths = $Paths.Split(',') |
        ForEach-Object { $PSItem.Trim() } |
        Get-Item |
        ForEach-Object { $PSItem.FullName }

    foreach ($projectPath in $absolutePaths)
    {
        Set-Location $projectPath
        Install-NodeJsPackage -LibraryPath $LibraryPath
        npm explore nodejs-extensions -- pnpm "lint:$Type"
    }

    Set-Location $startPath
}
