const axios = require("axios");

const {
  Sticker,
  StickerTypes
} = require("wa-sticker-formatter");

module.exports = {
  command: ["bratanime", "bratani"],

  run: async (sock, m, { text }) => {

    try {

      if (!text) {
        return sock.sendMessage(m.chat, {
          text: "❌ kasih teks jir\ncontoh: .bratanime hello anime"
        }, { quoted: m });
      }

      await sock.sendMessage(m.chat, {
        text: "⏳ bikin stiker anime..."
      }, { quoted: m });

      const url =
        `https://api.nexray.eu.cc/maker/bratanime?text=${encodeURIComponent(text)}`;

      const res = await axios.get(url, {
        responseType: "arraybuffer",
        timeout: 15000
      });

      if (!res.data) {
        return sock.sendMessage(m.chat, {
          text: "❌ gagal ambil gambar dari API"
        }, { quoted: m });
      }

      const buffer = Buffer.from(res.data);

      const sticker = new Sticker(buffer, {
        pack: global.packname,
        author: global.author,
        type: StickerTypes.FULL,
        categories: ["anime"],
        quality: 80
      });

      const output = await sticker.toBuffer();

      await sock.sendMessage(
        m.chat,
        {
          sticker: output
        },
        { quoted: m }
      );

    } catch (err) {

      console.log(
        "BRATANIME ERROR:",
        err.response?.data || err.message
      );

      await sock.sendMessage(m.chat, {
        text: "❌ gagal generate stiker bratanime"
      }, { quoted: m });

    }
  }
};
