const fs = require("fs");

const dbPath = "./data/produk.json";

function saveProduk(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

module.exports = {
  command: ["delallproduk", "hapussemuaproduk"],

  run: async (sock, m) => {

    try {
      saveProduk([]);

      return sock.sendMessage(m.chat, {
        text: "Semua produk berhasil dihapus."
      }, { quoted: m });

    } catch (e) {
      console.log(e);
      return sock.sendMessage(m.chat, {
        text: "Gagal hapus produk."
      }, { quoted: m });
    }
  }
};