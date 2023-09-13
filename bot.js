const { connect } = require("./connect");
const { extract, IaN, pesquisaScherer, get_img_url } = require("./functions");

////////////// OPEN AI API FUNCTION //////////////
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

async function runCompletion(){
  const completion = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: "How are u today?",
    max_tokens: 4000
  });
  console.log(completion.data.choises[0].text);
}

runCompletion()
//////////////////////////////////////////////////

async function start_bot() {

    const waSocket = await connect();



    waSocket.ev.on('messages.upsert', async pool => {
        console.log(pool.messages[0])

        let info = await extract(pool);

        if (info.msg === "Oi") {
            
            await waSocket.sendMessage(info.id, { text: "ooi"});
            
        } 
        
        else if (info.msg.startsWith("#") && IaN(info.msg.replace("#", "")) === true) {
            pesquisaScherer(info.msg.replace("#", "")).then(async (pesquisa) => {
                console.log(pesquisa)

                if (pesquisa.status === "válido") {
                    const img = await get_img_url(pesquisa.imgURL);
                    let mensagem = `*_Cod Scherer:_* ${pesquisa.scherer} \n\n*_Código da peça:_* ${pesquisa.codigo} \n\n*_Descrição:_* ${pesquisa.descricao} 
                            \n\n*Deseja requisitar esta peça?*\n*(S, N, F, M)*`
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
