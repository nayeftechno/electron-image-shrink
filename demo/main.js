const {app,BrowserWindow,ipcMain} = require('electron');

let mainWin;
let aboutWin;

function createMainWin(){
    mainWin = new BrowserWindow({
        title: 'Home',
        width: 500,
        height: 600,
        webPreferences:{
            nodeIntegration: true
        }
    });
    mainWin.loadFile('./demo/index.html');
};

function createAboutWin(){
    mainWin = new BrowserWindow({
        title: 'Home',
        width: 300,
        height: 400,
    });
    mainWin.loadFile('./demo/about.html');
};



app.on('ready',createMainWin)

ipcMain.on('open:about',()=>{
    createAboutWin();
})
