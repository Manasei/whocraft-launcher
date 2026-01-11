// =========================
// VARIABLES GLOBALES
// =========================
let adminMode = false;

// =========================
// LOGIN
// =========================

const loginScreen = document.getElementById("login-screen");
const loginBtn = document.getElementById("login-btn");
const pseudoInput = document.getElementById("pseudo-input");

loginBtn.addEventListener("click", () => {
    const pseudo = pseudoInput.value.trim();
    if (pseudo.length < 3) return;

    localStorage.setItem("whocraft_pseudo", pseudo);
    window.launcher.setPseudo(pseudo);
    loginScreen.style.display = "none";

    document.getElementById("player-name").textContent = pseudo;
    document.getElementById("player-skin").src = `https://mc-heads.net/avatar/${pseudo}`;

    if (pseudo === "LeDocteur_10") {
        document.getElementById("btn-admin").style.display = "block";
    }
});

// =========================
// AUTO-LOGIN
// =========================

window.addEventListener("load", () => {
    const saved = localStorage.getItem("whocraft_pseudo");
    if (saved) {
        loginScreen.style.display = "none";
        document.getElementById("player-name").textContent = saved;
        document.getElementById("player-skin").src = `https://mc-heads.net/avatar/${saved}`;

        if (saved === "LeDocteur_10") {
            document.getElementById("btn-admin").style.display = "block";
        }

        window.launcher.setPseudo(saved);
    }

    loadNews();
    loadPatch();
});

// =========================
// LOGOUT
// =========================

document.getElementById("player-info").addEventListener("click", () => {
    localStorage.removeItem("whocraft_pseudo");
    location.reload();
});

// =========================
// NAVIGATION
// =========================

const newsSection = document.getElementById("news-section");
const patchSection = document.getElementById("patch-section");
const adminSection = document.getElementById("admin-section");
const adminBtn = document.getElementById("btn-admin");

document.getElementById("btn-news").addEventListener("click", () => {
    newsSection.style.display = "block";
    patchSection.style.display = "none";
    adminSection.style.display = "none";
});

document.getElementById("btn-patch").addEventListener("click", () => {
    newsSection.style.display = "none";
    patchSection.style.display = "block";
    adminSection.style.display = "none";
});

// =========================
// ADMIN BUTTON BEHAVIOR
// =========================

adminBtn.addEventListener("click", () => {
    if (!adminMode) {
        document.getElementById("admin-popup").style.display = "flex";
    } else {
        document.getElementById("admin-disable-popup").style.display = "flex";
    }
});

// =========================
// ADMIN LOGIN POPUP
// =========================

document.getElementById("admin-popup-validate").addEventListener("click", async () => {
    const password = document.getElementById("admin-popup-password").value.trim();
    const pseudo = localStorage.getItem("whocraft_pseudo");
    const error = document.getElementById("admin-popup-error");

    if (!pseudo) {
        error.textContent = "Vous devez être connecté.";
        return;
    }

    const result = await window.launcher.checkAdmin(password);

    if (!result.ok) {
        error.textContent = "Mot de passe incorrect.";
        return;
    }

    adminMode = true;

    document.getElementById("create-news-btn").style.display = "block";
    document.getElementById("create-patch-btn").style.display = "block";

    adminBtn.textContent = "🔓";

    document.getElementById("admin-popup").style.display = "none";

    loadNews();
    loadPatch();
});

document.getElementById("admin-popup-cancel").addEventListener("click", () => {
    document.getElementById("admin-popup").style.display = "none";
});

// =========================
// ADMIN DISABLE POPUP
// =========================

document.getElementById("admin-disable-cancel").addEventListener("click", () => {
    document.getElementById("admin-disable-popup").style.display = "none";
});

document.getElementById("admin-disable-confirm").addEventListener("click", () => {
    adminMode = false;

    document.getElementById("create-news-btn").style.display = "none";
    document.getElementById("create-patch-btn").style.display = "none";

    document.querySelectorAll(".delete-btn").forEach(btn => btn.style.display = "none");

    adminBtn.textContent = "🔑";

    document.getElementById("admin-disable-popup").style.display = "none";
});

// =========================
// POPUP CRÉATION NEWS
// =========================

document.getElementById("create-news-btn").addEventListener("click", () => {
    document.getElementById("popup-create-news").style.display = "flex";
});

document.getElementById("popup-news-cancel").addEventListener("click", () => {
    document.getElementById("popup-create-news").style.display = "none";
});

document.getElementById("popup-news-publish").addEventListener("click", async () => {
    const text = document.getElementById("popup-news-text").value.trim();
    if (!text) return;

    await window.admin.updateNews(text);

    document.getElementById("popup-create-news").style.display = "none";
    document.getElementById("popup-news-text").value = "";

    loadNews();
});

// =========================
// POPUP CRÉATION PATCHLOG
// =========================

document.getElementById("create-patch-btn").addEventListener("click", () => {
    document.getElementById("popup-create-patch").style.display = "flex";
});

document.getElementById("popup-patch-cancel").addEventListener("click", () => {
    document.getElementById("popup-create-patch").style.display = "none";
});

document.getElementById("popup-patch-publish").addEventListener("click", async () => {
    const text = document.getElementById("popup-patch-text").value.trim();
    if (!text) return;

    await window.admin.updatePatch(text);

    document.getElementById("popup-create-patch").style.display = "none";
    document.getElementById("popup-patch-text").value = "";

    loadPatch();
});

// =========================
// NEWS — AFFICHAGE
// =========================

function renderNewsItem(item) {
    const li = document.createElement("li");

    li.innerHTML = `
        <div class="news-card">
            <h3>${item.title || "Annonce"}</h3>
            <div class="news-content">
                ${item.text ? marked.parse(item.text) : ""}
            </div>

            <span class="news-date">${item.date ? new Date(item.date).toLocaleDateString() : ""}</span>

            <button class="delete-btn" data-id="${item.id}" style="display:${adminMode ? "inline-block" : "none"};">🗑️</button>
        </div>
    `;

    return li;
}

async function loadNews() {
    const res = await fetch("https://raw.githubusercontent.com/Manasei/whocraft-launcher-data/main/news.json");
    const data = await res.json();

    const list = document.getElementById("news-list");
    list.innerHTML = "";

    data.forEach(item => list.appendChild(renderNewsItem(item)));
}

// =========================
// PATCHLOG — AFFICHAGE
// =========================

function renderPatchItem(item) {
    const li = document.createElement("li");

    li.innerHTML = `
        <div class="patch-card">
            <h3>${item.title || "Patch"}</h3>
            <div class="patch-content">
                ${item.text ? marked.parse(item.text) : ""}
            </div>

            <span class="patch-date">${item.date ? new Date(item.date).toLocaleDateString() : ""}</span>

            <button class="delete-btn" data-id="${item.id}" style="display:${adminMode ? "inline-block" : "none"};">🗑️</button>
        </div>
    `;

    return li;
}

async function loadPatch() {
    const res = await fetch("https://raw.githubusercontent.com/Manasei/whocraft-launcher-data/main/patch.json");
    const data = await res.json();

    const list = document.getElementById("patch-list");
    list.innerHTML = "";

    data.forEach(item => list.appendChild(renderPatchItem(item)));
}

// =========================
// SUPPRESSION NEWS / PATCH
// =========================

let deleteTarget = { type: null, id: null };

document.addEventListener("click", (e) => {
    if (e.target.classList.contains("delete-btn")) {
        const parentList = e.target.closest("ul").id;

        deleteTarget.type = parentList === "news-list" ? "news" : "patch";
        deleteTarget.id = e.target.dataset.id;

        document.getElementById("popup-delete").style.display = "flex";
    }
});

document.getElementById("popup-delete-cancel").addEventListener("click", () => {
    document.getElementById("popup-delete").style.display = "none";
});

document.getElementById("popup-delete-confirm").addEventListener("click", async () => {
    if (deleteTarget.type === "news") {
        await window.admin.deleteNews(deleteTarget.id);
        loadNews();
    } else {
        await window.admin.deletePatch(deleteTarget.id);
        loadPatch();
    }

    document.getElementById("popup-delete").style.display = "none";
});

// =========================
// CLOSE BUTTON
// =========================

document.getElementById("close-btn").addEventListener("click", () => {
    window.launcher.closeApp();
});

// =========================
// BOUTON JOUER + LOADER
// =========================

const playBtn = document.getElementById("playBtn");
const loader = document.getElementById("loader");

playBtn.addEventListener("click", () => {
    const pseudo = localStorage.getItem("whocraft_pseudo");
    if (!pseudo) return;

    playBtn.disabled = true;
    playBtn.innerText = "Chargement...";
    loader.style.display = "flex";

    window.launcher.launchMinecraft().then(() => {
        playBtn.disabled = false;
        playBtn.innerText = "JOUER";
        loader.style.display = "none";
    });
});

// =========================
// ⭐ AUTO-UPDATE EVENTS ⭐
// =========================

if (window.updates) {
    window.updates.onUpdateAvailable(() => {
        alert("Une nouvelle version du launcher est disponible ! Téléchargement en cours…");
    });

    window.updates.onUpdateDownloaded(() => {
        if (confirm("Mise à jour téléchargée ! Installer maintenant ?")) {
            window.updates.install();
        }
    });
}
