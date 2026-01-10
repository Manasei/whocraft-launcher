const { contextBridge, ipcRenderer } = require("electron");

// API principale du launcher
contextBridge.exposeInMainWorld("launcher", {
    closeApp: () => ipcRenderer.send("close-app"),
    launchGame: () => ipcRenderer.send("launch-game"),
    checkAdmin: (password) => ipcRenderer.invoke("check-admin", password),

    // Ajout des nouvelles fonctions
    setPseudo: (pseudo) => ipcRenderer.invoke("set-pseudo", pseudo),

    // IMPORTANT : maintenant launchMinecraft retourne une PROMISE
    launchMinecraft: () => ipcRenderer.invoke("launch-minecraft")
});

// API admin
contextBridge.exposeInMainWorld("admin", {
    updateNews: (text) => ipcRenderer.invoke("admin-update-news", text),
    deleteNews: (id) => ipcRenderer.invoke("admin-delete-news", id),
    updatePatch: (text) => ipcRenderer.invoke("admin-update-patch", text),
    deletePatch: (id) => ipcRenderer.invoke("admin-delete-patch", id)
});
