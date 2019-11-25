const electron = require('electron');
const path = require('path');
const electronLocalshortcut = require('electron-localshortcut');
const aspect = require("electron-aspectratio");

const BrowserWindow = electron.BrowserWindow;

export default class Main {
    static eWindow: Electron.BrowserWindow;
    static application: Electron.App;
    static BrowserWindow: any;
    static mainWindowHandler: any;

    private static onWindowAllClosed() {
        if (process.platform !== 'darwin') {
            Main.application.quit();
        }
    }

    private static onClose() {
        // electronLocalshortcut.unregisterAll(Main.eWindow);
        Main.eWindow = null;
    }

    private static onActivate() {
        if (Main.eWindow === null) {
            Main.create();
        }
    }

    private static onReady() {
        Main.create();
    }

    private static create() {

        Main.eWindow = new Main.BrowserWindow({
            width: 1366,
            height: 768,
            minWidth: 500,
            minHeight: 281,
            autoHideMenuBar: true,
            darkTheme: true,
            titleBarStyle: 'hiddenInset',
            frame: false,
            webPreferences: {
                nodeIntegration: true,
                preload: path.join(__dirname, 'preload.js'),
                webSecurity: false
            }
        });

        Main.eWindow.on('closed', Main.onClose);

        Main.eWindow.loadFile(path.join(__dirname, "../index.html"));;
        Main.mainWindowHandler = new aspect(Main.eWindow);
        Main.mainWindowHandler.setRatio(16, 9, 1);

        electronLocalshortcut.register(Main.eWindow, 'Escape', () => {
            Main.eWindow.webContents.send('toggle-title-bar', true);
        });
    }

    static main(app: Electron.App, browserWindow: typeof BrowserWindow) {
        Main.BrowserWindow = browserWindow;
        Main.application = app;
        Main.application.on('window-all-closed', Main.onWindowAllClosed);
        Main.application.on('ready', Main.onReady);
        Main.application.on('activate', Main.onActivate);
    }
}