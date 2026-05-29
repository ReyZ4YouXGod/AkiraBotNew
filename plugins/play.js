const axios = require("axios")

module.exports = {
 command: ["play"],

 async run(sock, m, { text }) {

 try {

 if (!text) {
 return m.reply(
`contoh:
.play denok`
 )
 }

 m.reply("🔍 mencari lagu...")

 const { data } =
 await axios.get(
 "https://api.ikyyxd.my.id/search/spotifyplay",
 {
 params: {
 query: text
 }
 }
 )

 if (
 !data.status ||
 !data.result
 ) {
 return m.reply(
 "lagu tidak ditemukan ❌"
 )
 }

 const res =
 data.result

 const title =
 res.title ||
 "Unknown"

 const artist =
 res.artist ||
 "Unknown"

 const album =
 res.album ||
 "Unknown"

 const duration =
 res.duration ||
 "-"

 const thumbnail =
 res.thumbnail

 const audioUrl =
 res.download

 await sock.sendMessage(
 m.chat,
 {
 image: {
 url: thumbnail
 },

 caption:
`🎵 *PLAY MUSIC*

📀 Judul: ${title}
👤 Artist: ${artist}
💿 Album: ${album}
⏱️ Durasi: ${duration}`
 },
 {
 quoted: m
 }
 )

 await sock.sendMessage(
 m.chat,
 {
 audio: {
 url: audioUrl
 },

 mimetype:
 "audio/mpeg",

 ptt: false,

 fileName:
 `${title}.mp3`
 },
 {
 quoted: m
 }
 )

 } catch (err) {

 console.log(err)

 m.reply(
 "error jir ❌"
 )
 }
 }
}