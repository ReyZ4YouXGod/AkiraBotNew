module.exports = {
    command: ['kick', 'tendang'],
    isGroup: true, 
    isAdmin: true, 
    isBotAdmin: true,    

    run: async (sock, m, { text }) => {
        let users = m.quoted ? m.quoted.sender : m.msg.contextInfo && m.msg.contextInfo.mentionedJid ? m.msg.contextInfo.mentionedJid[0] : text.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
        
        if (!users) return m.reply('*[ GAGAL ]* Reply pesan target atau tag orang yang ingin di-kick!');
        
        await sock.groupParticipantsUpdate(m.chat, [users], 'remove')
            .then(() => m.reply('Sukses mengeluarkan target dari grup.'))
            .catch((err) => m.reply('Gagal mengeluarkan member: ' + err));
    }
};
