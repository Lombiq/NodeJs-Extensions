# Scripts to Copy Additional Assets

Lombiq Node.js Extensions offer the ability to copy additional assets to your _wwwroot_ or any other folder during the build of your project, and clean them when your project is cleaned.

Your assets will automatically be copied during project build once you provide a valid [configuration](#configuration).

## Asset paths

The default asset target path is _wwwroot/vendors_, so assets inside that directory will automatically become part of the assembly during build.

### Overriding the default

Should you prefer to use a different target path, please adjust it in your project file by adding the following property:

```xml
<NodeJsExtensionsAssetsTargetFolder>wwwroot/other</NodeJsExtensionsAssetsTargetFolder>
```

## Configuration

You need to provide a map of source and target paths either in a separate file called _assets-to-copy.json_ or as a property in your _package.json_ named `assetsToCopy`. The configuration will be loaded in that order. Its format is as follows:

```json
[
    {
        "sources": [ "single/source/path" ],
        "target": "wwwroot/other/single"
    },
    {
        "sources": [
            "source/path/one",
            "source/path/two"
        ],
        "pattern": "custom-*.jpg",
        "target": "wwwroot/other/both"
    }
]
```

Any number of asset groups can be provided. By default, the whole tree underneath any source path will be copied to the respective target path. Using the optional `pattern` property, this behavior can be customized by restricting the files and folders to copy using a glob pattern.

> ℹ Please note that all asset target paths in the configuration need to be located under the path specified by `<NodeJsExtensionsAssetsTargetFolder>`, which defaults to _wwwroot/vendors_.
