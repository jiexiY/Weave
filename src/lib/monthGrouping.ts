import type { DreamEntry, MonthChapter } from "../types";
import { symbolById } from "../data/dreamSymbols";
import { formatMonthName } from "./dreamAnalysis";

function countValues(values: string[]) {
  return values.reduce<Record<string, number>>((counts, value) => {
    counts[value] = (counts[value] ?? 0) + 1;
    return counts;
  }, {});
}

export function groupDreamsByMonth(dreams: DreamEntry[]): MonthChapter[] {
  const grouped = dreams.reduce<Record<string, DreamEntry[]>>((months, dream) => {
    months[dream.monthKey] = [...(months[dream.monthKey] ?? []), dream];
    return months;
  }, {});

  return Object.entries(grouped)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([monthKey, monthDreams]) => {
      const sortedDreams = [...monthDreams].sort((a, b) => b.date.localeCompare(a.date));
      const symbolCounts = countValues(sortedDreams.flatMap((dream) => dream.symbols));
      const moodCounts = countValues(sortedDreams.flatMap((dream) => dream.moodTags));
      const recurringSymbols = Object.entries(symbolCounts)
        .map(([id, count]) => ({ id, label: symbolById.get(id)?.label ?? id, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 6);
      const recurringMoods = Object.entries(moodCounts)
        .map(([mood, count]) => ({ mood, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
      const primary = sortedDreams[0];

      return {
        monthKey,
        monthName: formatMonthName(monthKey),
        title: primary?.chapterTitle ?? `${formatMonthName(monthKey)} - A Quiet Chapter`,
        summary: buildSummary(sortedDreams, recurringSymbols, recurringMoods),
        dreams: sortedDreams,
        recurringSymbols,
        recurringMoods,
        innerChildReflection: buildInnerChildReflection(recurringSymbols, recurringMoods),
      } satisfies MonthChapter;
    });
}

export function buildSummary(
  dreams: DreamEntry[],
  recurringSymbols: Array<{ label: string; count: number }>,
  recurringMoods: Array<{ mood: string; count: number }>,
) {
  const symbolLine = recurringSymbols
    .slice(0, 3)
    .map((symbol) => `${symbol.label.toLowerCase()} appeared ${symbol.count} time${symbol.count === 1 ? "" : "s"}`)
    .join(", ");
  const mood = recurringMoods[0]?.mood;
  if (!dreams.length) return "No dreams saved yet. This chapter is waiting for its first thread.";
  return `This chapter holds ${dreams.length} saved dream${dreams.length === 1 ? "" : "s"}${
    symbolLine ? `; ${symbolLine}` : ""
  }${mood ? `. The strongest emotional tone was ${mood}.` : "."}`;
}

export function buildInnerChildReflection(
  recurringSymbols: Array<{ label: string; count: number }>,
  recurringMoods: Array<{ mood: string; count: number }>,
) {
  const symbol = recurringSymbols[0]?.label.toLowerCase() ?? "quiet rooms";
  const mood = recurringMoods[0]?.mood ?? "soft";
  const article = /^[aeiou]/i.test(mood) ? "an" : "a";
  return `This month often returned to ${symbol} with ${article} ${mood} tone. Together, these images may suggest a younger part of you looking for reassurance, safety, or a chance to be understood.`;
}
