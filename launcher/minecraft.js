const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

module.exports.start = () => {
    const pseudo = global.currentPseudo || "Player";
    const gameDir = path.join(__dirname, "../launcher-data/minecraft");
    const javaPath = path.join(__dirname, "../launcher-data/runtime/java/bin/java.exe");
    const version = "1.21.8";

    const args = [
        "-Xmx2G",
        "-Xms1G",
        "-Djava.library.path=" + path.join(gameDir, "natives"),
        "-cp",
        [
            path.join(gameDir, "versions", version, version + ".jar"),
            ...collectLibraries(path.join(gameDir, "libraries"))
        ].join(";"),

        "net.minecraft.client.main.Main",

        "--username", pseudo,
        "--version", version,
        "--gameDir", gameDir,
        "--assetsDir", path.join(gameDir, "assets"),
        "--assetIndex", "1",
        "--uuid", generateOfflineUUID(pseudo),
        "--accessToken", "0",

        "--server", "51.254.140.174",
        "--port", "25565"
    ];

    const mc = spawn(javaPath, args, { cwd: gameDir });

    mc.stdout.on("data", data => console.log("[MC]", data.toString()));
    mc.stderr.on("data", data => console.log("[MC-ERR]", data.toString()));
    mc.on("close", code => console.log("Minecraft fermé :", code));
};

function collectLibraries(dir) {
    let libs = [];
    function scan(folder) {
        fs.readdirSync(folder).forEach(f => {
            const p = path.join(folder, f);
            if (fs.statSync(p).isDirectory()) scan(p);
            else if (p.endsWith(".jar")) libs.push(p);
        });
    }
    scan(dir);
    return libs;
}

function generateOfflineUUID(name) {
    const crypto = require("crypto");
    const hash = crypto.createHash("md5").update("OfflinePlayer:" + name).digest("hex");
    return hash.replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, "$1-$2-$3-$4-$5");
}
