const requests = require("request-promise");
const servers = require("./servers");

async function request(url, {method = "GET", headers = {}, qs = {}}={})
{
    let opts = {
        method,
        url,
        qs,
        headers,
        gzip: true,
        resolveWithFullResponse: true,
        timeout: 10000
    };
    opts.headers.Accept = "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
    opts.headers["Accept-Encoding"] = "gzip, deflate";
    opts.headers["Accept-Language"] = "en-US,en;q=0.9";
    opts.headers["User-Agent"] = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) snap Chromium/81.0.4044.92 Chrome/81.0.4044.92 Safari/537.36"
    opts.headers["x-requested-with"] = "XMLHttpRequest";

    let response = await requests(opts).catch(() => null);

    if (!response) throw new Error("Ha ocurrido un error al procesar la solicitud");

    let start = response.body.indexOf("(");
    let jsonString = response.body.substring(start + 1, response.body.length - 1);
    response.body = JSON.parse(jsonString);
    return response;
}

function findUrl(language = "en")
{
    return servers[language] || servers.en;
}

async function findSession()
{
    let regExp = new RegExp("var uid_ext_session = '(.*)';\\n.*var frontaddr = '(.*)';");
    let response = await requests("https://es.akinator.com/game").catch(() => null);

    if (response && response.match(regExp))
    {
        let uid = regExp.exec(response)[1];
        let frontaddr = regExp.exec(response)[2];
        return {uid, frontaddr};
    }
    throw new Error("Ha ocurrido un error al crear la sesión");
}

module.exports = {request, findUrl, findSession}