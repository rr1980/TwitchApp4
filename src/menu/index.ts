
const electron = require('electron');
const path = require('path');
const url = require('url');

const BrowserWindow = electron.remote.BrowserWindow;
const ipcMain = electron.remote.ipcMain;

export default class Menu {

    options: any;
    parentWindow: any;
    DEFAULT_WIDTH = 370;
    DEFAULT_HEIGHT = 160;

    constructor(options: any, parentWindow: any) {
        this.options = options;
        this.parentWindow = parentWindow;
    }

    public Create(): Promise<string> {

        const id = `${new Date().getTime()}-${Math.random()}`;

        return new Promise((resolve, reject) => {
            const opts = Object.assign(
                {
                    width: this.DEFAULT_WIDTH,
                    height: this.DEFAULT_HEIGHT,
                    minWidth: this.DEFAULT_WIDTH,
                    minHeight: this.DEFAULT_HEIGHT,
                    resizable: false,
                    title: 'Channel switch',
                    label: 'Please input a value:',
                    alwaysOnTop: false,
                    value: null,
                    menuBarVisible: false
                },
                this.options || {}
            );

            let eWindow = new BrowserWindow({
                width: opts.width,
                height: opts.height,
                minWidth: opts.minWidth,
                minHeight: opts.minHeight,
                resizable: opts.resizable,
                parent: this.parentWindow,
                skipTaskbar: true,
                alwaysOnTop: opts.alwaysOnTop,
                useContentSize: opts.resizable,
                modal: Boolean(this.parentWindow),
                title: opts.title,
                icon: opts.icon,
                webPreferences: {
                    nodeIntegration: true
                }
            });

            eWindow.setMenu(null);
            eWindow.setMenuBarVisibility(opts.menuBarVisible);

            const getOptionsListener = event => {
                event.returnValue = JSON.stringify(opts);
            };

            const cleanup = () => {
                if (eWindow) {
                    eWindow.close();
                    eWindow = null;
                }
            };

            const postDataListener = (event, value) => {
                resolve(value);
                event.returnValue = null;
                cleanup();
            };

            const unresponsiveListener = () => {
                reject(new Error('Window was unresponsive'));
                cleanup();
            };

            const errorListener = (event, message) => {
                reject(new Error(message));
                event.returnValue = null;
                cleanup();
            };

            ipcMain.on('prompt-get-options:' + id, getOptionsListener);
            ipcMain.on('prompt-post-data:' + id, postDataListener);
            ipcMain.on('prompt-error:' + id, errorListener);
            eWindow.on('unresponsive', unresponsiveListener);

            eWindow.on('closed', () => {
                ipcMain.removeListener('prompt-get-options:' + id, getOptionsListener);
                ipcMain.removeListener('prompt-post-data:' + id, postDataListener);
                ipcMain.removeListener('prompt-error:' + id, postDataListener);
                resolve(null);
            });

            eWindow.webContents.openDevTools();

            const promptUrl = url.format({
                protocol: 'file',
                slashes: true,
                pathname: path.join(__dirname, 'dist', 'menu', 'index.html'),
                hash: id
            });

            eWindow.loadURL(promptUrl);
        });
    }
}