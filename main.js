const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const { autoUpdater } = require("electron-updater");
const path = require("path");
const adminBridge = require("./adminBridge");

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 700,
        resizable: false,
        frame: false,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            contextIsolation: true,
            nodeIntegration: false
        }
    });

    mainWindow.loadFile(path.join(__dirname, "ui", "index.html"));
}

ipcMain.on("close-app", () => {
    if (mainWindow) mainWindow.close();
    app.quit();
});

ipcMain.handle("check-admin", async (event, password) => {
    return adminBridge.enableAdmin("LeDocteur_10", password);
});

ipcMain.handle("admin-update-news", async (event, text) => {
    return adminBridge.updateNews(text);
});

ipcMain.handle("admin-update-patch", async (event, text) => {
    return adminBridge.updatePatch(text);
});

ipcMain.handle("admin-delete-news", async (event, id) => {
    return adminBridge.deleteNews(id);
});

ipcMain.handle("admin-delete-patch", async (event, id) => {
    return adminBridge.deletePatch(id);
});

ipcMain.handle("set-pseudo", (event, pseudo) => {
    global.currentPseudo = pseudo;
});

// Lancement Minecraft
ipcMain.handle("launch-minecraft", async () => {
    const launcher = require("./Minecraft/launcher");

    return new Promise(resolve => {
        launcher.start(global.currentPseudo, () => {
            resolve(); // Minecraft fermé → on réactive le bouton
        });
    });
});

// ⭐ AUTO-UPDATE ⭐
app.whenReady().then(() => {
    createWindow();

    // Vérifie les mises à jour
    autoUpdater.checkForUpdatesAndNotify();

    autoUpdater.on("update-available", () => {
        console.log("Mise à jour disponible !");
        mainWindow.webContents.send("update_available");
    });

    autoUpdater.on("update-downloaded", () => {
        console.log("Mise à jour téléchargée !");
        mainWindow.webContents.send("update_downloaded");
    });
});

// Installer la mise à jour
ipcMain.on("install_update", () => {
    autoUpdater.quitAndInstall();
});
