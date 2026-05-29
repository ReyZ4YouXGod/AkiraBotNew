async function loadingBar(
    sock,
    jid,
    baseText = "Loading"
) {

    let percent = 0;

    const sent = await sock.sendMessage(jid, {
        text: "Loading... 0%"
    });

    while (percent <= 100) {

        const bar =
            generateBar(percent);

        await sock.relayMessage(
            jid,
            {
                protocolMessage: {
                    key: sent.key,
                    type: 14,
                    editedMessage: {
                        conversation:
                            `${baseText}\n\n` +
                            `${bar} ${percent}%`
                    }
                }
            },
            {}
        );

        await delay(300);

        percent += 10;
    }
}

function generateBar(percent) {

    const total = 10;

    const filled =
        Math.round(
            (percent / 100) * total
        );

    const empty =
        total - filled;

    return (
        "[" +
        "█".repeat(filled) +
        "░".repeat(empty) +
        "]"
    );
}

function delay(ms) {
    return new Promise(
        resolve => setTimeout(resolve, ms)
    );
}

module.exports = {
    loadingBar
};