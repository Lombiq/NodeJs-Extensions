## Global NPM vs Userspace NPM via Node Version Manager on Linux

If you installed NPM from your package manager, you will likely suffer an `EACCES` error when you try to install a package globally. The [recommended solution](https://docs.npmjs.com/resolving-eacces-permissions-errors-when-installing-packages-globally/#reinstall-npm-with-a-node-version-manager) is to install NPM via the Node Version Manager (NVM). This is what you should do:

Before we start, ensure your directories are set up:

```shell
[ -z "$XDG_CONFIG_HOME" ] && echo 'export XDG_CONFIG_HOME="$HOME/.config"' >> ~/.bashrc && source ~/.bashrc
mkdir -p "$XDG_CONFIG_HOME"
mkdir -p "$HOME/.local/bin"
```

Also if you have installed NPM globally via your package manager, uninstall it to avoid future confusion.

Next we install NVM and Node.js in userspace.

1. Install NVM for your user: `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash`
2. Type `nvm`.
    - If you get _nvm: command not found_ error, reload your shell profile first (`source ~/.bashrc`) and try again.
3. Install the latest Node.js with `nvm install node`.
    - If you are going to use Gulp and you have problems with Node.js 16.x (see [here](https://github.com/Lombiq/Orchard-Vue.js#prerequisites)), try downgrading to 14.x and make it the default: `nvm install 14.7.0 && nvm alias default 14.7.0`.

This is good enough for launching new apps, but for example MSBuild doesn't use a login shell. If you have a desktop environment (through a display manager) see if the following works on your system. If yes, you can skip the rest of this section.

1. Open the _~/.bashrc_ in a text editor.
2. Open or create the _~/.xsessionrc_ file in a text editor. This is the autorun file for your desktop login session.
3. Copy the new lines at the bottom of _~/.bashrc_ created by the NVM installer and append them to the end of the _~/.xsessionrc_.
4. Save everything, log out and log back it.
If everything went well you can now successfully build your `Lombiq.Npm.Targets`-using project as your IDE will already be in an NVM enabled environment when you start it up.

You need to set up some proxy commands for `node` and `npm`:

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

If you wish to use PNPM too, type this:

```shell
npm install pnpm -g
proxy-nvm-command pnpm
```

