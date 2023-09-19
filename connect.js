const { default:  MessageType, MessageOptions, Mimetype, makeWASocket, Browsers, DisconnectReason, useMultiFileAuthState } = require('@whiskeysockets/baileys');


async function connect() {
    const { state, saveCreds } = await useMultiFileAuthState(`wpp_auth`)
    const waSocket = makeWASocket({
        printQRInTerminal: true,
        syncFullHistory: false,
        auth: state,
    });

    waSocket.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;

            if (shouldReconnect) {
                connect();
            }
        }

    }); 

    waSocket.ev.on('creds.update', saveCreds)
    

    return waSocket;
}

module.exports = {
    connect: connect
}
