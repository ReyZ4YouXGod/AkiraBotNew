const axios = require("axios")

module.exports = {
 command: ["githubpush", "gitpush"],

 async run(sock, m, { text }) {

 try {

 if (!text) {
 return m.reply(
`FORMAT:
.githubpush token|user|repo|path/file.js|code|message`

 )
 }

 let parts = text.split("|")

 if (parts.length < 5) {
 return m.reply("format salah jir ❌")
 }

 let token = parts[0]
 let user = parts[1]
 let repo = parts[2]
 let pathFile = parts[3]

 // code bisa mengandung "|" jadi digabung lagi
 let code = parts.slice(4, parts.length - 1).join("|")
 let message = parts[parts.length - 1]

 if (!token || !user || !repo || !pathFile || !code) {
 return m.reply("data kurang ❌")
 }

 m.reply("⏳ upload ke github...")

 const contentBase64 =
 Buffer.from(code, "utf8").toString("base64")

 // cek file lama (ambil sha kalau update)
 let sha = null

 try {
 const check = await axios.get(
 `https://api.github.com/repos/${user}/${repo}/contents/${pathFile}`,
 {
 headers: {
 Authorization: `Bearer ${token}`
 }
 }
 )

 sha = check.data.sha

 } catch (e) {
 sha = null
 }

 const body = {
 message: message || "upload via bot",
 content: contentBase64
 }

 if (sha) body.sha = sha

 const upload = await axios.put(
 `https://api.github.com/repos/${user}/${repo}/contents/${pathFile}`,
 body,
 {
 headers: {
 Authorization: `Bearer ${token}`,
 "Content-Type": "application/json"
 }
 }
 )

 if (upload.status === 200 || upload.status === 201) {

 return m.reply(
`✅ UPLOAD BERHASIL

📁 Repo: ${user}/${repo}
📄 File: ${pathFile}`
 )
 }

 m.reply("gagal upload ❌")

 } catch (err) {

 console.log(err)
 m.reply("error jir ❌")
 }
 }
}
