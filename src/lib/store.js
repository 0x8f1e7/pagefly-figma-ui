import { Container } from 'unstated';
import { emit, listen } from './events';
import { FigmaAPI, GoogleAPI } from './api';
window.emit = emit;
export class Store extends Container {
    constructor() {
        super();
        this.state = {
            view: 'HOME',
            page: { url: '', title: '', items: [] },
            selection: [],
            google_api_key: '',
            figma_api_key: '',
            figma_team_id: '',
            figma_files: ['3uYkKPR3FJBC5w9DCj6AqZ', '6NJFtH7zbodiX5TVKJaI7s', 'R6ER7QFSbl0X2dy5KCCDJa'],
            figma_components: null,
            figma_styles: null
        };
        this.setLoading = async (state) => {
            if (this.isLoading != state) {
                this.isLoading = state;
                await this.setState({});
            }
        };
        this.setPage = async (page) => {
            await this.setState({ page });
        };
        this.setSelection = async (selection) => {
            await this.setState({ selection });
        };
        this.onLoad = async (state) => {
            await this.setState(state);
            this.subscribe(this.onUpdate);
            if (!this.state.figma_api_key || !this.state.google_api_key || !this.state.figma_team_id) {
                await this.navigate('AUTH');
            }
            else {
                this.figma = new FigmaAPI(this.state.figma_api_key, this.state.figma_team_id);
                this.google = new GoogleAPI(this.state.google_api_key);
                await this.fetch();
            }
        };
        this.onUpdate = () => {
            emit('save', this.state);
        };
        this.navigate = async (view) => {
            await this.setState({ view });
        };
        this.save = () => emit('save', this.state);
        this.fetch = async () => {
            const components = {};
            const styles = {};
            await this.setLoading(true);
            await Promise.all(this.state.figma_files.map(id => (this.figma.file(id).components().then(file => {
                Object.assign(components, file.components);
            }))));
            await emit('cache', { components, styles });
            await this.setLoading(false);
        };
        this.generate = async (url) => {
            await this.setLoading(true);
            const payload = {};
            const sheet = this.google.spreadsheet(url);
            await sheet.get().then(async (info) => {
                payload.id = sheet.id;
                payload.url = url;
                payload.title = info.properties.title;
                payload.sheets = info.sheets.map((item) => {
                    const id = item.properties.sheetId;
                    const title = item.properties.title;
                    if (parseInt(id) === parseInt(sheet.gid)) {
                        payload.sheet = title;
                    }
                    return { id, title, selected: payload.sheet === title };
                });
                payload.time = Date.now();
                payload.data = await sheet.values(payload.sheet + (sheet.range ? '!' + sheet.range : ''));
                console.log(payload.data);
                payload.grid = await sheet.get(`${payload.sheet}!A2:M${payload.data.length}`, true);
                console.log(payload.grid);
                await emit('draw', payload);
            });
            await this.setLoading(false);
        };
        listen('view', this.navigate);
        listen('page', this.setPage);
        listen('selection', this.setSelection);
        emit('load', this.onLoad);
    }
}
export const store = new Store;
