console.log("app.js chargé !");

import { afficherDashboard } from "./dashboard.js";
import { afficherSpecialistes } from "./specialistes.js";
import { showMessage, clearMessage, showConfirmation } from "./ui.js";
import { DATA, loadLocalData, saveData, setData, STORAGE_KEY, requestPersistentStorage, validateDataStructure } from "./data.js";

// --- Thème clair par défaut + gestion du sélecteur ---
const themeButtons = Array.from(document.querySelectorAll(".theme-option"));
const savedTheme = localStorage.getItem("theme");
const currentTheme = savedTheme || "system";

function applyTheme(theme) {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const shouldUseDark = theme === "dark" || (theme === "system" && prefersDark);
  document.body.classList.toggle("dark", shouldUseDark);
}

function updateThemeSelector(theme) {
  themeButtons.forEach(button => {
    button.classList.toggle("active", button.dataset.theme === theme);
  });
}

function handleThemeChange(theme) {
  localStorage.setItem("theme", theme);
  updateThemeSelector(theme);
  applyTheme(theme);
}

function handleSystemThemeChange(event) {
  const stored = localStorage.getItem("theme");
  if (stored && stored !== "system") return;
  applyTheme("system");
}

updateThemeSelector(currentTheme);
applyTheme(currentTheme);

const systemMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
if (typeof systemMediaQuery.addEventListener === "function") {
  systemMediaQuery.addEventListener("change", handleSystemThemeChange);
} else if (typeof systemMediaQuery.addListener === "function") {
  systemMediaQuery.addListener(handleSystemThemeChange);
}

themeButtons.forEach(button => {
  button.addEventListener("click", () => handleThemeChange(button.dataset.theme));
});


const storageInfo = document.getElementById("storageInfo");

async function initialiserStockagePersistant() {
  if (!storageInfo) return;

  storageInfo.textContent = "Vos données sont stockées localement dans ce navigateur.";

  const persisted = await requestPersistentStorage();
  if (persisted) {
    storageInfo.textContent = "Stockage local durable activé. Exportez vos données uniquement pour une sauvegarde externe.";
  } else {
    storageInfo.textContent = "Stockage local standard activé. Pensez à exporter vos données avant de fermer le navigateur.";
  }
}

initialiserStockagePersistant();

// --- Onglets Dashboard / RDV ---
export function showDashboard() {
  document.getElementById("dashboard").classList.remove("collapsed");
  document.getElementById("rdv").classList.add("collapsed");

  document.querySelector("#rightTabs button:nth-child(1)").classList.add("active");
  document.querySelector("#rightTabs button:nth-child(2)").classList.remove("active");
}
window.showDashboard = showDashboard;

function renderRdvEmptyState() {
  const container = document.getElementById("rdv");
  container.innerHTML = `
    <div class="card">
      <h3>Détails / Saisie</h3>
      <p>Choisissez un spécialiste à gauche ou ajoutez-en un pour afficher sa fiche et gérer ses rendez-vous.</p>
      <div class="button-group">
        <button class="secondary" onclick="showDashboard()">Retour au dashboard</button>
      </div>
    </div>
  `;
}

export function showRdv() {
  document.getElementById("dashboard").classList.add("collapsed");
  document.getElementById("rdv").classList.remove("collapsed");

  document.querySelector("#rightTabs button:nth-child(1)").classList.remove("active");
  document.querySelector("#rightTabs button:nth-child(2)").classList.add("active");

  const rdvContainer = document.getElementById("rdv");
  if (!rdvContainer.innerHTML.trim()) {
    renderRdvEmptyState();
  }
}
window.showRdv = showRdv;

// --- Export des données ---
export function exporterDonnees() {
  const data = JSON.stringify(DATA, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "mediplan-data.json";
  a.click();

  URL.revokeObjectURL(url);
}
window.exporterDonnees = exporterDonnees;

// --- Import des données ---
export function importerDonnees(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      const validated = validateDataStructure(data);
      if (!validated) {
        throw new Error("Format JSON invalide");
      }

      setData(validated);
      saveData();

      afficherDashboard();
      afficherSpecialistes(DATA.specialistes);
      showDashboard();

      showMessage("Import réussi !", "success");
    } catch (e) {
      showMessage("Erreur : fichier JSON invalide.", "error");
    }
  };

  reader.readAsText(file);
}
window.importerDonnees = importerDonnees;

// --- Chargement des données ---
async function chargerDonnees() {
  let dataOriginale = null;

  try {
    const r = await fetch("data.json");
    dataOriginale = await r.json();
  } catch (e) {
    showMessage("Erreur : impossible de charger data.json.", "error");
    setData({ specialistes: [] });
    return;
  }

  const dataLocale = loadLocalData();

  if (!dataLocale) {
    setData(dataOriginale);
  } else {
    setData(dataLocale);
  }

  saveData();

  afficherDashboard();
  afficherSpecialistes(DATA.specialistes);
  showDashboard();
}

export async function resetDonnees() {
  const confirmed = await showConfirmation({
    title: "Réinitialiser les données",
    message: "⚠️ Voulez-vous vraiment réinitialiser toutes les données ? Cette action est irréversible.",
    confirmText: "Réinitialiser",
    cancelText: "Annuler"
  });

  if (!confirmed) {
    return;
  }

  localStorage.removeItem(STORAGE_KEY);
  showMessage("Les données ont été réinitialisées. L'application va recharger les données de data.json.", "success");
  location.reload();
}

window.resetDonnees = resetDonnees;

chargerDonnees();
