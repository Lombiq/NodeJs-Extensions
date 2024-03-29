# Recommended Setup of Node.js on Linux

If you installed NPM from your package manager, you will likely suffer an `EACCES` error when you try to install a package globally. The [recommended solution](https://docs.npmjs.com/resolving-eacces-permissions-errors-when-installing-packages-globally/#reinstall-npm-with-a-node-version-manager) is to install NPM via the Node Version Manager (NVM). This is what you should do:

Before we start, ensure your directories are set up:

```shell
[ -z "$XDG_CONFIG_HOME" ] && echo 'export XDG_CONFIG_HOME="$HOME/.config"' >> ~/.bashrc && source ~/.bashrc
mkdir -p "$XDG_CONFIG_HOME"
mkdir -p "$HOME/.local/bin"
```

Also, if you have installed NPM globally via your package manager, uninstall it to avoid future confusion.

## Installation

Next we install NVM and Node.js in userspace.

1. Install NVM for your user: `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash`
2. Type `nvm`.
    - If you get _nvm: command not found_ error, reload your shell profile first (`source ~/.bashrc`) and try again.
3. Install the latest Node.js with `nvm install node`.
    - If you are going to use Gulp and you encounter problems with Node.js 16 or above, downgrade to Node.js 14 and make that the default: `nvm install 14 && nvm alias default 14.x.y` (replace `x` and `y` with the values from your shell output).

This is good enough for launching new apps, but e.g. MSBuild doesn't use a login shell. If you have a desktop environment (through a display manager), see if the following works on your system:

1. Open the _~/.bashrc_ in a text editor.
2. Open or create the _~/.xsessionrc_ file in a text editor. This is the autorun file for your desktop login session.
3. Copy the new lines at the bottom of _~/.bashrc_ created by the NVM installer and append them to the end of the _~/.xsessionrc_.
4. Save everything, log out and log back it.

If everything went well, you can now successfully build your `Lombiq.NodeJs.Extensions`-using project, as your IDE will already be in an NVM-enabled environment when you start it up. You can skip the rest of this guide.

### Further troubleshooting

If the above steps did not suffice, you'll need to set up some proxy commands for `node` and `npm`:

```shell
function proxy-nvm-command() {
    for command in "$@"; do
    
    cat > ~/.local/bin/$command << DONE
#!/bin/bash

export NVM_DIR="$HOME/.config/nvm"
source "\$NVM_DIR/nvm.sh"
exec $command "\$@"
DONE

    chmod +x ~/.local/bin/$command
    
    done
}

proxy-nvm-command node npm
```

#### If you wish to use PNPM too

On Node.js versions >=14.19.0 and >=16.9 you don't need to do anything, as PNPM will be used via Node.js' `corepack` tool.

On older Node.js versions, run this:

```shell
npm install pnpm -g
proxy-nvm-command pnpm
```
