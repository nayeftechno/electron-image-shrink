const path = require("path");
const os = require("os");
const { app, BrowserWindow, Menu, ipcMain, shell } = require("electron");
const imagemin = require("imagemin");
const imageminMozjpeg = require("imagemin-mozjpeg");
const imageminPngquant = require("imagemin-pngquant");
const slash = require("slash"); // Convert Windows backslash paths to slash paths: foo\\bar ➔ foo/bar
const log = require("electron-log");
const menu = require("./menu");

const Environment = {
  DEVELOPMENT: "development",
  PRODUCTION: "production",
};

// Set env
process.env.NODE_ENV = Environment.PRODUCTION;

const isDev = process.env.NODE_ENV !== Environment.PRODUCTION ? true : false;
const isMac = process.platform === "darwin" ? true : false;

let mainWindow;
let aboutWindow;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    title: "ImageShrink",
    width: 500,
    height: 600,
    icon: `${__dirname}/assets/icons/Icon_256x256.png`,
    resizable: isDev ? true : false,
    backgroundColor: "white",
    webPreferences: {
      nodeIntegration: true,
    },
  });
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }
  mainWindow.loadURL(`file://${__dirname}/app/index.html`);
  mainWindow.on("closed", () => (mainWindow = null));
}

function createAboutWindow() {
  aboutWindow = new BrowserWindow({
    parent: mainWindow,
    title: "About ImageShrink",
    width: 300,
    height: 300,
    icon: `${__dirname}/assets/icons/Icon_256x256.png`,
    resizable: false,
    backgroundColor: "white",
    movable: false,
    minimizable: false,
  });
  aboutWindow.loadURL(`file://${__dirname}/app/about.html`);
  aboutWindow.on("closed", () => (aboutWindow = null));
}

app.on("ready", () => {
  createMainWindow();
  const mainMenu = Menu.buildFromTemplate(
    menu(isMac, isDev, app.appName, createAboutWindow)
  );
  Menu.setApplicationMenu(mainMenu);
});

ipcMain.on("image:minimize", (e, options) => {
  options.dest = path.join(os.homedir(), "imageshrink");
  shrinkImage(options);
});

async function shrinkImage({ imgPath, quality, dest }) {
  try {
    const pngQuality = quality / 100;

    const files = await imagemin([slash(imgPath)], {
      destination: dest,
      plugins: [
        imageminMozjpeg({ quality }),
        imageminPngquant({
          quality: [pngQuality, pngQuality],
        }),
      ],
    });
    // log info about converted files.
    log.info(files);
    // macOS: ~/Library/Logs/imageshrink/main.log
    // Windows: %USERPROFILE%\AppData\Roaming\imageshrink\logs\main.log
    // Linux: ~/.config/imageshrink/logs/main.log
    shell.openPath(dest);
    // Open folder.
    mainWindow.webContents.send("image:done");
    // Send to renderer process that resize is done 👍 👍 👍 .
  } catch (err) {
    log.error(err);
  }
}

app.on("window-all-closed", () => {
  if (!isMac) {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});

app.allowRendererProcessReuse = true;
