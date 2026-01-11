const { app, BrowserWindow, ipcMain } = require("electron");
const { autoUpdater } = require("electron-updater");
const path = require("path");
const adminBridge = require("./adminBridge");
const launcher = require("./Minecraft/launcher");

let mainWindow;
global.currentPseudo = null;

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

// =========================
// IPC MAIN
// =========================

// Fermer l'application
ipcMain.on("close-app", () => {
    if (mainWindow) mainWindow.close();
    app.quit();
});

// Stocke pseudo global
ipcMain.handle("set-pseudo", (event, pseudo) => {
    global.currentPseudo = pseudo;
});

// Vérifie mot de passe admin
ipcMain.handle("check-admin", async (event, password) => {
    const pseudo = global.currentPseudo;
    if (!pseudo) return { ok: false, reason: "not_logged" };

    try {
        const result = await adminBridge.enableAdmin(pseudo, password);
        return result; // { ok: true } ou { ok: false, reason: "..." }
    } catch (err) {
        console.error("Erreur check-admin :", err);
        return { ok: false, reason: "error" };
    }
});

// Gestion news / patch
ipcMain.handle("admin-update-news", async (event, text) => adminBridge.updateNews(text));
ipcMain.handle("admin-update-patch", async (event, text) => adminBridge.updatePatch(text));
ipcMain.handle("admin-delete-news", async (event, id) => adminBridge.deleteNews(id));
ipcMain.handle("admin-delete-patch", async (event, id) => adminBridge.deletePatch(id));

// =========================
// LANCER MINECRAFT
// =========================
ipcMain.handle("launch-minecraft", async () => {
    if (!global.currentPseudo) global.currentPseudo = "Player";

    return new Promise((resolve, reject) => {
        try {
            launcher.start(global.currentPseudo, () => {
                console.log("Minecraft fermé !");
                resolve();
            });
        } catch (err) {
            console.error("Erreur lancement Minecraft :", err);
            reject(err);
        }
    });
});

// =========================
// AUTO-UPDATES
// =========================
app.whenReady().then(() => {
    createWindow();

    autoUpdater.checkForUpdatesAndNotify();

    autoUpdater.on("update-available", () => {
        console.log("Mise à jour disponible !");
        if (mainWindow) mainWindow.webContents.send("update_available");
    });

    autoUpdater.on("update-downloaded", () => {
        console.log("Mise à jour téléchargée !");
        if (mainWindow) mainWindow.webContents.send("update_downloaded");
    });
});

// Installer mise à jour
ipcMain.on("install_update", () => autoUpdater.quitAndInstall());

// Réouvrir fenêtre si fermé sur macOS
app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// Quitter app si toutes les fenêtres fermées
app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});
