import { afficherDashboard } from "./dashboard.js";
import { afficherRdv } from "./rdv.js";
import { escapeHtml } from "./utils.js";
import { parseIsoLocal } from "./dates.js";
import { DATA, saveData, getSpecialiste, hasFutureRdv } from "./data.js";
import { showMessage, showConfirmation } from "./ui.js";

// --- Affichage de la liste des spécialistes ---
export function afficherSpecialistes(list, query = "") {
  const container = document.getElementById("specialistes");
  container.innerHTML = "<h2>Spécialistes</h2>";

  container.innerHTML += `
    <div class="search-row">
      <input id="specialisteSearch" type="search" placeholder="Rechercher un spécialiste..." value="${escapeHtml(query)}" />
      <div class="search-buttons">
        <button type="button" onclick="rechercherSpecialistes()">Rechercher</button>
        <button type="button" class="secondary" onclick="clearSearch()">Effacer</button>
      </div>
    </div>
    <button onclick="afficherFormulaireSpecialiste()">Ajouter un spécialiste</button>
  `;

  const searchInput = document.getElementById("specialisteSearch");
  if (searchInput) {
    searchInput.addEventListener("keydown", event => {
      if (event.key === "Enter") {
        event.preventDefault();
        rechercherSpecialistes();
      }
    });
  }

  list.forEach(sp => {
    const div = document.createElement("div");
    div.className = "card specialiste-card";

    const nomComplet = `${sp.prenom} ${sp.nom}`.trim();

    div.innerHTML = `
      <div class="specialiste-meta">
        <div>
          <h3>${escapeHtml(sp.specialite)}</h3>
          <p>${escapeHtml(nomComplet) || "—"}</p>
        </div>
        <div>
          <p><strong>Fréquence :</strong> tous les ${escapeHtml(sp.frequence_mois)} mois</p>
          <p><strong>Téléphone :</strong> ${escapeHtml(sp.telephone) || "—"}</p>
          <p><strong>Adresse :</strong> ${escapeHtml(sp.adresse) || "—"}</p>
        </div>
      </div>
      <div class="button-group">
        <button onclick="afficherRdv('${escapeHtml(sp.id)}')">Voir</button>
        <button class="secondary" onclick="afficherFormulaireSpecialiste('${escapeHtml(sp.id)}')">Modifier</button>
        <button class="danger" onclick="supprimerSpecialiste('${escapeHtml(sp.id)}')">Supprimer</button>
      </div>
    `;

    container.appendChild(div);
  });
}

window.afficherSpecialistes = afficherSpecialistes;

// --- Formulaire d'ajout / édition ---
export function afficherFormulaireSpecialiste(id) {
  const container = document.getElementById("rdv");
  const sp = id ? getSpecialiste(id) : null;
  const isEdition = !!sp;

  container.innerHTML = `
    <div class="card">
      <h3>${isEdition ? "Modifier un spécialiste" : "Ajouter un spécialiste"}</h3>

      <p>Spécialité :</p>
      <input id="spSpecialite" type="text" placeholder="Dentiste, Cardiologue..." value="${escapeHtml(sp?.specialite || "")}" />

      <p>Prénom :</p>
      <input id="spPrenom" type="text" placeholder="Jean" value="${escapeHtml(sp?.prenom || "")}" />

      <p>Nom :</p>
      <input id="spNom" type="text" placeholder="Dupont" value="${escapeHtml(sp?.nom || "")}" />

      <p>Fréquence (mois) :</p>
      <input id="spFreq" type="number" value="${escapeHtml(sp?.frequence_mois || "")}" />

      <p>Numéro de téléphone :</p>
      <input id="spTel" type="text" placeholder="06 12 34 56 78" value="${escapeHtml(sp?.telephone || "")}" />

      <p>Adresse postale :</p>
      <input id="spAdr" type="text" placeholder="12 rue Exemple, 44000 Nantes" value="${escapeHtml(sp?.adresse || "")}" />

      <div class="button-group">
        <button onclick="${isEdition ? `editerSpecialiste('${escapeHtml(sp.id)}')` : 'ajouterSpecialiste()'}">${isEdition ? 'Enregistrer' : 'Ajouter'}</button>
        <button class="secondary" onclick="cancelSpecialiste()">Annuler</button>
      </div>
    </div>
  `;

  showRdv();
}

window.afficherFormulaireSpecialiste = afficherFormulaireSpecialiste;

// --- Ajout d'un spécialiste ---
export function ajouterSpecialiste() {
  const specialite = document.getElementById("spSpecialite").value.trim();
  const prenom = document.getElementById("spPrenom").value.trim();
  const nom = document.getElementById("spNom").value.trim();
  const freq = parseInt(document.getElementById("spFreq").value, 10);
  const tel = document.getElementById("spTel").value.trim();
  const adr = document.getElementById("spAdr").value.trim();

  if (!specialite) return showMessage("Spécialité obligatoire.", "error");
  if (!nom) return showMessage("Nom obligatoire.", "error");
  if (!Number.isFinite(freq) || freq <= 0) return showMessage("Fréquence invalide.", "error");

  // UUID v4
  const id = crypto.randomUUID();

  DATA.specialistes.push({
    id,
    specialite,
    prenom,
    nom,
    frequence_mois: freq,
    telephone: tel || null,
    adresse: adr || null,
    rdv: [],
    rdv_dependances: []
  });

  saveData();

  afficherDashboard();
  afficherSpecialistes(DATA.specialistes);
  document.getElementById("rdv").innerHTML = "";
}

window.ajouterSpecialiste = ajouterSpecialiste;

export function cancelSpecialiste() {
  document.getElementById("rdv").innerHTML = "";
  showDashboard();
}

window.cancelSpecialiste = cancelSpecialiste;

// --- Modifier un spécialiste ---
export function editerSpecialiste(id) {
  const sp = getSpecialiste(id);
  if (!sp) return showMessage("Spécialiste introuvable.", "error");

  const specialite = document.getElementById("spSpecialite").value.trim();
  const prenom = document.getElementById("spPrenom").value.trim();
  const nom = document.getElementById("spNom").value.trim();
  const freq = parseInt(document.getElementById("spFreq").value, 10);
  const tel = document.getElementById("spTel").value.trim();
  const adr = document.getElementById("spAdr").value.trim();

  if (!specialite) return showMessage("Spécialité obligatoire.", "error");
  if (!nom) return showMessage("Nom obligatoire.", "error");
  if (!Number.isFinite(freq) || freq <= 0) return showMessage("Fréquence invalide.", "error");

  sp.specialite = specialite;
  sp.prenom = prenom;
  sp.nom = nom;
  sp.frequence_mois = freq;
  sp.telephone = tel || null;
  sp.adresse = adr || null;

  saveData();

  afficherDashboard();
  afficherSpecialistes(DATA.specialistes);
  afficherRdv(id);
}

window.editerSpecialiste = editerSpecialiste;

// --- Supprimer un spécialiste ---
export async function supprimerSpecialiste(id) {
  const sp = getSpecialiste(id);
  if (!sp) return showMessage("Spécialiste introuvable.", "error");

  if (hasFutureRdv(sp)) {
    return showMessage("Impossible de supprimer ce spécialiste : des rendez-vous futurs sont encore en attente.", "error");
  }

  const confirmed = await showConfirmation({
    title: "Supprimer le spécialiste",
    message: "Supprimer ce spécialiste ? Cette action est irréversible.",
    confirmText: "Supprimer",
    cancelText: "Annuler"
  });

  if (!confirmed) return;

  DATA.specialistes = DATA.specialistes.filter(s => s.id !== id);

  saveData();

  showMessage("Spécialiste supprimé.", "success");
  afficherDashboard();
  afficherSpecialistes(DATA.specialistes);
  document.getElementById("rdv").innerHTML = "";
}

export function filterSpecialistes(event) {
  const query = event.target.value.trim().toLowerCase();
  const filtered = DATA.specialistes.filter(sp => {
    const terms = [sp.specialite, sp.prenom, sp.nom, sp.telephone, sp.adresse]
      .filter(Boolean)
      .map(value => value.toLowerCase())
      .join(" ");
    return terms.includes(query);
  });

  afficherSpecialistes(filtered, query);
}

export function rechercherSpecialistes() {
  const input = document.getElementById("specialisteSearch");
  if (!input) return;
  filterSpecialistes({ target: input });
}

export function clearSearch() {
  const input = document.getElementById("specialisteSearch");
  if (!input) return;
  input.value = "";
  afficherSpecialistes(DATA.specialistes, "");
}

window.supprimerSpecialiste = supprimerSpecialiste;
window.filterSpecialistes = filterSpecialistes;
window.rechercherSpecialistes = rechercherSpecialistes;
window.clearSearch = clearSearch;
