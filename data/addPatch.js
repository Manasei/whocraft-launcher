// server/addPatch.js

const { addPatch } = require("./live-server");

// On récupère tout ce qui est passé après "node addPatch.js ..."
const changelog = process.argv.slice(2).join(" ");

if (!changelog) {
    console.log("Merci de fournir un changelog, par exemple :");
    console.log('node addPatch.js "Correction de bugs et amélioration des performances"');
    process.exit(1);
}

// On laisse live-server.js créer l'objet avec { date, changelog }
addPatch(changelog);

console.log("Patch ajouté avec succès :", changelog);
