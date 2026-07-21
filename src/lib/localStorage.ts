import type { DreamEntry } from "../types";

const STORAGE_KEY = "weave:dream-archive:v1";

export function loadDreams(): DreamEntry[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as DreamEntry[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((dream) => !dream.id.startsWith("sample-"));
  } catch {
    return [];
  }
}

export function saveDreams(dreams: DreamEntry[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(dreams));
}

export function resetDreams() {
  window.localStorage.removeItem(STORAGE_KEY);
}
