module.exports = {
 command: ["cekidgc"],

 async run(sock, m, { isOwner, replytolak, prefix }) {

 if (!isOwner) return replytolak("Khusus Owner Aja")

 let getGroups = await sock.groupFetchAllParticipating()
 let groups = Object.values(getGroups)

 let teks = `â¬£ LIST GROUP DI BAWAH\n\n`
 teks += `Total Group: ${groups.length}\n\n`

 for (let v of groups) {
 try {
 teks += `â—‰ Nama : ${v.subject}\n`
 teks += `â—‰ ID : ${v.id}\n`
 teks += `â—‰ Member : ${v.participants.length}\n\n`
 teks += `â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€\n\n`
 } catch {
 continue
 }
 }

 teks += `Command Push Kontak:
${prefix}pushkontak idgroup|delay|teks`

 m.reply(teks)
 }
}