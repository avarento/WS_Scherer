const axios = require('axios');
const https = require('https');
const fs = require('fs');
const jsdom = require("jsdom");
const { get } = require('http');
const { connect } = require("./connect");
const { JSDOM } = jsdom;


//Configuração manual para o Axios aceitar o certificado de segurança do site da Scherer via Https Agent. 
const httpsAgent = new https.Agent({
    rejectUnauthorized: false,
    cert: fs.readFileSync('./cert'),
});

function IaN(string) {
    return /^\d+$/.test(string);
}


async function pesquisaScherer(scherer) {
    let URL = 'https://www.scherer-sa.com.br/produto/' + scherer;
    const { data } = await axios.get(URL, { httpsAgent });
    const dom = new JSDOM(data);
    const { document } = dom.window
    const pesquisa = {};
    pesquisa.codigo = document.querySelector("div> div > div > div > div > p.m-t-20")?.lastChild?.textContent.trim();
    pesquisa.descricao = document.querySelector("div > div > div > div > div > p.m-t-5")?.textContent
    pesquisa.imgURL = document.querySelector("div > div > div > div > div > img")?.src.replace("_g", "");
    pesquisa.updown = (document.querySelector("#wrapper > div > div > div > h1")?.textContent === "Produtos" ? "up" : "down");
    pesquisa.scherer = scherer;
    pesquisa.status = "";
    

    if (pesquisa.updown === "up" && pesquisa.descricao !== undefined) {
        pesquisa.status = "válido";
        return pesquisa;
    } else if (pesquisa.updown === "up" && pesquisa.descricao === undefined) {
        pesquisa.status = "inválido";
        return pesquisa;
    } else if (pesquisa.updown === "down") {
        pesquisa.status = pesquisa.updown;
        return pesquisa;
    } else {
        pesquisa.status = "error";
         return pesquisa;
    }        


}

async function extract(pool) {
    let info = {};
    info.id = pool.messages[0]?.key?.remoteJid;
    info.msg = pool.messages[0]?.message?.conversation;
    return info;
}


async function get_img_url(url) {
    const response = await axios.get(url, {
        httpsAgent, 
        responseType: 'arraybuffer'
    });
     
        const buffer = Buffer.from(response.data, 'base64');
        return buffer;
   
}


module.exports = {
    pesquisaScherer: pesquisaScherer,
    extract: extract,
    get_img_url: get_img_url,
    IaN: IaN
};