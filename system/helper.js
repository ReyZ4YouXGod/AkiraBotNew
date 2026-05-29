const { jidNormalizedUser, proto, getContentType } = require('@whiskeysockets/baileys');

function serialize(sock, m) {
    if (!m) return m;
    let M = proto.WebMessageInfo;
    if (m.key) {
        m.id = m.key.id;
        m.isBot = m.id.startsWith('BAE5') && m.id.length === 16;
        m.chat = m.key.remoteJid;
        m.fromMe = m.key.fromMe;
        m.isGroup = m.chat.endsWith('@g.us');
        m.sender = jidNormalizedUser(m.fromMe ? sock.user.id : m.isGroup ? m.key.participant : m.chat);
    }
    if (m.message) {
        m.mtype = getContentType(m.message);
        m.msg = (m.mtype === 'viewOnceMessage' || m.mtype === 'viewOnceMessageV2') ? m.message[m.mtype].message[getContentType(m.message[m.mtype].message)] : m.message[m.mtype];
        
        let responseId = '';
        if (m.mtype === 'interactiveResponseMessage' && m.msg?.nativeFlowResponseMessage) {
            try {
                let parseParams = JSON.parse(m.msg.nativeFlowResponseMessage.paramsJson);
                responseId = parseParams.id;
            } catch (e) {
                responseId = '';
            }
        }

        m.body = m.message?.conversation || 
                 m.msg?.caption || 
                 m.msg?.text || 
                 responseId || 
                 (m.mtype === 'listResponseMessage' && m.msg?.singleSelectReply?.selectedRowId) || 
                 (m.mtype === 'buttonsResponseMessage' && m.msg?.selectedButtonId) || 
                 (m.mtype === 'templateButtonReplyMessage' && m.msg?.selectedId) || 
                 m.text || '';
        
        m.quoted = m.msg?.contextInfo ? m.msg.contextInfo.quotedMessage : null;
        if (m.quoted) {
            let type = getContentType(m.quoted);
            m.quoted = m.quoted[type];
            if (['productMessage'].includes(type)) {
                type = getContentType(m.quoted);
                m.quoted = m.quoted[type];
            }
            if (typeof m.quoted === 'string') m.quoted = { text: m.quoted };
            if (m.quoted) {
                m.quoted.mtype = type;
                m.quoted.id = m.msg.contextInfo.stanzaId;
                m.quoted.sender = jidNormalizedUser(m.msg.contextInfo.participant);
                m.quoted.fromMe = m.quoted.sender === jidNormalizedUser(sock.user?.id || '');
                m.quoted.text = m.quoted.text || m.quoted.caption || m.quoted.conversation || '';
            }
        }
    }
    
    m.reply = (text, options = {}) => sock.sendMessage(m.chat, { text: text, ...options }, { quoted: m });
    
    return m;
}

module.exports = { serialize };
