const utils = require("./Utils");
const servers = require("./servers");


module.exports = class Client
{
    constructor(idioma)
    {
        this.idioma = idioma;
        this.servidor = null;
        this.paso = 0;
        this.progreso = 0;
        this.signature = null;
        this.identify_session = null;
        this.challenge_auth = null;
    }

    async empezar()
    {
        let serverData = await servers.getServer(this.idioma);
        if (!serverData) throw new Error("No hay ningún servidor para este idioma");
        this.servidor = serverData.urlWs;
        this.sesion = await utils.findSession();
        let response = await utils.request("https://es.akinator.com/new_session", {qs:{
            callback: `jQuery34106155002462600851_${Date.now()}`,
            urlApiWs: this.servidor,
            player: "website-desktop",
            partner: 1,
            uid_ext_session: this.sesion.uid,
            frontaddr: this.sesion.frontaddr,
            childMod: "",
            constraint: "ETAT<>'AT'",
            soft_constraint: "",
            question_filter: "",
            _: Date.now()
        }});
        let body = response.body;
        if (!body || body.completion != "OK") throw new Error("Ha ocurrido un error al empezar el juego " + JSON.stringify(body));

        this.signature = body.parameters.identification.signature;
        this.challenge_auth = body.parameters.identification.challenge_auth;
        this.identify_session = body.parameters.identification.session;

        let step_info = body.parameters.step_information;

        this.progreso = parseFloat(step_info.progression);
        return {
            pregunta: step_info.question,
            respuestas: step_info.answers.map(a => a.answer),
            progreso: this.progreso
        };
    }

    /**
     * 
     * @param {number} respuesta 
     *
     */
    async siguiente(respuesta) {
        if (!this.signature) return this.empezar();

        let response = await utils.request("https://es.akinator.com/answer_api", {qs: {
            callback: `jQuery34106155002462600851_${Date.now()}`,
            urlApiWs: this.servidor,
            session: this.identify_session,
            signature: this.signature,
            step: this.paso,
            frontaddr: this.sesion.frontaddr,
            answer: respuesta,
            question_filter: "",
            _: Date.now()
        }});
        
        let body = response.body;
        if (body.completion == "WARN - NO QUESTION") return null;
        if (body.completion != "OK") throw new Error("Ha ocurrido un error al pasar de pregunta " + JSON.stringify(body));
        let params = body.parameters;

        this.progreso = parseFloat(params.progression);
        this.paso++;

        return {
            pregunta: params.question,
            respuestas: params.answers.map(a => a.answer),
            progreso: this.progreso
        }
    }

    /**
     *  @returns {Promise<{nombre: string, foto: string, descripcion: string}[]>}
     */
    async respuestas()
    {
        let response = await utils.request(`${this.servidor}/list`, {qs: {
            callback: `jQuery34106155002462600851_${Date.now()}`,
            session: this.identify_session,
            signature: this.signature,
            step: this.paso,
            size: 10,
            max_pic_width: 1920,
            max_pic_height: 1080,
            pref_photos: "VO-OK",
            duel_allowed: 0,
            mode_question: 0,
            _: Date.now()
        }})

        let body = response.body;
        if (body.completion != "OK") throw new Error("Ha ocurrido un error al obtener las respuestas " + JSON.stringify(body));
        let params = body.parameters;

        let personajes = params.elements.map(e => {return {nombre: e.element.name, foto: e.element.absolute_picture_path, descripcion: e.element.description}});
        return personajes;
    }

    async atras()
    {
        let response = await utils.request(`${this.servidor}/cancel_answer`, {qs: {
            callback: `jQuery34106155002462600851_${Date.now()}`,
            session: this.identify_session,
            signature: this.signature,
            step: this.paso,
            answer: -1,
            question_filter: "",
            _: Date.now()
        }})

        
        let body = response.body;
        if (body.completion == "WARN - NO QUESTION") return null;
        if (body.completion != "OK") throw new Error("Ha ocurrido un error al pasar de pregunta " + JSON.stringify(body));
        let params = body.parameters;

        this.progreso = parseFloat(params.progression);
        this.paso--;

        return {
            pregunta: params.question,
            respuestas: params.answers.map(a => a.answer),
            progreso: this.progreso
        }
    }
}