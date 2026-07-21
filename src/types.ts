export type SymbolCategory =
  | "water"
  | "animals"
  | "places"
  | "thresholds"
  | "objects"
  | "people"
  | "celestial"
  | "body"
  | "memory"
  | "travel";

export type DreamSymbol = {
  id: string;
  label: string;
  category: SymbolCategory;
  shortMeaning: string;
  reflectionNote: string;
  relatedEmotions: string[];
  relatedThemes: string[];
  keywords: string[];
};

export type DreamEntry = {
  id: string;
  date: string;
  monthKey: string;
  title: string;
  rawDreamText: string;
  excerpt: string;
  moodTags: string[];
  symbols: string[];
  people: string[];
  places: string[];
  generatedScenePrompt: string;
  sceneImageUrl?: string;
  chapterTitle: string;
  chapterSummary: string;
  reflection: string;
  createdAt: string;
};

export type MonthChapter = {
  monthKey: string;
  monthName: string;
  title: string;
  summary: string;
  dreams: DreamEntry[];
  recurringSymbols: Array<{ id: string; label: string; count: number }>;
  recurringMoods: Array<{ mood: string; count: number }>;
  innerChildReflection: string;
};
