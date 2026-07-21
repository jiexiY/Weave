import type { DreamEntry } from "../types";
import { dreamSymbols, symbolById } from "../data/dreamSymbols";

const commonMoodWords = [
  "safe",
  "anxious",
  "curious",
  "tender",
  "lonely",
  "hopeful",
  "quiet",
  "uncertain",
  "relieved",
  "guarded",
  "wistful",
  "brave",
  "overwhelmed",
];

export function makeMonthKey(date: string) {
  return date.slice(0, 7);
}

export function formatMonthName(monthKey: string) {
  const [year, month] = monthKey.split("-").map(Number);
  return new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(
    new Date(year, month - 1, 1),
  );
}

export function makeExcerpt(text: string, maxLength = 150) {
  const cleaned = text.trim().replace(/\s+/g, " ");
  if (cleaned.length <= maxLength) return cleaned;
  return `${cleaned.slice(0, maxLength).replace(/\s+\S*$/, "")}...`;
}

export function extractSymbols(text: string, manualSymbolIds: string[] = []) {
  const lower = text.toLowerCase();
  const detected = dreamSymbols
    .filter((symbol) => symbol.keywords.some((keyword) => lower.includes(keyword)))
    .map((symbol) => symbol.id);

  return Array.from(new Set([...manualSymbolIds, ...detected]));
}

export function inferMoods(text: string, manualMoods: string[] = []) {
  const lower = text.toLowerCase();
  const detected = commonMoodWords.filter((mood) => lower.includes(mood));
  return Array.from(new Set([...manualMoods.map((mood) => mood.trim()).filter(Boolean), ...detected]));
}

export function generateTitle(text: string, symbolIds: string[]) {
  const firstSymbol = symbolIds[0] ? symbolById.get(symbolIds[0])?.label : undefined;
  if (firstSymbol) return `The ${firstSymbol} That Returned`;
  const firstWords = text.trim().split(/\s+/).slice(0, 5).join(" ");
  return firstWords ? `${firstWords}...` : "Untitled Dream";
}

export function makeScenePrompt(text: string, symbolIds: string[]) {
  const labels = symbolIds
    .map((id) => symbolById.get(id)?.label.toLowerCase())
    .filter(Boolean)
    .join(", ");
  return `A scene inspired by this dream${labels ? `, with symbolic traces of ${labels}` : ""}: ${makeExcerpt(
    text,
    180,
  )}`;
}

export function createDreamEntry(input: {
  date: string;
  title?: string;
  rawDreamText: string;
  moodTags?: string[];
  symbols?: string[];
  people?: string[];
  places?: string[];
}): DreamEntry {
  const monthKey = makeMonthKey(input.date);
  const symbols = extractSymbols(input.rawDreamText, input.symbols);
  const moodTags = inferMoods(input.rawDreamText, input.moodTags);
  const title = input.title?.trim() || generateTitle(input.rawDreamText, symbols);
  const chapterTitle = chapterTitleFromSymbols(monthKey, symbols);

  return {
    id: crypto.randomUUID(),
    date: input.date,
    monthKey,
    title,
    rawDreamText: input.rawDreamText.trim(),
    excerpt: makeExcerpt(input.rawDreamText),
    moodTags: moodTags.length ? moodTags : ["quiet"],
    symbols,
    people: input.people ?? [],
    places: input.places ?? [],
    generatedScenePrompt: makeScenePrompt(input.rawDreamText, symbols),
    chapterTitle,
    chapterSummary: "A new chapter is forming from the dreams you save here.",
    reflection: makeReflection(symbols, moodTags),
    createdAt: new Date().toISOString(),
  };
}

export function makeReflection(symbolIds: string[], moodTags: string[]) {
  const symbol = symbolIds[0] ? symbolById.get(symbolIds[0]) : undefined;
  const mood = moodTags[0] ?? "quiet";
  if (!symbol) {
    return `This dream carries a ${mood} tone. Its meaning is not fixed; it may become clearer as more entries gather around it.`;
  }
  return `This dream carries a ${mood} tone around ${symbol.label.toLowerCase()}. It may suggest a part of you asking to be noticed gently, without rushing toward certainty.`;
}

export function chapterTitleFromSymbols(monthKey: string, symbolIds: string[]) {
  const labels = symbolIds
    .slice(0, 2)
    .map((id) => symbolById.get(id)?.label)
    .filter(Boolean);
  const month = formatMonthName(monthKey).split(" ")[0];
  if (labels.length >= 2) return `${month} - ${labels[0]}, ${labels[1]}, and the Thread Between`;
  if (labels.length === 1) return `${month} - The ${labels[0]} That Returned`;
  return `${month} - The Things I Couldn't Name`;
}
