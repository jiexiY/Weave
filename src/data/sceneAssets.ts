import type { DreamEntry } from "../types";

export type DreamSceneAsset = {
  src: string;
  alt: string;
  objectPosition: string;
  markers: string[];
};

const chapterSceneAssets: DreamSceneAsset[] = [
  {
    src: "/images/dream-scenes/july-window.png",
    alt: "An open moonlit window above a reflective floor with a brass key on the sill.",
    objectPosition: "50% 52%",
    markers: ["Window", "Key", "Water"],
  },
  {
    src: "/images/dream-scenes/august-door.png",
    alt: "An open door to a softly lit hallway standing in a misty wildflower meadow.",
    objectPosition: "50% 58%",
    markers: ["Door", "Hallway", "Tree"],
  },
  {
    src: "/images/dream-scenes/september-train.png",
    alt: "A lamp glowing in a rowboat beneath a distant train crossing a dark coastal cliff.",
    objectPosition: "52% 58%",
    markers: ["Boat", "Lamp", "Train"],
  },
  {
    src: "/images/dream-scenes/october-mirror.png",
    alt: "A rain-darkened school corridor ending at a mirror that reflects a warm bedroom.",
    objectPosition: "50% 50%",
    markers: ["Mirror", "School", "Rain"],
  },
];

const assetByMonth = new Map([
  ["2026-07", chapterSceneAssets[0]],
  ["2026-08", chapterSceneAssets[1]],
  ["2026-09", chapterSceneAssets[2]],
  ["2026-10", chapterSceneAssets[3]],
]);

function monthIndex(monthKey: string) {
  const month = Number(monthKey.split("-")[1]);
  return Number.isFinite(month) ? Math.max(0, month - 1) : 0;
}

export function sceneAssetForMonth(monthKey: string): DreamSceneAsset {
  return assetByMonth.get(monthKey) ?? chapterSceneAssets[monthIndex(monthKey) % chapterSceneAssets.length];
}

export function sceneAssetForDream(dream: DreamEntry): DreamSceneAsset {
  let fallback = sceneAssetForMonth(dream.monthKey);
  if (dream.symbols.some((symbol) => ["mirror", "school", "child", "staircase"].includes(symbol))) {
    fallback = chapterSceneAssets[3];
  } else if (dream.symbols.some((symbol) => ["train", "phone"].includes(symbol))) {
    fallback = chapterSceneAssets[2];
  } else if (dream.symbols.some((symbol) => ["dog", "bird", "lamp"].includes(symbol))) {
    fallback = chapterSceneAssets[1];
  } else if (dream.symbols.some((symbol) => ["window", "key", "water", "door"].includes(symbol))) {
    fallback = chapterSceneAssets[0];
  }
  return dream.sceneImageUrl ? { ...fallback, src: dream.sceneImageUrl } : fallback;
}
