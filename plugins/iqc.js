const axios = require("axios")

module.exports = {
 command: ["iqc"],

 async run(sock, m, { text }) {

 try {

 if (!text) {
 return m.reply(
 `contoh:\n.iqc Halo|Axis|11|90`
 )
 }

 let [msg, provider, jam, baterai] = text.split("|")

 if (!msg) return m.reply("teks nya mana jir")
 if (!provider) provider = "Axis"
 if (!jam) jam = "11"
 if (!baterai) baterai = "90"

 m.reply("bentar lagi jadi 😹")

 const url =
 `https://api.nexray.eu.cc/maker/v1/iqc?text=${encodeURIComponent(msg)}&provider=${encodeURIComponent(provider)}&jam=${encodeURIComponent(jam)}&baterai=${encodeURIComponent(baterai)}`

 const response = await axios.get(url, {
 responseType: "arraybuffer"
 })

 await sock.sendMessage(
 m.chat,
 {
 image: Buffer.from(response.data),
 caption:
`*IQC BERHASIL DIGENERATE*

• Provider : ${provider}
• Jam : ${jam}
• Baterai : ${baterai}%`
 },
 {
 quoted: m
 }
 )

 } catch (err) {

 console.error(err)

 m.reply("gagal generate iqc ❌")
 }
 }
}