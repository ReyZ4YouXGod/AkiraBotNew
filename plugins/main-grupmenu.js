const { generateWAMessageContent, generateWAMessageFromContent, proto } = require("@whiskeysockets/baileys");
const fs = require('fs');

module.exports = {
    command: ['grupmenu'],  
    isGroup: false,        
    isOwner: false,

    run: async (sock, m, { prefix }) => {
        try {
            
            await sock.sendMessage(m.chat, { react: { text: '⚙️', key: m.key } });

            const pushname = m.pushName || "No Name";

            
            const imgGrup = fs.existsSync("./menu.jpg") ? fs.readFileSync("./menu.jpg") : Buffer.alloc(0);

            let teks = `
╭「 \`${pushname}\` 」

╭「 *ɢʀᴏᴜᴘ ᴍᴇɴᴜ* Codename: Vorthyx 」
│
│ ◧ ${prefix}kick <@tag/reply>
│ ◧ ${prefix}add <nomor>
│ ◧ ${prefix}promote <@tag>
│ ◧ ${prefix}demote <@tag>
│ ◧ ${prefix}group <open/close>
│ ◧ ${prefix}tagall <teks>
│ ◧ ${prefix}hidetag <teks>
│ ◧ ${prefix}editinfo <open/close>
│
╰───────────────☣︎

*Note:* Beberapa fitur di atas memerlukan status Admin bagi pengguna dan Bot!
`;

            let img = await generateWAMessageContent({
                image: imgGrup  
            }, { upload: sock.waUploadToServer });

             
            const msg = generateWAMessageFromContent(m.chat, {
                viewOnceMessage: {
                    message: {
                        interactiveMessage: proto.Message.InteractiveMessage.create({
                            header: {
                                hasMediaAttachment: true,
                                imageMessage: img.imageMessage
                            },
                            body: {
                                text: teks
                            },
                            footer: {
                                text: `Vorthyx Plugins System`
                            },
                            nativeFlowMessage: {
                                messageParamsJson: JSON.stringify({
                                    bottom_sheet: {
                                        in_thread_buttons_limit: 1,
                                        divider_indices: [1],
                                        list_title: "List Menu",
                                        button_title: "Kembali Ke Menu Utama"
                                    }
                                }),
                                buttons: [
                                    {
                                        name: "single_select",
                                        buttonParamsJson: JSON.stringify({
                                            icon: "HOME",
                                            title: "Navigasi",
                                            sections: [
                                                {
                                                    title: "PILIHAN MENU",
                                                    rows: [
                                                        { title: "KEMBALI KE MAIN MENU", description: "Membuka kembali menu utama", id: `${prefix}menu` }
                                                    ]
                                                }
                                            ]
                                        })
                                    }
                                ]
                            }
                        })
                    }
                }
            }, { quoted: m });

            await sock.relayMessage(m.chat, msg.message, { messageId: msg.key.id });

        } catch (err) {
            console.error("Error di plugin grupmenu:", err);
            m.reply("Terjadi kesalahan saat memuat Group Menu.");
        }
    }
};
