# Scripts to Copy Additional Assets

Lombiq Node.js Extensions offer the ability to copy additional assets to your _wwwroot_ or any other folder during the build of your project, and clean them when your project is cleaned.

Your assets will automatically be copied during project build once you provide a valid configuration as shown below.

## Configuration

You need to provide a map of source and target paths either in a separate file called _assets-to-copy.json_ or as a property in your _package.json_ named `assetsToCopy`. The configuration will be loaded in that order. Its format is as follows:

```json
[
    {
        "sources": [ "single/source/path" ],
        "target": [ "wwwroot/single" ]
    },
    {
        "sources": [
            "source/path/one",
            "source/path/two"
        ],
        "pattern": "custom-*.jpg",
        "target": [ "wwwroot/both" ]
    }
]
```

Any number of asset groups can be provided. By default, the whole tree underneath any source path will be copied to the respective target path. Using the optional `pattern` property, this behavior can be customized by restricting the files and folders to copy using a glob pattern.
