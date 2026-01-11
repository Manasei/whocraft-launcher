// =========================
// VARIABLES GLOBALES
// =========================
let adminMode = false;

// =========================
// ELEMENTS DOM
// =========================
const loginScreen = document.getElementById("login-screen");
const loginBtn = document.getElementById("login-btn");
const pseudoInput = document.getElementById("pseudo-input");

const sections = {
    news: document.getElementById("news-section"),
    patch: document.getElementById("patch-section"),
    admin: document.getElementById("admin-section"),
    play: document.getElementById("play-section"),
    playInfo: document.getElementById("play-info-section"),
};

const playBtn = document.getElementById("playBtn");
const serverStatusSection = document.getElementById("server-status-section");

const btnNews = document.getElementById("btn-news");
const btnPatch = document.getElementById("btn-patch");
const btnPlay = document.getElementById("btn-play");
const adminBtn = document.getElementById("btn-admin");
const closeBtn = document.getElementById("close-btn");

// Admin buttons
const createNewsBtn = document.getElementById("create-news-btn");
const createPatchBtn = document.getElementById("create-patch-btn");

// Loader
const loader = document.getElementById("loader");

// =========================
// UTILS
// =========================
function hideAllSections() {
    for (const key in sections) {
        if (sections[key]) {
            sections[key].classList.remove("active-section");
            sections[key].style.display = "none";
        }
    }

    if (playBtn) playBtn.style.display = "none";
    if (sections.playInfo) sections.playInfo.style.display = "none";
    if (serverStatusSection) serverStatusSection.style.display = "none";
}

function showNews() {
    hideAllSections();
    if (sections.news) {
        sections.news.style.display = "block";
        requestAnimationFrame(() => {
            sections.news.classList.add("active-section");
        });
    }
}

function showPatch() {
    hideAllSections();
    if (sections.patch) {
        sections.patch.style.display = "block";
        requestAnimationFrame(() => {
            sections.patch.classList.add("active-section");
        });
    }
}

function showAdmin() {
    hideAllSections();
    if (sections.admin) {
        sections.admin.style.display = "block";
        requestAnimationFrame(() => {
            sections.admin.classList.add("active-section");
        });
    }
}

function showPlay() {
    hideAllSections();

    if (sections.play) {
    sections.play.style.display = "block";
    sections.play.classList.remove("active-section");

    setTimeout(() => {
        sections.play.classList.add("active-section");
    }, 10);
}


    if (sections.playInfo) sections.playInfo.style.display = "block";
    if (playBtn) playBtn.style.display = "inline-block";
    if (serverStatusSection) serverStatusSection.style.display = "block";
}


// =========================
// LOGIN / AUTO-LOGIN
// =========================
function checkAdminAccess(pseudo) {
    if (pseudo === "LeDocteur_10" && adminBtn) {
        adminBtn.style.display = "block";
    } else if (adminBtn) {
        adminBtn.style.display = "none";
    }
}

if (loginBtn) {
    loginBtn.addEventListener("click", () => {
        const pseudo = pseudoInput.value.trim();
        if (pseudo.length < 3) return;

        localStorage.setItem("whocraft_pseudo", pseudo);
        if (window.launcher?.setPseudo) window.launcher.setPseudo(pseudo);
        if (loginScreen) loginScreen.style.display = "none";

        const playerName = document.getElementById("player-name");
        const playerSkin = document.getElementById("player-skin");
        if (playerName) playerName.textContent = pseudo;
        if (playerSkin) playerSkin.src = `https://mc-heads.net/avatar/${pseudo}`;

        checkAdminAccess(pseudo);
    });
}

window.addEventListener("load", () => {
    const saved = localStorage.getItem("whocraft_pseudo");
    if (saved) {
        if (loginScreen) loginScreen.style.display = "none";

        const playerName = document.getElementById("player-name");
        const playerSkin = document.getElementById("player-skin");
        if (playerName) playerName.textContent = saved;
        if (playerSkin) playerSkin.src = `https://mc-heads.net/avatar/${saved}`;

        checkAdminAccess(saved);
        if (window.launcher?.setPseudo) window.launcher.setPseudo(saved);
    }

    loadNews();
    loadPatch();
    showPlay();
});

// =========================
// LOGOUT
// =========================
const playerInfo = document.getElementById("player-info");
if (playerInfo) {
    playerInfo.addEventListener("click", () => {
        localStorage.removeItem("whocraft_pseudo");
        location.reload();
    });
}

// =========================
// NAVIGATION
// =========================
if (btnNews) btnNews.addEventListener("click", showNews);
if (btnPatch) btnPatch.addEventListener("click", showPatch);
if (btnPlay) btnPlay.addEventListener("click", showPlay);
if (adminBtn) {
    adminBtn.addEventListener("click", () => {
        if (!adminMode) {
            const popup = document.getElementById("admin-popup");
            if (popup) popup.style.display = "flex";
        } else {
            const popup = document.getElementById("admin-disable-popup");
            if (popup) popup.style.display = "flex";
        }
    });
}

// =========================
// CLOSE BUTTON
// =========================
if (closeBtn) {
    closeBtn.addEventListener("click", () => {
        window.launcher?.closeApp?.();
    });
}

// =========================
// ADMIN POPUPS
// =========================
const adminPopupValidate = document.getElementById("admin-popup-validate");
if (adminPopupValidate) {
    adminPopupValidate.addEventListener("click", async () => {
        const password = document.getElementById("admin-popup-password").value.trim();
        const pseudo = localStorage.getItem("whocraft_pseudo");
        const error = document.getElementById("admin-popup-error");

        if (!pseudo) {
            if (error) error.textContent = "Vous devez être connecté.";
            return;
        }

        const result = await window.launcher?.checkAdmin?.(password);
        if (!result?.ok) {
            if (error) error.textContent = "Mot de passe incorrect.";
            return;
        }

        adminMode = true;
        document.querySelectorAll(".admin-create-btn").forEach(btn => btn.style.display = "block");
        if (adminBtn) adminBtn.textContent = "🔓";

        const popup = document.getElementById("admin-popup");
        if (popup) popup.style.display = "none";

        loadNews();
        loadPatch();
    });
}

document.getElementById("admin-popup-cancel")?.addEventListener("click", () => {
    document.getElementById("admin-popup").style.display = "none";
});

document.getElementById("admin-disable-cancel")?.addEventListener("click", () => {
    document.getElementById("admin-disable-popup").style.display = "none";
});

document.getElementById("admin-disable-confirm")?.addEventListener("click", () => {
    adminMode = false;
    document.querySelectorAll(".admin-create-btn").forEach(btn => btn.style.display = "none");
    document.querySelectorAll(".delete-btn").forEach(btn => btn.style.display = "none");
    if (adminBtn) adminBtn.textContent = "🔑";
    document.getElementById("admin-disable-popup").style.display = "none";
});

// =========================
// NEWS & PATCH
// =========================
function renderNewsItem(item) {
    const li = document.createElement("li");
    li.innerHTML = `
        <div class="news-card">
            <h3>${item.title || "Annonce"}</h3>
            <div class="news-content">${typeof marked !== "undefined" && item.text ? marked.parse(item.text) : (item.text || "")}</div>
            <span class="news-date">${item.date ? new Date(item.date).toLocaleDateString() : ""}</span>
            <button class="delete-btn" data-id="${item.id}" style="display:${adminMode ? "inline-block" : "none"};">🗑️</button>
        </div>
    `;
    return li;
}

function renderPatchItem(item) {
    const li = document.createElement("li");
    li.innerHTML = `
        <div class="patch-card">
            <h3>${item.title || "Patch"}</h3>
            <div class="patch-content">${typeof marked !== "undefined" && item.text ? marked.parse(item.text) : (item.text || "")}</div>
            <span class="patch-date">${item.date ? new Date(item.date).toLocaleDateString() : ""}</span>
            <button class="delete-btn" data-id="${item.id}" style="display:${adminMode ? "inline-block" : "none"};">🗑️</button>
        </div>
    `;
    return li;
}

async function loadNews() {
    try {
        const res = await fetch("https://raw.githubusercontent.com/Manasei/whocraft-launcher-data/main/news.json?v=" + Date.now());
        const data = await res.json();
        const list = document.getElementById("news-list");
        if (!list) return;
        list.innerHTML = "";
        data.forEach(item => list.appendChild(renderNewsItem(item)));
    } catch (err) { console.error(err); }
}

async function loadPatch() {
    try {
        const res = await fetch("https://raw.githubusercontent.com/Manasei/whocraft-launcher-data/main/patch.json?v=" + Date.now());
        const data = await res.json();
        const list = document.getElementById("patch-list");
        if (!list) return;
        list.innerHTML = "";
        data.forEach(item => list.appendChild(renderPatchItem(item)));
    } catch (err) { console.error(err); }
}

// =========================
// DELETE NEWS / PATCH
// =========================
let deleteTarget = { type: null, id: null };
document.addEventListener("click", (e) => {
    if (e.target.classList.contains("delete-btn")) {
        const parentList = e.target.closest("ul")?.id;
        deleteTarget.type = parentList === "news-list" ? "news" : "patch";
        deleteTarget.id = e.target.dataset.id;
        const popup = document.getElementById("popup-delete");
        if (popup) popup.style.display = "flex";
    }
});

document.getElementById("popup-delete-cancel")?.addEventListener("click", () => {
    document.getElementById("popup-delete").style.display = "none";
});

document.getElementById("popup-delete-confirm")?.addEventListener("click", async () => {
    if (!deleteTarget.id) return;
    if (deleteTarget.type === "news") await window.admin?.deleteNews(deleteTarget.id);
    else await window.admin?.deletePatch(deleteTarget.id);

    loadNews();
    loadPatch();
    document.getElementById("popup-delete").style.display = "none";
});

// =========================
// CREATE NEWS / PATCH
// =========================
if (createNewsBtn) {
    createNewsBtn.addEventListener("click", () => {
        const popup = document.getElementById("popup-create-news");
        if (!popup) return;
        popup.style.display = "flex";
    });
}

document.getElementById("popup-news-cancel")?.addEventListener("click", () => {
    document.getElementById("popup-create-news").style.display = "none";
});

document.getElementById("popup-news-publish")?.addEventListener("click", async () => {
    const text = document.getElementById("popup-news-text").value.trim();
    if (!text) return;

    await window.admin.updateNews(text);
    document.getElementById("popup-create-news").style.display = "none";
    document.getElementById("popup-news-text").value = "";
    loadNews();
});

if (createPatchBtn) {
    createPatchBtn.addEventListener("click", () => {
        const popup = document.getElementById("popup-create-patch");
        if (!popup) return;
        popup.style.display = "flex";
    });
}

document.getElementById("popup-patch-cancel")?.addEventListener("click", () => {
    document.getElementById("popup-create-patch").style.display = "none";
});

document.getElementById("popup-patch-publish")?.addEventListener("click", async () => {
    const text = document.getElementById("popup-patch-text").value.trim();
    if (!text) return;

    await window.admin.updatePatch(text);
    document.getElementById("popup-create-patch").style.display = "none";
    document.getElementById("popup-patch-text").value = "";
    loadPatch();
});

// =========================
// LANCER MINECRAFT
// =========================
if (playBtn) {
    playBtn.addEventListener("click", () => {
        const pseudo = localStorage.getItem("whocraft_pseudo");
        if (!pseudo) return;

        playBtn.disabled = true;
        playBtn.innerText = "Chargement...";
        if (loader) loader.style.display = "flex";

        window.launcher.launchMinecraft().then(() => {
            playBtn.disabled = false;
            playBtn.innerText = "JOUER";
            if (loader) loader.style.display = "none";
        });
    });
}

// =========================
// AUTO-UPDATE
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

// =========================
// SCROLL PLAY SECTION
// =========================
if (sections.play) {
    sections.play.style.overflowY = "auto";
    sections.play.style.maxHeight = "70vh";
}
