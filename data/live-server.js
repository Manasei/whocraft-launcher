const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

// Port WebSocket
const wss = new WebSocket.Server({ port: 8080 });
console.log("WebSocket server running on ws://localhost:8080");

// Historique des news et patchs
let newsLogs = [];
let patchLogs = [];

// Charger l'historique depuis fichier JSON si existant
const newsFile = path.join(__dirname, 'news.json');
const patchFile = path.join(__dirname, 'patch.json');

if (fs.existsSync(newsFile)) newsLogs = JSON.parse(fs.readFileSync(newsFile));
if (fs.existsSync(patchFile)) patchLogs = JSON.parse(fs.readFileSync(patchFile));

// Fonction broadcast
function broadcast(type, data) {
    wss.clients.forEach(client => {
        if(client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type, data }));
        }
    });
}

// Connexion client
wss.on('connection', ws => {
    console.log('Client connecté');

    // Envoyer historique complet
    ws.send(JSON.stringify({ type: 'news', data: newsLogs }));
    ws.send(JSON.stringify({ type: 'patch', data: patchLogs }));
});

// Ajouter news
function addNews(title) {
    const news = { date: new Date().toISOString().split('T')[0], title };
    newsLogs.push(news);
    fs.writeFileSync(newsFile, JSON.stringify(newsLogs, null, 2));
    broadcast('news', [news]);
}

// Ajouter patch
function addPatch(changelog) {
    const patch = { date: new Date().toISOString().split('T')[0], changelog };
    patchLogs.push(patch);
    fs.writeFileSync(patchFile, JSON.stringify(patchLogs, null, 2));
    broadcast('patch', [patch]);
}

module.exports = { addNews, addPatch };
