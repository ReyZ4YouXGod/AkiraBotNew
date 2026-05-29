const fs = require("fs");

const { loadingBar } = require("../system/loading");

function runtime(seconds) {
    seconds = Number(seconds);

    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor(seconds % (3600 * 24) / 3600);
    const m = Math.floor(seconds % 3600 / 60);
    const s = Math.floor(seconds % 60);

    return [
        d ? `${d} Hari` : "",
        h ? `${h} Jam` : "",
        m ? `${m} Menit` : "",
        s ? `${s} Detik` : ""
    ].join(" ").trim();
}

module.exports = {

    command: ["menu", "help"],

    run: async (sock, m, { prefix, isPremium, isOwner }) => {

        try {

            const jid = m.chat;

            await loadingBar(sock, jid, "Loading Menu");

            const now = new Date();

            const jam = now.toLocaleTimeString("id-ID", { timeZone: "Asia/Jakarta" });
            const tanggal = now.toLocaleDateString("id-ID", { timeZone: "Asia/Jakarta" });
            const hari = now.toLocaleDateString("id-ID", { weekday: "long", timeZone: "Asia/Jakarta" });

            const uptime = runtime(process.uptime());

            const statusUser = isOwner
                ? "Owner"
                : isPremium
                ? "Premium"
                : "User";

            const teks = `
╔══════════════════╗
║      AKIRABOT
╚══════════════════╝

🤖 NameBot : AkiraBot
👑 Creator : ReyCloudDev
⚡ Version : 2.0 Rilis

🕒 Jam      : ${jam}
📅 Tanggal  : ${tanggal}
📆 Hari     : ${hari}
⏳ Runtime  : ${uptime}
👤 Status   : ${statusUser}

╔══════════════════╗
║      MAIN MENU
╚══════════════════╝

📌 GENERAL
│ ${prefix}menu
│ ${prefix}ping

🎮 FUN (IQC PLAY)
│ ${prefix}iqc play

🎨 MAKER
│ ${prefix}fakeff nickname
│ ${prefix}fakewafat

💳 QRIS
│ ${prefix}qris nominal

🛒 PRODUCT SYSTEM
│ ${prefix}produk
│ ${prefix}addproduk nama|harga|isi
│ ${prefix}buyproduk nama
│ ${prefix}delallproduk

📡 CONTACT SYSTEM
│ ${prefix}pushkontak
│ ${prefix}cekidgc

⚙️ JPM SYSTEM
│ ${prefix}jpm
│ ${prefix}swgc
│ ${prefix}setdelay

📡 PANEL
│ ${prefix}1gb username
│ ${prefix}2gb username
│ ${prefix}3gb username
│ ${prefix}4gb username
│ ${prefix}5gb username
│ ${prefix}6gb username
│ ${prefix}7gb username
│ ${prefix}8gb username
│ ${prefix}9gb username
│ ${prefix}10gb username
│ ${prefix}unli username

🧰 TOOLS
│ ${prefix}getplugin
│ ${prefix}addplugin
│ ${prefix}delplugin
│ ${prefix}gitclone
│ ${prefix}gitpush

╚══════════════════╝

Powered By ReyCloudDev
`;

            // ================= VIDEO MENU =================
            const video = fs.existsSync("./media/menu.mp4")
                ? fs.readFileSync("./media/menu.mp4")
                : null;

            if (video) {

                await sock.sendMessage(jid, {
                    video,
                    caption: teks,
                    gifPlayback: true   // kalau mau loop style
                }, { quoted: m });

            } else {

                await m.reply(teks);
            }

            // ================= SOUND =================
            if (fs.existsSync("./media/sound.mp3")) {

                await sock.sendMessage(jid, {
                    audio: fs.readFileSync("./media/sound.mp3"),
                    mimetype: "audio/mpeg",
                    ptt: true
                }, { quoted: m });
            }

            // ================= STICKER =================
            if (fs.existsSync("./media/sticker.webp")) {

                await sock.sendMessage(jid, {
                    sticker: fs.readFileSync("./media/sticker.webp")
                }, { quoted: m });
            }

        } catch (e) {
            console.log(e);
            m.reply(`Error:\n${e}`);
        }
    }
};
