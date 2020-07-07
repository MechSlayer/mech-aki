const requests = require("request-promise");


async function getServer(themeCode)
{
    let split = themeCode.split("_");
    let lang = split[0];
    let theme = split[1];
    /**@type {string} */
    let page = await requests.get(`https://${lang}.akinator.com`);
    let regex = /\[{\"translated_theme_name\":\"[\s\S]*\",\"urlWs\":\"https:\\\/\\\/srv[0-9]+\.akinator\.com:[0-9]+\\\/ws\",\"subject_id\":\"[0-9]+\"}]/gim
    let parsed = JSON.parse(page.match(regex));
    let obj = {};
    for (let sv of parsed) obj[sv.translated_theme_name.toLowerCase()] = sv;
    if (!theme) return Object.values(obj)[0];
    else return obj[theme];
}

module.exports = {getServer}