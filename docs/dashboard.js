import { calculerProchainRdv, comparerDates, estDateISO, formatIsoLocalDisplay, parseIsoLocal } from "./dates.js";
import { escapeHtml } from "./utils.js";
import { DATA } from "./data.js";

// --- Affiche le tableau de bord ---
export function afficherDashboard() {
  const container = document.getElementById("dashboard");

  if (!DATA || !DATA.specialistes) {
    container.innerHTML = "<p>Chargement...</p>";
    return;
  }

  const maintenant = new Date();
  const specialistes = DATA.specialistes || [];
  const totalSpecialistes = specialistes.length;
  const totalDependencies = specialistes.reduce(
    (acc, sp) => acc + (Array.isArray(sp.rdv_dependances) ? sp.rdv_dependances.length : 0),
    0
  );

  const rdvItems = specialistes.flatMap(sp => {
    return (Array.isArray(sp.rdv) ? sp.rdv : []).map(date => ({
      id: sp.id,
      specialite: sp.specialite,
      nom: `${sp.prenom} ${sp.nom}`.trim() || "—",
      date,
      telephone: sp.telephone || "—",
      adresse: sp.adresse || "—"
    }));
  });

  rdvItems.sort((a, b) => comparerDates(a.date, b.date));

  const prochainsRdvs = rdvItems.filter(item => {
    const date = parseIsoLocal(item.date);
    return date && date.getTime() >= maintenant.getTime();
  });

  const nextRdv = prochainsRdvs[0] || null;
  const upcomingCount = prochainsRdvs.length;

  const listeSpecialistes = specialistes.map(sp => {
    const prochain = calculerProchainRdv(sp);
    return {
      id: sp.id,
      specialite: sp.specialite,
      nom: `${sp.prenom} ${sp.nom}`.trim() || "—",
      prochain,
      prochainAffiche: formatIsoLocalDisplay(prochain),
      dateTri: estDateISO(prochain) ? prochain : "9999-99-99T23:59"
    };
  });

  listeSpecialistes.sort((a, b) => comparerDates(a.dateTri, b.dateTri));

  let html = `
    <div class="dashboard-grid">
      <div class="metric-card">
        <h4>Spécialistes</h4>
        <p>${totalSpecialistes}</p>
      </div>
      <div class="metric-card">
        <h4>RDV à venir</h4>
        <p>${upcomingCount}</p>
      </div>
      <div class="metric-card">
        <h4>Dépendances</h4>
        <p>${totalDependencies}</p>
      </div>
      <div class="metric-card">
        <h4>Prochain RDV</h4>
        <p>${nextRdv ? escapeHtml(formatIsoLocalDisplay(nextRdv.date)) : "Aucun"}</p>
      </div>
    </div>

    <div class="dashboard-row">
      <div class="upcoming-card card">
        <h3>Prochains rendez-vous</h3>
  `;

  if (prochainsRdvs.length === 0) {
    html += `<p>Aucun RDV à venir.</p>`;
  } else {
    html += `<ul class="upcoming-list">`;
    prochainsRdvs.slice(0, 6).forEach(item => {
      html += `
        <li>
          <div><strong>${escapeHtml(item.nom)}</strong> (${escapeHtml(item.specialite)})</div>
          <div class="upcoming-chip">${escapeHtml(formatIsoLocalDisplay(item.date))}</div>
          <div>${escapeHtml(item.adresse)}</div>
          <button onclick="afficherRdv('${escapeHtml(item.id)}')">Voir</button>
        </li>
      `;
    });
    html += `</ul>`;

    if (prochainsRdvs.length > 6) {
      html += `<p><em>${prochainsRdvs.length - 6} autre(s) rendez-vous à venir.</em></p>`;
    }
  }

  html += `
      </div>
      <div class="stats-card card">
        <h3>Spécialistes et prochains RDV</h3>
  `;

  if (listeSpecialistes.length === 0) {
    html += `<p>Aucun spécialiste enregistré.</p>`;
  } else {
    html += `<ul class="upcoming-list">`;
    listeSpecialistes.slice(0, 6).forEach(item => {
      html += `
        <li>
          <div><strong>${escapeHtml(item.nom)}</strong> (${escapeHtml(item.specialite)})</div>
          <div>${escapeHtml(item.prochainAffiche)}</div>
          <button onclick="afficherRdv('${escapeHtml(item.id)}')">Voir</button>
        </li>
      `;
    });
    html += `</ul>`;
    if (listeSpecialistes.length > 6) {
      html += `<p><em>${listeSpecialistes.length - 6} autre(s) spécialiste(s).</em></p>`;
    }
  }

  html += `
      </div>
    </div>
  `;

  container.innerHTML = html;
}

window.afficherDashboard = afficherDashboard;
