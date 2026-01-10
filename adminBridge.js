const fs = require("fs");
const path = require("path");
const https = require("https");
const crypto = require("crypto");

let adminConfig = null;
let adminActive = false;

// ===============================
// CHARGER CONFIG ADMIN
// ===============================
function loadAdminConfig() {
    if (adminConfig) return adminConfig;

    try {
        const configPath = path.join(__dirname, "config", "admin.json");
        const raw = fs.readFileSync(configPath, "utf-8");
        adminConfig = JSON.parse(raw);
        return adminConfig;
    } catch (err) {
        console.warn("Aucune config admin trouvée :", err.message);
        adminConfig = null;
        return null;
    }
}

// ===============================
// REQUÊTE GITHUB
// ===============================
function githubRequest(method, urlPath, bodyObj, token) {
    const options = {
        hostname: "api.github.com",
        port: 443,
        path: urlPath,
        method,
        headers: {
            "User-Agent": "Whocraft-Launcher",
            "Accept": "application/vnd.github+json"
        }
    };

    if (token) options.headers["Authorization"] = `Bearer ${token}`;

    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let data = "";
            res.on("data", (chunk) => (data += chunk));
            res.on("end", () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    try {
                        resolve(JSON.parse(data));
                    } catch {
                        resolve({});
                    }
                } else {
                    reject(new Error(`GitHub error ${res.statusCode}: ${data}`));
                }
            });
        });

        req.on("error", reject);

        if (bodyObj) {
            req.write(JSON.stringify(bodyObj));
        }

        req.end();
    });
}

// ===============================
// RÉCUPÉRER SHA D’UN FICHIER
// ===============================
async function getGithubFileInfo(filename) {
    const cfg = loadAdminConfig();
    if (!cfg) throw new Error("Config admin introuvable");

    const { repoOwner, repoName, dataBranch = "main" } = cfg;
    const token = cfg.githubToken;

    const urlPath = `/repos/${repoOwner}/${repoName}/contents/${filename}?ref=${dataBranch}`;
    const res = await githubRequest("GET", urlPath, null, token);

    return { sha: res.sha };
}

// ===============================
// METTRE À JOUR UN FICHIER JSON
// ===============================
async function updateGithubJson(filename, dataArray) {
    const cfg = loadAdminConfig();
    if (!cfg) throw new Error("Config admin introuvable");
    if (!adminActive) throw new Error("Mode admin non actif");

    const { repoOwner, repoName, dataBranch = "main" } = cfg;
    const token = cfg.githubToken;

    const { sha } = await getGithubFileInfo(filename);

    const contentBase64 = Buffer.from(JSON.stringify(dataArray, null, 2)).toString("base64");

    const urlPath = `/repos/${repoOwner}/${repoName}/contents/${filename}`;

    const body = {
        message: `Update ${filename} via Whocraft Launcher`,
        content: contentBase64,
        sha,
        branch: dataBranch
    };

    await githubRequest("PUT", urlPath, body, token);
}

// ===============================
// ADMIN LOGIN
// ===============================
async function enableAdmin(pseudo, password) {
    const cfg = loadAdminConfig();
    if (!cfg) return { ok: false, reason: "config_missing" };

    if (pseudo !== "LeDocteur_10") {
        return { ok: false, reason: "not_allowed" };
    }

    if (password !== cfg.adminPassword) {
        return { ok: false, reason: "wrong_password" };
    }

    adminActive = true;
    return { ok: true };
}

// ===============================
// NEWS
// ===============================
function generateId() {
    return crypto.randomBytes(8).toString("hex");
}

async function updateNews(text) {
    const file = path.join(__dirname, "data", "news.json");

    let arr = [];
    if (fs.existsSync(file)) arr = JSON.parse(fs.readFileSync(file, "utf-8"));

    arr.unshift({
        id: generateId(),
        text,
        date: new Date().toISOString()
    });

    fs.writeFileSync(file, JSON.stringify(arr, null, 2));
    await updateGithubJson("news.json", arr);

    return { ok: true };
}

async function deleteNews(id) {
    const file = path.join(__dirname, "data", "news.json");

    let arr = [];
    if (fs.existsSync(file)) arr = JSON.parse(fs.readFileSync(file, "utf-8"));

    arr = arr.filter(n => n.id !== id);

    fs.writeFileSync(file, JSON.stringify(arr, null, 2));
    await updateGithubJson("news.json", arr);

    return { ok: true };
}

// ===============================
// PATCHLOG
// ===============================
async function updatePatch(text) {
    const file = path.join(__dirname, "data", "patch.json");

    let arr = [];
    if (fs.existsSync(file)) arr = JSON.parse(fs.readFileSync(file, "utf-8"));

    arr.unshift({
        id: generateId(),
        text,
        date: new Date().toISOString()
    });

    fs.writeFileSync(file, JSON.stringify(arr, null, 2));
    await updateGithubJson("patch.json", arr);

    return { ok: true };
}

async function deletePatch(id) {
    const file = path.join(__dirname, "data", "patch.json");

    let arr = [];
    if (fs.existsSync(file)) arr = JSON.parse(fs.readFileSync(file, "utf-8"));

    arr = arr.filter(p => p.id !== id);

    fs.writeFileSync(file, JSON.stringify(arr, null, 2));
    await updateGithubJson("patch.json", arr);

    return { ok: true };
}

// ===============================
// EXPORTS
// ===============================
module.exports = {
    enableAdmin,
    updateNews,
    deleteNews,
    updatePatch,
    deletePatch
};
