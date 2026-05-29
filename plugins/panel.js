function randomStr(length = 3) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let result = ""

  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }

  return result
}

const resourceMap = {
  "1gb": { ram: 1000, disk: 1000, cpu: 40 },
  "2gb": { ram: 2000, disk: 1000, cpu: 60 },
  "3gb": { ram: 3000, disk: 2000, cpu: 80 },
  "4gb": { ram: 4000, disk: 2000, cpu: 100 },
  "5gb": { ram: 5000, disk: 3000, cpu: 120 },
  "6gb": { ram: 6000, disk: 3000, cpu: 140 },
  "7gb": { ram: 7000, disk: 4000, cpu: 160 },
  "8gb": { ram: 8000, disk: 4000, cpu: 180 },
  "9gb": { ram: 9000, disk: 5000, cpu: 200 },
  "10gb": { ram: 10000, disk: 5000, cpu: 220 },
  "unlimited": { ram: 0, disk: 0, cpu: 0 },
  "unli": { ram: 0, disk: 0, cpu: 0 }
}

export default {
  command: Object.keys(resourceMap),
  alias: Object.keys(resourceMap),

  async run({ sock, msg, args, command }) {
    const jid = msg.key.remoteJid
    const sender = (msg.key.participant || jid).replace(/[^0-9]/g, "")

    // =========================
    // SAFE INPUT
    // =========================
    const input = args.join(" ")
    if (!input) {
      return sock.sendMessage(jid, {
        text: `Contoh:\n.1gb rey\n.1gb rey,628xxxx`
      })
    }

    const [usernameRaw, targetRaw] = input.split(",")

    const username = (usernameRaw || "").trim().toLowerCase()
    if (!username) {
      return sock.sendMessage(jid, { text: "Username tidak valid!" })
    }

    // =========================
    // TARGET HANDLER (SAFE)
    // =========================
    let targetJid = jid

    if (targetRaw) {
      targetJid = targetRaw.replace(/[^0-9]/g, "") + "@s.whatsapp.net"
    } else if (jid.endsWith("@g.us")) {
      targetJid = msg.key.participant || jid
    }

    // =========================
    // RESOURCE
    // =========================
    const res = resourceMap[command]

    if (!res) {
      return sock.sendMessage(jid, { text: "Command tidak ditemukan!" })
    }

    // =========================
    // USER DATA
    // =========================
    const email = `${username}${Date.now()}@ReyzCloud.com`
    const name =
      username.charAt(0).toUpperCase() + username.slice(1) + " Server"

    const password = username + randomStr(5) + Math.floor(Math.random() * 90)

    const { domain, apikey, nestid, egg, loc } = global.panel

    try {
      // =========================
      // CREATE USER
      // =========================
      const userReq = await fetch(`${domain}/api/application/users`, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apikey}`
        },
        body: JSON.stringify({
          email,
          username,
          first_name: name,
          last_name: "Server",
          language: "en",
          password
        })
      })

      const userData = await userReq.json()

      if (userData.errors) {
        return sock.sendMessage(jid, {
          text: "ERROR USER:\n" + JSON.stringify(userData.errors[0], null, 2)
        })
      }

      const user = userData.attributes

      // =========================
      // GET STARTUP
      // =========================
      const startupReq = await fetch(
        `${domain}/api/application/nests/${nestid}/eggs/${egg}`,
        {
          headers: {
            "Accept": "application/json",
            "Authorization": `Bearer ${apikey}`
          }
        }
      )

      const startupData = await startupReq.json()
      const startup = startupData.attributes.startup

      // =========================
      // CREATE SERVER
      // =========================
      const serverReq = await fetch(`${domain}/api/application/servers`, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apikey}`
        },
        body: JSON.stringify({
          name,
          description: new Date().toLocaleDateString(),
          user: user.id,
          egg: parseInt(egg),
          docker_image: "ghcr.io/parkervcp/yolks:nodejs_20",
          startup,
          environment: {
            INST: "npm",
            USER_UPLOAD: "0",
            AUTO_UPDATE: "0",
            CMD_RUN: "npm start"
          },
          limits: res,
          feature_limits: {
            databases: 5,
            backups: 5,
            allocations: 5
          },
          deploy: {
            locations: [parseInt(loc)],
            dedicated_ip: false,
            port_range: []
          }
        })
      })

      const serverData = await serverReq.json()

      if (serverData.errors) {
        return sock.sendMessage(jid, {
          text: "ERROR SERVER:\n" + JSON.stringify(serverData.errors[0], null, 2)
        })
      }

      const server = serverData.attributes

      // =========================
      // RESULT
      // =========================
      const teks = `
✅ PANEL BERHASIL DIBUAT

👤 Username : ${user.username}
🔐 Password : ${password}

📡 Server ID : ${server.id}

⚙️ RAM : ${res.ram === 0 ? "Unlimited" : res.ram / 1000 + "GB"}
💾 Disk : ${res.disk === 0 ? "Unlimited" : res.disk / 1000 + "GB"}
⚡ CPU : ${res.cpu === 0 ? "Unlimited" : res.cpu + "%"}

🌐 Panel:
${domain}
`

      await sock.sendMessage(targetJid, { text: teks })

      await sock.sendMessage(jid, {
        text: `✅ Done\nDikirim ke: ${targetJid}`
      })

    } catch (err) {
      console.log(err)
      await sock.sendMessage(jid, {
        text: "❌ Error create panel (check console)"
      })
    }
  }
}