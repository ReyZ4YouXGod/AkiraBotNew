const fs = require("fs")
const path = require("path")

const {
  downloadContentFromMessage
} = require("@whiskeysockets/baileys")

const {
  fileTypeFromBuffer
} = require("file-type")

const sleep = (ms) =>
  new Promise(resolve =>
    setTimeout(resolve, ms)
  )

const dbPath = "./data/group.json"

if (!fs.existsSync(dbPath)) {

  fs.writeFileSync(
    dbPath,

    JSON.stringify({
      blacklist_jpm: []
    }, null, 2)
  )
}

module.exports = {

  command: [
    "swgc",
    "upswgc",
    "swgrup",
    "swgroup",
    "statusgrup",
    "statusgroup"
  ],

  isOwner: true,

  async run(sock, m, { text }) {

    const jid = m.chat

    const db =
      JSON.parse(
        fs.readFileSync(dbPath)
      )

    let content = {}

    try {

      const quoted =
        m.message?.extendedTextMessage
          ?.contextInfo
          ?.quotedMessage

      if (quoted) {

        const type =
          Object.keys(quoted)[0]

        let mediaType = ""

        if (type.includes("image")) {

          mediaType = "image"
        }

        else if (
          type.includes("video")
        ) {

          mediaType = "video"
        }

        else if (
          type.includes("audio")
        ) {

          mediaType = "audio"
        }

        else {

          return m.reply(
            "Reply foto/video/audio"
          )
        }

        const stream =
          await downloadContentFromMessage(
            quoted[type],
            mediaType
          )

        let buffer =
          Buffer.from([])

        for await (
          const chunk of stream
        ) {

          buffer =
            Buffer.concat([
              buffer,
              chunk
            ])
        }

        const fileType =
          await fileTypeFromBuffer(
            buffer
          )

        const ext =
          fileType?.ext || "bin"

        const tempFile =
          path.join(
            process.cwd(),
            `temp_${Date.now()}.${ext}`
          )

        fs.writeFileSync(
          tempFile,
          buffer
        )
        
        if (
          mediaType === "image"
        ) {

          content = {
            image: {
              url: tempFile
            },
            caption:
              text || ""
          }
        }
        
        else if (
          mediaType === "video"
        ) {

          content = {
            video: {
              url: tempFile
            },
            caption:
              text || ""
          }
        }

        else {

          content = {
            audio: {
              url: tempFile
            },
            mimetype:
              "audio/mpeg",
            ptt: false
          }
        }
      }

      else if (text) {

        content = {
          text
        }
      }

      else {

        return m.reply(
          "Reply media atau kirim teks"
        )
      }


      const groups =
        await sock.groupFetchAllParticipating()

      const groupIds =
        Object.keys(groups)

      if (!groupIds.length) {

        return m.reply(
          "Bot tidak ada grup"
        )
      }

      await m.reply(
        `🚀 Mengirim SWGC ke ${groupIds.length} grup`
      )

      let success = 0
      let failed = 0
      let skipped = 0
      for (const gid of groupIds) {

        if (
          db.blacklist_jpm.includes(gid)
        ) {

          skipped++
          continue
        }

        try {

          await sock.sendMessage(
            jid,
            {
              groupStatusMessage: {
                ...content
              }
            },
            {
              statusJidList: [gid]
            }
          )

          success++

          console.log(
            "SWGC SUCCESS:",
            gid
          )

          await sleep(3000)

        } catch (e) {

          failed++

          console.log(
            "SWGC FAIL:",
            gid,
            e.message
          )
        }
      }

      await sock.sendMessage(jid, {
        text:
`✅ SWGC DONE

✔ Success : ${success}
❌ Failed  : ${failed}
⏭ Skip BL : ${skipped}`
      })

      try {

        if (
          content.image?.url &&
          fs.existsSync(
            content.image.url
          )
        ) {

          fs.unlinkSync(
            content.image.url
          )
        }

        if (
          content.video?.url &&
          fs.existsSync(
            content.video.url
          )
        ) {

          fs.unlinkSync(
            content.video.url
          )
        }

        if (
          content.audio?.url &&
          fs.existsSync(
            content.audio.url
          )
        ) {

          fs.unlinkSync(
            content.audio.url
          )
        }

      } catch (e) {

        console.log(
          "Gagal hapus temp:",
          e.message
        )
      }

    } catch (e) {

      console.log(e)

      await sock.sendMessage(jid, {
        text:
          "❌ Error SWGC"
      })
    }
  }
}