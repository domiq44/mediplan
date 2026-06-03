import { calculerProchainRdv, calculerRdvDependance, validerDateISO, comparerDates, formatIsoLocalDisplay, parseIsoLocal } from "./dates.js";
import { afficherDashboard } from "./dashboard.js";
import { escapeHtml } from "./utils.js";
import { saveData, getSpecialiste } from "./data.js";
import { showMessage, showConfirmation } from "./ui.js";

function getDependanceStatus(dateStr) {
  const date = parseIsoLocal(dateStr);
  if (!date || isNaN(date.getTime())) {
    return { label: "Date inconnue", className: "" };
  }

  return date.getTime() <= Date.now()
    ? { label: "réalisé", className: "completed" }
    : { label: "à venir", className: "upcoming" };
}

// --- Affiche la fiche RDV d'un spécialiste ---
export function afficherRdv(id) {
  const sp = getSpecialiste(id);
  if (!sp) return showMessage("Spécialiste introuvable.", "error");

  const container = document.getElementById("rdv");
  showRdv();

  const nomComplet = `${sp.prenom} ${sp.nom}`.trim();
  const prochain = calculerProchainRdv(sp);
  const deps = Array.isArray(sp.rdv_dependances) ? sp.rdv_dependances : [];

  let html = `
    <div class="card rdv-overview">
      <div class="section-title">
        <div>
          <h3>${escapeHtml(sp.specialite)}</h3>
          <p>${escapeHtml(nomComplet) || "—"}</p>
        </div>
        <div class="rdv-summary">
          <div class="summary-item">
            <span>Prochain RDV</span>
            <strong>${escapeHtml(formatIsoLocalDisplay(prochain))}</strong>
          </div>
          <div class="summary-item">
            <span>Dépendances</span>
            <strong>${deps.length}</strong>
          </div>
        </div>
      </div>

      <div class="contact-grid">
        <div><strong>Téléphone</strong><br>${escapeHtml(sp.telephone) || "—"}</div>
        <div><strong>Adresse</strong><br>${escapeHtml(sp.adresse) || "—"}</div>
      </div>
    </div>

    <div class="card rdv-action">
      <h4>Ajouter un RDV</h4>
      <input id="newRdv" type="datetime-local" aria-label="Nouvelle date de RDV">
      <div class="button-group">
        <button onclick="ajouterRdv('${escapeHtml(sp.id)}')">Ajouter</button>
        <button class="secondary" onclick="cancelRdv()">Annuler</button>
      </div>
    </div>

    <div class="card rdv-history-card">
      <h4>Historique des RDV</h4>
  `;

  if (sp.rdv.length === 0) {
    html += `<p class="empty-note">Aucun RDV enregistré. Utilisez le formulaire ci-dessus pour créer le premier rendez-vous.</p>`;
  } else {
    html += `<div class="rdv-history">`;
    sp.rdv.forEach((d, index) => {
      const depsForRdv = deps.filter(dep => dep.rdv_date === d);
      html += `
        <article class="rdv-card">
          <div class="rdv-card-header">
            <div>
              <div class="rdv-date">${escapeHtml(formatIsoLocalDisplay(d))}</div>
              <div class="rdv-label">${depsForRdv.length} dépendance${depsForRdv.length > 1 ? "s" : ""}</div>
            </div>
            <button class="danger small" onclick="supprimerRdv('${escapeHtml(sp.id)}', ${index})">Supprimer</button>
          </div>

          ${depsForRdv.length > 0 ? `<div class="dependency-list">` : `<p class="empty-note">Aucune dépendance liée à ce RDV.</p>`}
      `;

      depsForRdv.forEach((dep) => {
        const dateDep = calculerRdvDependance(d, dep.delai_jours);
        const status = getDependanceStatus(dateDep);
        html += `
          <div class="dependency-item">
            <div class="dependency-item-header">
              <div>
                <strong>${escapeHtml(dep.type)}</strong>
                <span class="dependency-meta">${escapeHtml(dep.delai_jours)} jours avant</span>
              </div>
              <span class="status-badge ${status.className}">${escapeHtml(status.label)}</span>
            </div>
            <div class="dependency-item-body">
              <span>Date prévue :</span>
              <strong>${escapeHtml(formatIsoLocalDisplay(dateDep))}</strong>
            </div>
            <button class="danger small" onclick="supprimerDependance('${escapeHtml(sp.id)}', ${sp.rdv_dependances.indexOf(dep)})">Supprimer</button>
          </div>
        `;
      });

      if (depsForRdv.length > 0) {
        html += `</div>`;
      }

      html += `</article>`;
    });
    html += `</div>`;
  }

  html += `
      <div class="dependency-form card">
        <h4>Ajouter une dépendance</h4>
        <p>Associez cette dépendance à un rendez-vous spécifique.</p>
  `;

  if (sp.rdv.length === 0) {
    html += `<p>Ajoutez d'abord un rendez-vous pour pouvoir lier une dépendance.</p>`;
  } else {
    html += `
        <label for="depRdvSelect">RDV lié</label>
        <select id="depRdvSelect">
    `;
    sp.rdv.forEach(d => {
      html += `<option value="${escapeHtml(d)}">${escapeHtml(formatIsoLocalDisplay(d))}</option>`;
    });
    html += `</select>
        <input id="depType" type="text" placeholder="Ex : Prise de sang">
        <input id="depDelai" type="number" placeholder="Jours avant le RDV" min="0">
        <div class="button-group">
          <button onclick="ajouterDependance('${escapeHtml(sp.id)}')">Ajouter</button>
          <button class="secondary" onclick="cancelRdv()">Annuler</button>
        </div>
    `;
  }

  html += `
      </div>
    </div>
  `;

  container.innerHTML = html;

  if (window.innerWidth <= 720) {
    container.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

window.afficherRdv = afficherRdv;

// --- Ajouter un RDV ---
export function ajouterRdv(id) {
  const sp = getSpecialiste(id);
  if (!sp) return;

  const date = document.getElementById("newRdv").value;

  if (!validerDateISO(date)) {
    return showMessage("Date invalide.", "error");
  }

  sp.rdv.push(date);
  sp.rdv.sort(comparerDates);

  saveData();

  afficherDashboard();
  afficherRdv(id);
}

window.ajouterRdv = ajouterRdv;

export function cancelRdv() {
  document.getElementById("rdv").innerHTML = "";
  showDashboard();
}

window.cancelRdv = cancelRdv;

// --- Supprimer un RDV ---
export async function supprimerRdv(id, index) {
  const sp = getSpecialiste(id);
  if (!sp) return showMessage("Spécialiste introuvable.", "error");

  const confirmed = await showConfirmation({
    title: "Supprimer le RDV",
    message: "Supprimer ce RDV ?",
    confirmText: "Supprimer",
    cancelText: "Annuler"
  });

  if (!confirmed) return;

  sp.rdv.splice(index, 1);

  saveData();
  showMessage("RDV supprimé.", "success");

  afficherDashboard();
  afficherRdv(id);
}

window.supprimerRdv = supprimerRdv;

export async function supprimerDependance(id, index) {
  const sp = getSpecialiste(id);
  if (!sp) return showMessage("Spécialiste introuvable.", "error");

  const confirmed = await showConfirmation({
    title: "Supprimer la dépendance",
    message: "Supprimer cette dépendance ?",
    confirmText: "Supprimer",
    cancelText: "Annuler"
  });

  if (!confirmed) return;

  sp.rdv_dependances.splice(index, 1);
  saveData();
  showMessage("Dépendance supprimée.", "success");
  afficherRdv(id);
}

window.supprimerDependance = supprimerDependance;

// --- Ajouter une dépendance ---
export function ajouterDependance(id) {
  const sp = getSpecialiste(id);
  if (!sp) return;

  const type = document.getElementById("depType").value.trim();
  const delai = parseInt(document.getElementById("depDelai").value, 10);
  const rdvDate = document.getElementById("depRdvSelect")?.value;

  if (!type) return showMessage("Type obligatoire.", "error");
  if (!Number.isFinite(delai) || delai < 0) return showMessage("Délai invalide.", "error");
  if (!rdvDate) return showMessage("Sélectionnez un rendez-vous.", "error");

  sp.rdv_dependances.push({
    type,
    delai_jours: delai,
    rdv_date: rdvDate
  });

  saveData();

  afficherRdv(id);
}

window.ajouterDependance = ajouterDependance;
