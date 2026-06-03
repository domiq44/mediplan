import { parseIsoLocal } from "./dates.js";

export const STORAGE_KEY = "mediplanData";

export let DATA = { specialistes: [] };
window.DATA = DATA;

export function isValidRdvDependance(dep) {
  return (
    dep &&
    typeof dep === "object" &&
    typeof dep.type === "string" &&
    dep.type.trim() !== "" &&
    Number.isFinite(Number(dep.delai_jours)) &&
    Number(dep.delai_jours) >= 0
  );
}

export function isValidSpecialiste(sp) {
  return (
    sp &&
    typeof sp === "object" &&
    typeof sp.id === "string" &&
    sp.id.trim() !== "" &&
    typeof sp.specialite === "string" &&
    sp.specialite.trim() !== "" &&
    typeof sp.nom === "string" &&
    sp.nom.trim() !== "" &&
    Number.isFinite(Number(sp.frequence_mois)) &&
    Number(sp.frequence_mois) > 0 &&
    Array.isArray(sp.rdv) &&
    sp.rdv.every(item => typeof item === "string") &&
    Array.isArray(sp.rdv_dependances) &&
    sp.rdv_dependances.every(isValidRdvDependance)
  );
}

export function validateDataStructure(data) {
  return (
    data &&
    typeof data === "object" &&
    Array.isArray(data.specialistes) &&
    data.specialistes.every(isValidSpecialiste)
  )
    ? data
    : null;
}

export function setData(data) {
  const normalized = validateDataStructure(data);
  DATA = normalized || { specialistes: [] };
  window.DATA = DATA;
}

export function saveData() {
  if (!DATA || !Array.isArray(DATA.specialistes)) {
    DATA = { specialistes: [] };
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(DATA));
}

export function loadLocalData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const validated = validateDataStructure(parsed);
    if (!validated) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return validated;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export async function requestPersistentStorage() {
  if (!navigator.storage || !navigator.storage.persist) return false;

  try {
    const alreadyPersisted = await navigator.storage.persisted();
    if (alreadyPersisted) return true;
    return await navigator.storage.persist();
  } catch {
    return false;
  }
}

export function getSpecialiste(id) {
  return DATA.specialistes.find(s => s.id === id);
}

export function hasFutureRdv(sp) {
  if (!sp || !Array.isArray(sp.rdv)) return false;
  const maintenant = Date.now();
  return sp.rdv.some(rdv => {
    const date = parseIsoLocal(rdv);
    return date && date.getTime() >= maintenant;
  });
}
