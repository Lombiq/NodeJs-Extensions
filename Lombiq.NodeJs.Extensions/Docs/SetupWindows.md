# Recommended Setup of Node.js on Windows

We recommend [NVM for Windows](https://github.com/coreybutler/nvm-windows) to easily install, update and manage Node.js on our machines instead of directly installing it. As an added bonus, it allows you to switch between Node.js versions in a matter of seconds. If you’re on Linux, please follow [this guide](SetupLinux.md).

Alternatively, you can install Node.js via its [installer](https://nodejs.org/en/download/) directly (we recommend the latest LTS version) and skip down to [Additional Configuration](#additional-configuration). However, we recommend against trying to maintain a Node.js installation this way.

## Migration from an existing Node.js installation

1. Optional: Backup any global `npmrc` config, e.g. _%AppData%\\npm\\etc\\npmrc_. Alternatively, copy the settings to the user config _%UserProfile%\\.npmrc_.
2. Uninstall Node.js via Add or Remove Programs.
3. Delete the Node.js installation directory %ProgramFiles%\\nodejs by hand, should it remain.
   1. Using PowerShell: rmdir -r "$env:ProgramFiles\\nodejs".
4. Delete the NPM cache usually located in %AppData%\\npm.
   1. Using PowerShell: rmdir -r "$env:AppData\\npm".
5. Go to [the next section](#setting-up-nodejs-with-nvm-for-windows).

## Setting up Node.js with NVM for Windows

1. Close all Visual Studio instances.
2. Install the latest release of [NVM for Windows](https://github.com/coreybutler/nvm-windows).
3. Use the _nvm-setup.exe_ from the list of assets.
4. If your user folder contains **accented characters** or **spaces**, then in the installer wizard **select a different path** as the NVM installation location, which is free of those characters. Otherwise, `nvm` commands will fail later on.
5. Open a new PowerShell window (or your favorite shell). _Note:_ If you had a shell window open before running the NVM installer, it might not recognize the new `nvm` commands. Open a new window.
6. Run `nvm install lts`. This will install the latest LTS version of Node.js.
7. Run `nvm use lts`. This will activate the latest LTS version of Node.js as the current version.
8. Should you need any other version of Node.js, e.g. for a certain client, run `nvm list available`, pick the desired version, and run `nvm install` and `nvm use` with that version.
9. Skip down and follow [Additional Configuration](#additional-configuration) section.

## Additional configuration

1. You need to [enable long paths](https://learn.microsoft.com/en-us/windows/win32/fileio/maximum-file-path-limitation?tabs=powershell#enable-long-paths-in-windows-10-version-1607-and-later) to support the deep directory structure PNPM generates (after set the long paths key, **a reboot is necessary for the changes to take effect**).
2. Visual Studio users should add the Node.js installation path to the list of ["External Web Tools"](https://devblogs.microsoft.com/dotnet/customize-external-web-tools-in-visual-studio-2015/) to ensure VS uses the same version that's used from the command line. To configure this:
   1. Start Visual Studio without opening any solution.
   2. Open Tools → Options → Projects and Solutions → Web Package Management → External Web Tools.
   3. Add _C:\\Program Files\\NodeJs_ to the list and move it to the top.
3. Install the [NPM Task Runner](https://marketplace.visualstudio.com/items?itemName=MadsKristensen.NpmTaskRunner64) extension for Visual Studio to execute any project’s node scripts, defined in their respective _package.json_, from the Task Runner Explorer window.
