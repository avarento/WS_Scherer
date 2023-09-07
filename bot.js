const { connect } = require("./connect");
const { extract, IaN, pesquisaScherer, get_img_url } = require("./functions");


async function start_bot() {

    const waSocket = await connect();



    waSocket.ev.on('messages.upsert', async pool => {
        

        let info = await extract(pool);
        console.log(info)
       
        if (info?.msg?.startsWith("#") && IaN(info.msg.replace("#", "")) === true) {
            pesquisaScherer(info.msg.replace("#", "")).then(async (pesquisa) => {
                console.log("Scherer: ", pesquisa.scherer, "Status: ", pesquisa.status)

                if (pesquisa.status === "válido") {
                    const img = await get_img_url(pesquisa.imgURL);
                    let mensagem = `*_Cod Scherer:_* ${pesquisa.scherer} \n\n*_Código da peça:_* ${pesquisa.codigo} \n\n*_Descrição:_* ${pesquisa.descricao} 
                            \n\n`
                    await waSocket.sendMessage(info.id, {image: img, caption: mensagem})

                } else if (pesquisa.status === "inválido") {
                    let mensagem = `O código scherer *${pesquisa.scherer}* pode não existir, verifique novamente.`
                    await waSocket.sendMessage(info.id, {text: mensagem})
                }

            
            })   
        }

    });
}

module.exports = {
    start_bot: start_bot
}