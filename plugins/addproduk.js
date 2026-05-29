const fs = require("fs");

const dbPath = "./data/produk.json";

function loadProduk() {
  if (!fs.existsSync(dbPath)) return [];
  return JSON.parse(fs.readFileSync(dbPath));
}

function saveProduk(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

module.exports = {
  command: ["addproduk"],

  run: async (sock, m) => {

    const text =
      m.text ||
      m.message?.conversation ||
      m.message?.extendedTextMessage?.text ||
      "";

    const body = text.split(" ").slice(1).join(" ");

    const [nama, harga, isi] = body.split("|");

    if (!nama || !harga || !isi) {
      return sock.sendMessage(m.chat, {
        text: "Format: addproduk nama|harga|isi"
      }, { quoted: m });
    }

    let produk = loadProduk();

    // cek produk sama
    let index = produk.findIndex(p => p.nama.toLowerCase() === nama.toLowerCase());

    if (index !== -1) {
      // kalau ada → stok +1
      produk[index].stok = (produk[index].stok || 1) + 1;

      saveProduk(produk);

      return sock.sendMessage(m.chat, {
        text: `Stok ${produk[index].nama} naik jadi ${produk[index].stok}`
      }, { quoted: m });
    }

    // kalau belum ada → buat baru
    const id = produk.length > 0 ? produk[produk.length - 1].id + 1 : 1;

    produk.push({
      id,
      nama,
      harga,
      isi,
      stok: 1
    });

    saveProduk(produk);

    return sock.sendMessage(m.chat, {
      text: `Produk baru ditambah #${id} (stok 1)`
    }, { quoted: m });
  }
};