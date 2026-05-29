const fs = require("fs");

const dbPath = "./data/produk.json";

function loadProduk() {
  if (!fs.existsSync(dbPath)) return [];
  return JSON.parse(fs.readFileSync(dbPath));
}

module.exports = {
  command: ["listproduk", "produk", "shop"],

  run: async (sock, m) => {

    const produk = loadProduk();

    if (!produk.length) {
      return sock.sendMessage(m.chat, {
        text: "Produk kosong"
      }, { quoted: m });
    }

    let text = "┌─「 LIST PRODUK 」\n│\n";

    produk.forEach(p => {
      text += `│ #${p.id} ${p.nama}\n`;
      text += `│ Rp${p.harga}\n`;
      text += `│ Stok: ${p.stok}\n│\n`;
    });

    text += "└──────────────";

    return sock.sendMessage(m.chat, { text }, { quoted: m });
  }
};