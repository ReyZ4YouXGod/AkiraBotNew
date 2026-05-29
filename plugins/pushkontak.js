const fs = require("fs")

module.exports = {
 command: ["pushkontak"],

 async run(sock, m, { text, isOwner }) {

 if (!isOwner) return m.reply("Owner only")
 if (!text) return m.reply("Contoh: .pushkontak idgroup|delay|teks")

 let [groupId, delay, pesan] = text.split("|")

 if (!groupId || !delay || !pesan) {
 return m.reply("Format salah: idgroup|delay|teks")
 }

 let berhasil = 0
 let gagal = 0

 let group
 try {
 group = await sock.groupMetadata(groupId)
 } catch {
 return m.reply("Gagal ambil metadata grup")
 }

 const participants = group.participants.map(v => v.id)

 m.reply(`Push Kontak dimulai\nTotal member: ${participants.length}\nDelay: ${delay}ms`)

 let buyerList = []

 for (let jid of participants) {

 try {

 let msg = { text: pesan }

 if (m.quoted) {
 const q = m.quoted

 if (/image/.test(q.mtype)) {
 const buffer = await q.download()
 msg = { image: buffer, caption: pesan }

 } else if (/video/.test(q.mtype)) {
 const buffer = await q.download()
 msg = { video: buffer, caption: pesan }

 } else {
 msg = { text: pesan }
 }
 }

 await sock.sendMessage(jid, msg)
 berhasil++

 buyerList.push(jid)

 } catch (e) {
 gagal++
 }

 await new Promise(r => setTimeout(r, parseInt(delay) || 2000))
 }

 // =========================
 // BUAT FILE BUYER
 // =========================
 const filePath = "./buyyerNew.json"

 try {
 let old = []

 if (fs.existsSync(filePath)) {
 old = JSON.parse(fs.readFileSync(filePath))
 }

 const merged = [...new Set([...old, ...buyerList])]

 fs.writeFileSync(filePath, JSON.stringify(merged, null, 2))

 // kirim file ke chat
 await sock.sendMessage(m.chat, {
 document: fs.readFileSync(filePath),
 fileName: "buyyerNew.json",
 mimetype: "application/json"
 })

 } catch (e) {
 console.log("Gagal proses file buyer", e)
 }

 m.reply(
`Push Kontak Selesai

Berhasil : ${berhasil}
Gagal : ${gagal}
Total : ${participants.length}`
 )
 }
}