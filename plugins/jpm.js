const fs = require("fs")

module.exports = {
  command: ["jpm"],

  async run(sock, m, { text, isOwner }) {

    if (!isOwner) return m.reply("Owner only")
    if (!text && !m.quoted) return m.reply("Contoh: .jpm teks / reply foto + caption")

    let db
    try {
      db = JSON.parse(fs.readFileSync("./data/group.json"))
    } catch {
      db = { blacklist_jpm: [], delay_jpm: 1000 }
    }

    const blacklist = db.blacklist_jpm || []
    const delay = db.delay_jpm || 1000

    const groups = await sock.groupFetchAllParticipating()
    const res = Object.keys(groups)

    let berhasil = 0
    let gagal = 0
    let skip = 0

    m.reply(`JPM dimulai\nTotal grup: ${res.length}\nDelay: ${delay}ms`)

    for (let jid of res) {

      // =====================
      // BLACKLIST CHECK
      // =====================
      if (blacklist.includes(jid)) {
        skip++
        continue
      }

      try {

        if (!m.quoted) {
          await sock.sendMessage(jid, { text })

        } else {
          const msg = m.quoted

          if (/image/.test(msg.mtype)) {
            const buffer = await msg.download()

            await sock.sendMessage(jid, {
              image: buffer,
              caption: text || ""
            })

          } else {
            await sock.sendMessage(jid, {
              text: text || " "
            })
          }
        }

        berhasil++

      } catch {
        gagal++
      }

      await new Promise(r => setTimeout(r, delay))
    }

    m.reply(
`JPM Selesai

Berhasil : ${berhasil}
Gagal    : ${gagal}
Skip     : ${skip}
Total    : ${res.length}`
    )
  }
}