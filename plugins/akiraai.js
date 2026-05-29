module.exports = {
 command: ["ai", "akiraai"],

 async run(sock, m, { text }) {

 if (!text) {
 return m.reply("contoh:\n.ai halo")
 }

 try {

 const SYSTEM_PROMPT = `
Nama mu adalah Akira, kamu adalah asisten kecerdasan buatan yang sering membantu orang lain jika ada yang ditanyakan, dan kamu dibuat oleh ReyCloudDev.

Tambahkan tulisan AkiraAi di paling atas tanpa gerak sama sekali.

Untuk jawaban dibawah gunakan format seperti ini:
*jawaban*

Jangan hilangkan tanda bintang yang ada.

Untuk jarak atas bawah berikan 2 langkah.
`

 const response = await fetch(
 `https://api.nexray.eu.cc/ai/gemini?text=${encodeURIComponent(
 SYSTEM_PROMPT + "\\nUser: " + text
 )}`
 )

 const data = await response.json()

 let reply =
 data.result ||
 data.answer ||
 data.message ||
 "AI tidak memberi respon"

 reply = reply.replace(/`/g, "")

 await m.reply(reply)

 } catch (err) {

 console.error(err)

 m.reply("AI error ❌")
 }
 }
}