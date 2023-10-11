const { default:  MessageType, MessageOptions, Mimetype, makeWASocket, Browsers, DisconnectReason, useMultiFileAuthState } = require('@whiskeysockets/baileys');


async function connect() {
  try {
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
  } catch (err) {
    console.log("ERRO EM CONNECT - SITUAÇÃO: ", err);
  }
}


module.exports = {
    connect: connect
}
