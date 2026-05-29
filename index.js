require('./config')

const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    makeCacheableSignalKeyStore,
    jidDecode
} = require("@whiskeysockets/baileys")

const pino = require('pino')
const chalk = require('chalk')
const path = require('path')
const fs = require('fs')
const readline = require("readline")
const NodeCache = require("node-cache")
const axios = require("axios")

const { serialize } = require('./system/helper')

const usePairingCode = true

const question = (text) => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    })

    return new Promise((resolve) =>
        rl.question(text, resolve)
    )
}

const msgRetryCounterCache =
    new NodeCache()

global.plugins = {}

const loadPlugins = () => {

    const pluginsDir =
        path.join(__dirname, 'plugins')

    if (!fs.existsSync(pluginsDir)) {
        fs.mkdirSync(pluginsDir)
    }

    const files =
        fs.readdirSync(pluginsDir)
        .filter(file => file.endsWith('.js'))

    for (let file of files) {

        try {

            const pluginPath =
                path.join(pluginsDir, file)

            delete require.cache[
                require.resolve(pluginPath)
            ]

            const plugin =
                require(pluginPath)

            if (plugin.command) {
                global.plugins[file] = plugin
            }

        } catch (e) {

            console.error(
                chalk.red(
                    `[ ERROR ] Gagal memuat plugin ${file}:`
                ),
                e
            )
        }
    }

    console.log(
        chalk.greenBright(
            `[ SYSTEM ] ${Object.keys(global.plugins).length} Plugins Loaded Successfully.`
        )
    )
}

loadPlugins()

async function startBot() {

     const {
        state,
        saveCreds
    } = await useMultiFileAuthState("./session")

    let waVersion =
        [2, 3000, 1017502444]

    try {

        const res =
            await axios.get(
                'https://raw.githubusercontent.com/WhiskeySockets/Baileys/master/src/Defaults/baileys-version.json'
            )

        if (
            res.data &&
            res.data.version
        ) {

            waVersion =
                res.data.version

            console.log(
                chalk.cyan(
                    `[ SYSTEM ] Menggunakan Versi WhatsApp Web: ${waVersion.join('.')}`
                )
            )
        }

    } catch (e) {

        console.log(
            chalk.yellow(
                "[ SYSTEM ] Gagal mengambil versi terbaru dari server, menggunakan versi cadangan."
            )
        )
    }

    const sock =
        makeWASocket({

            version: waVersion,

            printQRInTerminal:
                !usePairingCode,

            logger:
                pino({
                    level: 'silent'
                }),

            auth: {
                creds: state.creds,

                keys:
                    makeCacheableSignalKeyStore(
                        state.keys,
                        pino().child({
                            level: 'silent'
                        })
                    )
            },

            browser: [
                "Ubuntu",
                "Chrome",
                "20.0.04"
            ],

            msgRetryCounterCache,

            defaultQueryTimeoutMs:
                undefined,

            connectTimeoutMs:
                60000
        })

    sock.public = true

    if (
        usePairingCode &&
        !sock.authState.creds.registered
    ) {

        console.clear()

        console.log(
            chalk.bold.cyan(
                "================ VENOM PLUGINS BASE ================"
            )
        )

        const phoneNumber =
            await question(
                chalk.yellowBright(
                    "\nMasukkan Nomor WhatsApp Anda (Format: 62xxxxxx):\n> "
                )
            )

        const code =
            await sock.requestPairingCode(
                phoneNumber.trim()
            )

        console.log(
            chalk.greenBright(
                `\nKode Pairing Anda: `
            ) +
            chalk.bold.white.bgRed(
                ` ${code} `
            ) +
            `\n`
        )
    }

    sock.decodeJid = (jid) => {

        if (!jid) return jid

        if (/:\d+@/gi.test(jid)) {

            let decode =
                jidDecode(jid) || {}

            return (
                decode.user &&
                decode.server &&
                decode.user +
                '@' +
                decode.server
            ) || jid
        }

        else return jid
    }

    sock.ev.on(
        'messages.upsert',
        async (chatUpdate) => {

        try {

            let chat =
                chatUpdate.messages[0]

            if (!chat) return
            if (!chat.message) return

            chat.message =
                Object.keys(chat.message)[0] === 'ephemeralMessage'
                ? chat.message.ephemeralMessage.message
                : chat.message

            if (
                !sock.public &&
                !chat.key.fromMe
            ) return

            let m =
                serialize(sock, chat)

            if (!m) return
            if (!m.message) return
            if (!m.mtype) return

            if (m.isBot) return

            const prefix =
                global.prefix || "."

            const body =
                m.body || ""

            const isCmd =
                body.startsWith(prefix)

            if (!isCmd) return

            const command =
                body
                .slice(prefix.length)
                .trim()
                .split(' ')
                .shift()
                .toLowerCase()

            const args =
                body
                .trim()
                .split(/ +/)
                .slice(1)

            const text =
                args.join(" ")

            let groupMetadata =
                m.isGroup
                ? await sock.groupMetadata(m.chat)
                    .catch(() => null)
                : null

            let participants =
                groupMetadata
                ? groupMetadata.participants
                : []

            let groupAdmins =
                participants
                .filter(v => v.admin !== null)
                .map(v => v.id)

            let isOwner =
                [
                    sock.user.id.split(':')[0],
                    ...global.owner
                ]
                .map(v =>
                    v.replace(/[^0-9]/g, '') +
                    '@s.whatsapp.net'
                )
                .includes(m.sender)

            let isPremium =
                isOwner ||
                global.premium
                .map(v =>
                    v.replace(/[^0-9]/g, '') +
                    '@s.whatsapp.net'
                )
                .includes(m.sender)

            let isBotAdmin =
                groupAdmins.includes(
                    sock.decodeJid(
                        sock.user.id
                    )
                )

            let isAdmin =
                groupAdmins.includes(
                    m.sender
                )

            for (let name in global.plugins) {

                let plugin =
                    global.plugins[name]

                if (!plugin) continue

                const isTriggered =
                    Array.isArray(plugin.command)
                    ? plugin.command.includes(command)
                    : plugin.command === command

                if (!isTriggered) continue

                // OWNER
                if (
                    plugin.isOwner &&
                    !isOwner
                ) {

                    m.reply(
                        '*[ AKSES OWNER ]* Fitur ini dikunci khusus Owner!'
                    )

                    continue
                }

                // PREMIUM
                if (
                    plugin.isPremium &&
                    !isPremium
                ) {

                    m.reply(
                        '*[ AKSES PREMIUM ]* Fitur ini khusus pengguna status Premium!'
                    )

                    continue
                }

                // GROUP
                if (
                    plugin.isGroup &&
                    !m.isGroup
                ) {

                    m.reply(
                        '*[ GROUP ONLY ]* Perintah ini hanya bekerja di dalam Group!'
                    )

                    continue
                }

                // ADMIN
                if (
                    plugin.isAdmin &&
                    !isAdmin
                ) {

                    m.reply(
                        '*[ ADMIN ONLY ]* Anda bukan Admin Group!'
                    )

                    continue
                }

                // BOT ADMIN
                if (
                    plugin.isBotAdmin &&
                    !isBotAdmin
                ) {

                    m.reply(
                        '*[ BOT HARUS ADMIN ]* Jadikan bot admin terlebih dahulu!'
                    )

                    continue
                }

                // RUN
                await plugin.run(
                    sock,
                    m,
                    {
                        args,
                        text,
                        command,
                        prefix,
                        isOwner,
                        isPremium,
                        groupMetadata
                    }
                )
            }

        } catch (err) {

            console.error(
                chalk.red(
                    "Error Upsert Engine:"
                ),
                err
            )
        }
    })


    sock.ev.on(
        'connection.update',
        (update) => {

        const {
            connection,
            lastDisconnect
        } = update

        if (connection === 'close') {

            const shouldReconnect =
                lastDisconnect?.error
                ?.output?.statusCode !==
                DisconnectReason.loggedOut

            console.log(
                chalk.red(
                    `Koneksi terputus karena: `
                ),
                lastDisconnect?.error,
                `, Reconnecting: ${shouldReconnect}`
            )

            if (shouldReconnect) {
                startBot()
            }

        }

        else if (connection === 'open') {

            console.log(
                chalk.greenBright(
                    "\n[ SUCCESS ] Bot Terhubung Sempurna ke WhatsApp ✅\n"
                )
            )
        }
    })

    // =========================
    // SAVE CREDS
    // =========================

    sock.ev.on(
        'creds.update',
        saveCreds
    )
}

startBot()


fs.watch(
    path.join(__dirname, 'plugins'),

    (eventType, filename) => {

    if (
        filename &&
        filename.endsWith('.js')
    ) {

        console.log(
            chalk.yellow(
                `[ WATCHER ] Perubahan terdeteksi pada plugin: ${filename}. Memuat ulang...`
            )
        )

        loadPlugins()
    }
})