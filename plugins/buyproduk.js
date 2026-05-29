const fs = require("fs");
const axios = require("axios");

const dbPath = "./data/produk.json";

function loadProduk() {
  if (!fs.existsSync(dbPath)) return [];
  return JSON.parse(fs.readFileSync(dbPath));
}

function saveProduk(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

global.pending = global.pending || {};

module.exports = {
  command: ["buyproduk"],

  run: async (sock, m, { text }) => {

    if (!text) {
      return sock.sendMessage(m.chat, {
        text: "Pakai: buyproduk <nama produk>"
      }, { quoted: m });
    }

    let produk = loadProduk();

    let item = produk.find(
      p => p.nama.toLowerCase() === text.toLowerCase()
    );

    if (!item) {
      return sock.sendMessage(m.chat, {
        text: "Produk tidak ditemukan"
      }, { quoted: m });
    }

    const order_id = "INV" + Date.now();

    try {
      const res = await axios.post(
        "https://app.pakasir.com/api/transactioncreate/qris",
        {
          project: "reyclouddev",
          order_id,
          amount: Number(item.harga),
          api_key: "9AwCqt0h99ArK0Jy7R5PYpP1FmdQ0SWN"
        },
        {
          headers: {
            "Content-Type": "application/json"
          },
          timeout: 15000
        }
      );

      const data = res.data?.payment;

      if (!data || !data.payment_number) {
        return sock.sendMessage(m.chat, {
          text: "Gagal generate QRIS (response kosong)"
        }, { quoted: m });
      }

      const qrisUrl =
        `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(data.payment_number)}`;

      global.pending[order_id] = item;

      await sock.sendMessage(m.chat, {
        image: { url: qrisUrl },
        caption:
`┌─「 PAYMENT QRIS 」
│ Produk: ${item.nama}
│ Harga: Rp${item.harga}
│ Order: ${order_id}
│
│ Scan QR untuk bayar
│ Auto check aktif...
└──────────────`
      }, { quoted: m });

      // AUTO CEK PAYMENT
      const interval = setInterval(async () => {
        try {
          const check = await axios.get(
            `https://app.pakasir.com/api/transactiondetail?project=reyclouddev&amount=${item.harga}&order_id=${order_id}&api_key=9AwCqt0h99ArK0Jy7R5PYpP1FmdQ0SWN`
          );

          const trx = check.data?.transaction;

          if (trx?.status === "completed") {

            clearInterval(interval);

            await sock.sendMessage(m.chat, {
              text:
`PEMBAYARAN BERHASIL ✅

Produk: ${item.nama}

ISI:
${item.isi}

Terima kasih.`
            }, { quoted: m });

            // hapus produk
            let produk = loadProduk();
            produk = produk.filter(p => p.nama !== item.nama);
            saveProduk(produk);

            delete global.pending[order_id];
          }

        } catch (e) {
          console.log("CHECK ERROR:", e.message);
        }
      }, 5000);

      // stop safety
      setTimeout(() => {
        clearInterval(interval);
      }, 300000);

    } catch (e) {
      console.log("BUY ERROR:", e.response?.data || e.message);

      return sock.sendMessage(m.chat, {
        text: "Gagal membuat transaksi (API error)"
      }, { quoted: m });
    }
  }
};