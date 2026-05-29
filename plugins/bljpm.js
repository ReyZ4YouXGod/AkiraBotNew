const fs = require("fs");

const path = "./data/group.json";


if (!fs.existsSync("./data")) {
    fs.mkdirSync("./data");
}

if (!fs.existsSync(path)) {

    fs.writeFileSync(
        path,

        JSON.stringify({
            blacklist_jpm: []
        }, null, 2)
    );
}

module.exports = {

    command: [
        "bljpm",
        "bl",
        "delbljpm",
        "delbl"
    ],

    isGroup: true,
    isOwner: true,

    run: async (sock, m, {
        command
    }) => {

        try {

            const jid = m.chat;

            const db = JSON.parse(
                fs.readFileSync(path)
            );

            if (
                command === "bljpm" ||
                command === "bl"
            ) {

                if (
                    db.blacklist_jpm.includes(jid)
                ) {

                    return m.reply(
                        "Grup sudah blacklist JPM"
                    );
                }

                db.blacklist_jpm.push(jid);

                fs.writeFileSync(
                    path,

                    JSON.stringify(
                        db,
                        null,
                        2
                    )
                );

                await sock.sendMessage(jid, {
                    react: {
                        text: "✅",
                        key: m.key
                    }
                });

                return m.reply(
                    "Berhasil blacklist grup dari JPM"
                );
            }


            if (
                command === "delbljpm" ||
                command === "delbl"
            ) {

                if (
                    !db.blacklist_jpm.includes(jid)
                ) {

                    return m.reply(
                        "Grup tidak ada di blacklist"
                    );
                }

                const index =
                    db.blacklist_jpm.indexOf(jid);

                db.blacklist_jpm.splice(
                    index,
                    1
                );

                fs.writeFileSync(
                    path,

                    JSON.stringify(
                        db,
                        null,
                        2
                    )
                );

                await sock.sendMessage(jid, {
                    react: {
                        text: "✅",
                        key: m.key
                    }
                });

                return m.reply(
                    "Berhasil menghapus blacklist JPM"
                );
            }

        } catch (e) {

            console.log(e);

            m.reply(String(e));

        }
    }
};