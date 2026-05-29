const axios = require("axios")
const fs = require("fs")
const path = require("path")

module.exports = {
 command: ["gitclone", "gitdl"],

 async run(sock, m, { text }) {

 try {

 if (!text) {
 return m.reply(
 "contoh:\n.gitclone https://github.com/user/repo"
 )
 }

 const url = text.trim()

 if (!url.includes("github.com")) {
 return m.reply("itu bukan link github jir")
 }

 // parsing url github
 const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/i)

 if (!match) {
 return m.reply("link github gak valid")
 }

 const user = match[1]
 const repo = match[2].replace(".git", "")

 const zipUrl =
 `https://github.com/${user}/${repo}/archive/refs/heads/main.zip`

 m.reply("⏳ lagi download repo...")

 const res =
 await axios.get(zipUrl, {
 responseType: "arraybuffer"
 }).catch(async () => {
 // fallback branch master
 return await axios.get(
 `https://github.com/${user}/${repo}/archive/refs/heads/master.zip`,
 { responseType: "arraybuffer" }
 )
 })

 const fileName =
 `${repo}.zip`

 const filePath =
 path.join(__dirname, fileName)

 fs.writeFileSync(filePath, res.data)

 await sock.sendMessage(
 m.chat,
 {
 document: fs.readFileSync(filePath),
 mimetype: "application/zip",
 fileName: fileName
 },
 { quoted: m }
 )

 fs.unlinkSync(filePath)

 } catch (err) {

 console.log(err)

 m.reply("❌ gagal clone repo")
 }
 }
}
