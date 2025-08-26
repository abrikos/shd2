require('dotenv').config();
const pkginfo = require('./package.json');

const {PORT, BOT_NAME, BOT_TOKEN, MAIL_PASSWORD, MAIL_USER} = process.env
const name = pkginfo.name
console.log(name)
/**
 * Конфигурация для деплоя
 */
module.exports = {
    apps: [{
        name,
        script: './.output/server/index.mjs',
        env: {
            NODE_ENV: 'production',
            SOURCE_MAP: 'source-map',
            HOST: '127.0.0.1',
            PORT,
            //BOT_NAME, BOT_TOKEN, MAIL_PASSWORD, MAIL_USER,
            //DEBUG: '*',
        },
        output: 'logs/backend.log',
        error: 'logs/backend-error.log',
    }]
};
