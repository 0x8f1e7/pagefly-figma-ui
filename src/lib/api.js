export class API {
    set auth(payload) {
        this._token = payload.access_token;
        this._expired = Date.now() + payload.expires_in;
    }
    async get(path, params) {
        const headers = { Authorization: `Bearer ${this._token}` };
        const query = params ? Object.entries(params).map(([k, v]) => `${k}=${v}`).join('&') : '';
        const request = await fetch(`${this._baseURL}/${path}?${query}`, { headers });
        return await request.json();
    }
}
export class FigmaAPI extends API {
    constructor() {
        super(...arguments);
        this._baseURL = `https://api.figma.com/v1`;
        this.teamProjects = id => this.get(`teams/${id}/projects`);
        this.projectFiles = id => this.get(`projects/${id}/files`);
        this.fileComponents = id => this.get(`files/${id}/components`);
        this.fileStyles = id => this.get(`files/${id}/styles`);
        this.component = id => this.get(`components/${id}`);
        this.style = id => this.get(`styles/${id}`);
        this.file = id => this.get(`files/${id}`);
    }
}
export class GoogleAPI extends API {
    constructor() {
        super(...arguments);
        this._baseURL = `https://sheets.googleapis.com/v4`;
        this.sheet = (id, params) => this.get(`spreadsheets/${id}`);
    }
}
export const figma = new FigmaAPI;
export const google = new GoogleAPI;
// type resolve_t = (...args:any[]) => null
// type reject_t = ({ error: boolean, status: number, message: string }) => null
// type promise_t = Promise<{[key:string]:any}>
//
// function loadHandler(resolve:resolve_t, reject:reject_t):(Event) => null {
// 	return ({ target: req }) => {
// 		if (req.status === 200) {
// 			if (req.getResponseHeader('Content-Type').startsWith('application/json')) {
// 				const payload = JSON.parse(req.responseText)
// 				return resolve(payload)
// 			}
// 		}
// 		reject({ error: true, status: req.status, message: req.responseText })
// 	}
// }
// export class FigmaAPI2 {
// 	static _baseURL:string = `https://api.figma.com/v1/`
//
// 	protected _token:string
// 	protected _team:string
//
// 	constructor(token:string, team?:string) {
// 		this._token = token
// 		this._team = team
// 	}
//
// 	query = (path:string):promise_t => {
// 		return new Promise((resolve:resolve_t, reject:reject_t) => {
// 			const req = new XMLHttpRequest
// 			req.open('GET', FigmaAPI._baseURL + path, true)
// 			// req.setRequestHeader('X-FIGMA-TOKEN', this._token)
// 			req.setRequestHeader('Authorization', 'Bearer ' + this._token)
// 			req.addEventListener('load', loadHandler(resolve, reject))
// 			req.send()
// 		})
// 	}
//
// 	projects = async () => await this.query(`teams/${this._team}/projects`)
//
// 	project = id => async () => await this.query(`projects/${id}/files`)
//
// 	file = id => ({
// 		get: async () => await this.query(`files/${id}`),
// 		styles: async () => (await this.query(`files/${id}/styles`)).meta,
// 		components: async () => (await this.query(`files/${id}/components`)).meta
// 	})
//
// 	component = id => ({
// 		get: async () => await this.query(`components/${id}`)
// 	})
//
// 	style = id => ({
// 		get: async () => await this.query(`styles/${id}`)
// 	})
// }
//
// type api_scope_t = string
//
// export class GoogleAPI2 {
//
// 	static API_URL_ROOT = 'https://sheets.googleapis.com/v4/'
// 	static URL_REGEX_ID = /^https:\/\/docs.google.com\/spreadsheets\/d\/([^\\]+)\/edit.*$/
//
// 	_token:string
//
// 	constructor(token:string) {
// 		this._token = token
// 	}
//
// 	query = (path:api_scope_t, ranges?:string, includeGridData:boolean = false):promise_t => {
// 		return new Promise((resolve:resolve_t, reject:reject_t) => {
// 			const req = new XMLHttpRequest
// 			const url = GoogleAPI.API_URL_ROOT + path + '?' + (includeGridData ? 'includeGridData=true&' : '') + (ranges ? 'ranges=' + ranges + '&' : '')
// 			req.open('GET', url, true)
// 			req.setRequestHeader('Authorization', 'Bearer ' + this._token)
// 			req.addEventListener('load', loadHandler(resolve, reject))
// 			req.send()
// 		})
// 	}
//
// 	spreadsheet = url => {
// 		let id = url.replace(GoogleAPI.URL_REGEX_ID, '$1')
// 		const [, gid] = url.match(/gid=([^&]+)/) || []
// 		const [, range] = url.match(/range=([^&]+)/) || []
// 		if (!id) id = url
// 		return {
// 			id,
// 			gid,
// 			range,
// 			isValid: !!id,
// 			get: async (range?, includeGridData:boolean = false) => await this.query(`spreadsheets/${id}`, range, includeGridData),
// 			props: async () => (await this.query(`spreadsheets/${id}`)).properties,
// 			sheets: async () => (await this.query(`spreadsheets/${id}`)).sheets,
// 			values: async range => (await this.query(`spreadsheets/${id}/values/${range}`)).values
// 		}
// 	}
// }
