const fetch = require("node-fetch")

module.exports = {
  command: ["qris"],

  async run(sock, m, { args }) {

    const jid = m.chat
    const amount = args[0]

    if (!amount || isNaN(amount)) {
      return m.reply("Format:\n.qris 10000")
    }

    const project = "reyclouddev"
    const api_key = global.qris_api_key
    const order_id = "INV-" + Date.now()

    try {

      await m.reply("⏳ Membuat QRIS...")

      // CREATE QRIS
      const create = await fetch(
        "https://app.pakasir.com/api/transactioncreate/qris",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            project,
            order_id,
            amount: Number(amount),
            api_key
          })
        }
      )

      const json = await create.json()
      const payment = json.payment

      if (!payment) {
        return m.reply("❌ Gagal membuat QRIS")
      }

      // QR IMAGE (simple)
      const qrUrl =
        "https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=" +
        encodeURIComponent(payment.payment_number)

      await sock.sendMessage(jid, {
        image: { url: qrUrl },
        caption:
`╭━━━〔 QRIS PAYMENT 〕━━━⬣

🧾 Order : ${order_id}
💰 Amount : ${amount}
💸 Fee : ${payment.fee}
💵 Total : ${payment.total_payment}

⏰ Expired : ${payment.expired_at}

📌 Status : PENDING

╰━━━━━━━━━━━━━━━━⬣`
      }, { quoted: m })

      // AUTO CHECK STATUS
      const check = setInterval(async () => {

        try {

          const res = await fetch(
            `https://app.pakasir.com/api/transactiondetail?project=${project}&amount=${amount}&order_id=${order_id}&api_key=${api_key}`
          )

          const data = await res.json()
          const status = data?.transaction?.status

          if (status === "completed") {

            clearInterval(check)

            await sock.sendMessage(jid, {
              text:
`✅ PAYMENT SUCCESS

🧾 Order : ${order_id}
💰 Amount : ${amount}
📌 Status : PAID`
            }, { quoted: m })
          }

        } catch (e) {
          clearInterval(check)
          console.log(e)
        }

      }, 5000)

      // stop after 5 menit
      setTimeout(() => clearInterval(check), 300000)

    } catch (e) {
      console.log(e)
      m.reply("❌ Error QRIS")
    }
  }
}