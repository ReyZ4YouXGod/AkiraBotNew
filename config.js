const fs = require('fs');
const chalk = require('chalk');

// ================= OWNER =================
global.owner = [
'6281260512743'
];
global.premium = [
'6281260512743'
];

// ================= BOT =================
global.packname = 'ʀᴇʏᴄʟᴏᴜᴅ-ʙᴏᴛ';
global.author = 'ReyCloudDev';
global.prefix = '.';

// ================= QRIS =================
global.qris_api_key = '9AwCqt0h99ArK0Jy7R5PYpP1FmdQ0SWN';

// ================= PANEL =================
global.domain = 'https://panel.domain.com';
global.apikey = 'ptla_api_key';
global.capikey = 'ptla_client_api_key';
global.egg = '15';
global.nest = '5';
global.loc = '1';

// ================= AUTO RELOAD ==============
let file = require.resolve(__filename);
fs.watchFile(file, () => {
fs.unwatchFile(file);
console.log(
    chalk.yellowBright(
        `Update detected on: ${file}`
    )
);
delete require.cache[file];
require(file);
});
