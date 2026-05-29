const fs = require("fs")

module.exports = {
  command: ["setdelay"],

  async run(sock, m, { text, isOwner }) {

    if (!isOwner) return m.reply("Owner only")
    if (!text) return m.reply("Contoh:\n.setdelay 2000")

    let db
    try {
      db = JSON.parse(fs.readFileSync("./data/group.json"))
    } catch {
      db = { delay_jpm: 1000 }
    }

    let delay = parseInt(text)
    if (isNaN(delay) || delay < 0) return m.reply("Delay tidak valid")

    db.delay_jpm = delay

    fs.writeFileSync("./data/group.json", JSON.stringify(db, null, 2))

    m.reply(`Delay JPM diset ke ${delay}ms`)
  }
}