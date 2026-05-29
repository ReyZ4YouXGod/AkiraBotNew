module.exports = {
 command: ["listplugin", "list", "plugins"],

 async run(sock, m) {

 try {

 const plugins = global.plugins || {}

 let list = Object.keys(plugins)

 if (list.length === 0) {
 return m.reply("tidak ada plugin yang ter-load ❌")
 }

 let text = `*LIST PLUGIN BOT*\n\n`

 for (let file of list) {
 let plugin = plugins[file]

 let cmd = plugin.command
 let commandText = Array.isArray(cmd)
 ? cmd.join(", ")
 : cmd

 text += `• ${file}\n cmd: ${commandText}\n\n`
 }

 text += `Total: ${list.length} plugin`

 m.reply(text)

 } catch (err) {
 console.error(err)
 m.reply("gagal ambil list plugin ❌")
 }
 }
}