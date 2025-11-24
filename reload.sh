#!/bin/bash
BASEDIR=$(dirname "$0")
cd "$BASEDIR" || exit
GIT=$(git pull 2>&1 | head -n 1)
echo "$GIT"
if [[ $GIT =~ Из ]]; then

# Load nvm
  NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
  export NVM_DIR
  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
  nvm use 22.16.0
  npm i
  npm run build
  #~/.nvm/versions/node/v22.16.0/bin/pm2 restart all
  pm2 restart all
  date > "$BASEDIR/updated.txt"
fi
