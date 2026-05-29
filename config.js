const fs = require('fs');
const chalk = require('chalk');

global.owner = ['6281260512743'];  
global.premium = ['6281260512743'];
global.packname = 'ʀᴇᴠɪɴᴢᴀ-ʙᴏᴛ';
global.author = 'RevinzaModsd';
global.prefix = '.'; 
global.qris_api_key = '9AwCqt0h99ArK0Jy7R5PYpP1FmdQ0SWN';


let file = require.resolve(__filename);
fs.watchFile(file, () => {
    fs.unwatchFile(file);
    console.log(chalk.yellowBright(`Update detected on: ${file}`));
    delete require.cache[file];
    require(file);
});
