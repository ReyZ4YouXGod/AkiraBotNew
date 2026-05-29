const axios = require("axios");
const FormData = require("form-data");
const { downloadContentFromMessage } = require("@whiskeysockets/baileys");

module.exports = {
    command: ["fakewafat"],

    run: async (sock, m, { text }) => {
        try {

            const jid = m.chat;
            let args = text.split("|");

            let url = args[0]?.trim();
            let nama = args[1]?.trim();
            let lahir = args[2]?.trim();
            let wafat = args[3]?.trim();

            // kalau reply image
            if (m.quoted && m.quoted.mtype === "imageMessage") {

                const stream = await downloadContentFromMessage(
                    m.quoted,
                    "image"
                );

                let buffer = Buffer.from([]);

                for await (const chunk of stream) {
                    buffer = Buffer.concat([buffer, chunk]);
                }

                const form = new FormData();
                form.append("file", buffer, "image.jpg");

                const upload = await axios.post(
                    "https://tmpfiles.org/api/v1/upload",
                    form,
                    { headers: form.getHeaders() }
                );

                url = upload.data.data.url.replace(
                    "tmpfiles.org/",
                    "tmpfiles.org/dl/"
                );

                nama = args[0]?.trim();
                lahir = args[1]?.trim();
                wafat = args[2]?.trim();
            }

            if (!url || !nama || !lahir || !wafat) {
                return m.reply(
                    `.fakewafat url|nama|lahir|wafat\n\n` +
                    `atau reply foto:\n` +
                    `.fakewafat nama|lahir|wafat`
                );
            }

            await sock.sendMessage(jid, {
                react: { text: "⏳", key: m.key }
            });

            const apiUrl =
                `https://api.ikyyxd.my.id/canvas/fakewafat` +
                `?url=${encodeURIComponent(url)}` +
                `&nama=${encodeURIComponent(nama)}` +
                `&lahir=${encodeURIComponent(lahir)}` +
                `&wafat=${encodeURIComponent(wafat)}`;

            const res = await axios.get(apiUrl, {
                responseType: "arraybuffer"
            });

            const buffer = Buffer.from(res.data);

            await sock.sendMessage(jid, {
                image: buffer,
                caption:
                    `『 FAKE WAFAT 』\n\n` +
                    `◈ Nama: ${nama}\n` +
                    `◈ Lahir: ${lahir}\n` +
                    `◈ Wafat: ${wafat}`
            }, { quoted: m });

            await sock.sendMessage(jid, {
                react: { text: "✅", key: m.key }
            });

        } catch (e) {
            console.log(e);
            m.reply(String(e));
        }
    }
};