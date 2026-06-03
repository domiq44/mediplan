// --- Extrait la partie date (AAAA-MM-JJ) d'une chaîne ISO locale ---
export function extractDatePart(dateStr) {
  if (typeof dateStr !== "string") return null;
  const parts = dateStr.split(/[T ]/);
  return parts[0];
}

// --- Extrait la partie heure (HH:MM) d'une chaîne ISO locale ---
export function extractTimePart(dateStr) {
  if (typeof dateStr !== "string") return null;
  const parts = dateStr.split("T");
  return parts[1] || null;
}

// --- Parse une date ISO locale sans fuseau horaire ---
export function parseIsoLocal(dateStr) {
  if (typeof dateStr !== "string") return null;
  const datePart = extractDatePart(dateStr);
  if (!datePart) return null;
  const [year, month, day] = datePart.split("-").map(Number);
  if (![year, month, day].every(Number.isFinite)) return null;

  const timePart = extractTimePart(dateStr);
  if (timePart) {
    const [hour, minute] = timePart.split(":").map(Number);
    if (![hour, minute].every(Number.isFinite)) return null;
    return new Date(year, month - 1, day, hour, minute);
  }

  return new Date(year, month - 1, day);
}

// --- Formate une date pour affichage utilisateur ---
export function formatIsoLocalDisplay(dateStr) {
  if (!estDateISO(dateStr)) return dateStr;

  const date = parseIsoLocal(dateStr);
  if (!date || isNaN(date.getTime())) return dateStr;

  const pad = value => String(value).padStart(2, "0");
  const day = pad(date.getDate());
  const month = pad(date.getMonth() + 1);
  const year = date.getFullYear();
  const timePart = extractTimePart(dateStr);

  if (!timePart) {
    return `${day}/${month}/${year}`;
  }

  const hour = pad(date.getHours());
  const minute = pad(date.getMinutes());
  return `${day}/${month}/${year} ${hour}:${minute}`;
}

// --- Formate une date locale en ISO (date ou datetime locale) ---
export function formatIsoLocal(date, includeTime = false) {
  if (!(date instanceof Date) || isNaN(date.getTime())) return null;
  const pad = value => String(value).padStart(2, "0");
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const datePart = `${year}-${month}-${day}`;

  if (!includeTime) return datePart;

  const hour = pad(date.getHours());
  const minute = pad(date.getMinutes());
  return `${datePart}T${hour}:${minute}`;
}

// --- Vérifie si une chaîne est au format AAAA-MM-JJ ou AAAA-MM-JJTHH:MM ---
export function estDateISO(dateStr) {
  const dPart = extractDatePart(dateStr);
  if (!dPart || !/^\d{4}-\d{2}-\d{2}$/.test(dPart)) return false;

  const timePart = extractTimePart(dateStr);
  if (timePart && !/^\d{2}:\d{2}$/.test(timePart)) return false;

  return true;
}

// --- Vérifie si une date est valide et raisonnable ---
export function validerDateISO(dateStr) {
  if (!estDateISO(dateStr)) return false;

  const date = parseIsoLocal(dateStr);
  if (!date || isNaN(date.getTime())) return false;

  const dPart = extractDatePart(dateStr);
  if (dPart < "2000-01-01") return false;

  return true;
}

// --- Ajoute des mois à une date ISO locale ---
export function ajouterMois(dateStr, nbMois) {
  if (!estDateISO(dateStr)) return null;

  const date = parseIsoLocal(dateStr);
  if (!date || isNaN(date.getTime())) return null;

  date.setMonth(date.getMonth() + nbMois);
  return extractTimePart(dateStr)
    ? formatIsoLocal(date, true)
    : formatIsoLocal(date, false);
}

// --- Calcule le prochain RDV d'un spécialiste ---
export function calculerProchainRdv(sp) {
  if (!sp.rdv || sp.rdv.length === 0) return "Aucun RDV";

  const dernier = sp.rdv[sp.rdv.length - 1];

  if (!validerDateISO(dernier)) return "Date invalide";

  const freq = Number.isFinite(Number(sp.frequence_mois)) ? Number(sp.frequence_mois) : 0;
  if (freq <= 0) return "Fréquence invalide";

  return ajouterMois(dernier, freq);
}

// --- Calcule la date d'une dépendance (ex : prise de sang) ---
export function calculerRdvDependance(dateRdv, joursAvant) {
  if (!estDateISO(dateRdv)) return "Date RDV invalide";

  const date = parseIsoLocal(dateRdv);
  if (!date || isNaN(date.getTime())) return "Date RDV invalide";

  if (!Number.isFinite(joursAvant) || joursAvant < 0) return "Délai invalide";

  date.setDate(date.getDate() - joursAvant);

  const result = extractTimePart(dateRdv)
    ? formatIsoLocal(date, true)
    : formatIsoLocal(date, false);
  if (!result || extractDatePart(result) < "2000-01-01") return "Date trop ancienne";

  return result;
}

// --- Compare deux dates ISO (pour tri) ---
export function comparerDates(a, b) {
  const dateA = parseIsoLocal(a);
  const dateB = parseIsoLocal(b);

  if (!dateA || isNaN(dateA.getTime())) return 1;
  if (!dateB || isNaN(dateB.getTime())) return -1;

  return dateA.getTime() - dateB.getTime();
}
