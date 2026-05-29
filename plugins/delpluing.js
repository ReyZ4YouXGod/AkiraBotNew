const fs = require("fs")
const path = require("path")

module.exports = {
    command: ["delplugin", "delpluing"],

    async run(sock, m, { text }) {

        if (!text) return m.reply("contoh:\ndelplugin namafile.js")

        try {

            let filename = text.trim()

            if (!filename.endsWith(".js")) {
                filename += ".js"
            }

            const filePath = path.join(__dirname, filename)

            // cek file ada atau tidak
            if (!fs.existsSync(filePath)) {
                return m.reply("plugin tidak ditemukan ❌")
            }

            fs.unlinkSync(filePath)

            m.reply(`Plugin berhasil dihapus ✅\nFile: ${filename}`)

        } catch (err) {
            console.error(err)
            m.reply("gagal hapus plugin ❌")
        }
    }
}