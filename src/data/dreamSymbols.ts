import type { DreamSymbol } from "../types";

export const dreamSymbols: DreamSymbol[] = [
  {
    id: "water",
    label: "Water",
    category: "water",
    shortMeaning: "Often relates to emotion, memory, change, or what is difficult to hold.",
    reflectionNote:
      "Water can symbolize feelings moving beneath the surface. In a dream archive, it may point toward what is asking to be felt before it can be understood.",
    relatedEmotions: ["tender", "overwhelmed", "calm", "uncertain"],
    relatedThemes: ["emotion", "memory", "release"],
    keywords: ["water", "ocean", "sea", "river", "lake", "rain", "flood", "pool"],
  },
  {
    id: "door",
    label: "Door",
    category: "thresholds",
    shortMeaning: "May suggest a threshold, choice, hidden room, or readiness to enter something new.",
    reflectionNote:
      "Doors often appear when one part of you is near a boundary. The question may be less about opening it quickly and more about noticing what you feel beside it.",
    relatedEmotions: ["curious", "hesitant", "hopeful", "guarded"],
    relatedThemes: ["transition", "choice", "permission"],
    keywords: ["door", "gate", "entrance", "locked door", "threshold"],
  },
  {
    id: "mirror",
    label: "Mirror",
    category: "objects",
    shortMeaning: "Often relates to self-image, identity, reflection, or how you see yourself.",
    reflectionNote:
      "A mirror may suggest that the dream is holding up an image of selfhood. Its meaning is reflective, not fixed: what matters is how you felt while looking.",
    relatedEmotions: ["exposed", "curious", "uncertain", "clear"],
    relatedThemes: ["identity", "self-image", "recognition"],
    keywords: ["mirror", "reflection", "glass"],
  },
  {
    id: "staircase",
    label: "Staircase",
    category: "thresholds",
    shortMeaning: "Can symbolize movement between states, old floors of memory, or a gradual climb.",
    reflectionNote:
      "Stairs may mark a slow passage from one layer of awareness to another. Notice whether the dream asked you to climb, descend, pause, or turn back.",
    relatedEmotions: ["determined", "tired", "anticipatory"],
    relatedThemes: ["growth", "effort", "return"],
    keywords: ["stair", "stairs", "staircase", "steps"],
  },
  {
    id: "key",
    label: "Key",
    category: "objects",
    shortMeaning: "May suggest access, trust, secrecy, permission, or a missing answer.",
    reflectionNote:
      "A key can point toward something that feels close but not yet fully available. It may ask what part of you needs permission to enter.",
    relatedEmotions: ["hopeful", "nervous", "ready"],
    relatedThemes: ["access", "permission", "agency"],
    keywords: ["key", "lock", "unlock"],
  },
  {
    id: "window",
    label: "Window",
    category: "thresholds",
    shortMeaning: "Often relates to perspective, longing, observation, or a safe distance from change.",
    reflectionNote:
      "Windows can hold the feeling of seeing without stepping through. They may suggest a desire to witness a new possibility before acting on it.",
    relatedEmotions: ["longing", "quiet", "watchful"],
    relatedThemes: ["perspective", "distance", "possibility"],
    keywords: ["window", "windowsill", "glass pane"],
  },
  {
    id: "child",
    label: "Child",
    category: "people",
    shortMeaning: "May point toward tenderness, early needs, play, vulnerability, or younger parts of self.",
    reflectionNote:
      "A child in a dream can symbolize an inner younger self or a tender need. It is best approached gently, with curiosity rather than certainty.",
    relatedEmotions: ["tender", "protective", "wistful"],
    relatedThemes: ["inner child", "care", "memory"],
    keywords: ["child", "kid", "younger self", "little girl", "little boy"],
  },
  {
    id: "house",
    label: "House",
    category: "places",
    shortMeaning: "Often relates to the self, family memory, safety, rooms of identity, or private life.",
    reflectionNote:
      "A house can act like a map of the inner world. Repeated rooms may become a chapter in the archive, revealing what keeps returning.",
    relatedEmotions: ["safe", "uneasy", "nostalgic"],
    relatedThemes: ["home", "self", "family"],
    keywords: ["house", "home", "room", "bedroom", "kitchen", "hallway"],
  },
  {
    id: "school",
    label: "School",
    category: "places",
    shortMeaning: "Can symbolize evaluation, old roles, social memory, learning, or unfinished pressure.",
    reflectionNote:
      "School settings may return when a part of you feels tested or watched. They may also carry younger memories that want a softer ending.",
    relatedEmotions: ["anxious", "embarrassed", "focused"],
    relatedThemes: ["evaluation", "memory", "belonging"],
    keywords: ["school", "classroom", "teacher", "locker", "hallway", "exam"],
  },
  {
    id: "train",
    label: "Train",
    category: "travel",
    shortMeaning: "May suggest momentum, timing, direction, departure, or feeling carried by events.",
    reflectionNote:
      "A train can symbolize movement already underway. The dream may be asking whether you feel like a passenger, a conductor, or someone left at the platform.",
    relatedEmotions: ["restless", "hopeful", "late"],
    relatedThemes: ["direction", "timing", "transition"],
    keywords: ["train", "station", "platform", "rail"],
  },
  {
    id: "dog",
    label: "Dog",
    category: "animals",
    shortMeaning: "Often relates to loyalty, instinct, protection, companionship, or a trusted guide.",
    reflectionNote:
      "A dog may point toward instinctive care or protection. Notice whether it was guiding, guarding, following, or needing attention.",
    relatedEmotions: ["comforted", "alert", "protective"],
    relatedThemes: ["companionship", "instinct", "trust"],
    keywords: ["dog", "puppy", "hound"],
  },
  {
    id: "moon",
    label: "Moon",
    category: "celestial",
    shortMeaning: "Can symbolize intuition, cycles, nighttime selfhood, hidden light, or quiet guidance.",
    reflectionNote:
      "The moon may suggest a softer kind of knowing. It can mark recurring cycles rather than one final answer.",
    relatedEmotions: ["quiet", "wistful", "held"],
    relatedThemes: ["intuition", "cycles", "night"],
    keywords: ["moon", "moonlight", "lunar"],
  },
  {
    id: "phone",
    label: "Phone",
    category: "objects",
    shortMeaning: "May relate to communication, missed contact, wanting reassurance, or a message not sent.",
    reflectionNote:
      "Phones often carry the feeling of trying to reach someone or be reached. The dream may be less about the device and more about the distance.",
    relatedEmotions: ["urgent", "lonely", "hopeful"],
    relatedThemes: ["communication", "connection", "waiting"],
    keywords: ["phone", "text", "call", "message", "voicemail"],
  },
  {
    id: "bird",
    label: "Bird",
    category: "animals",
    shortMeaning: "Often relates to perspective, escape, messages, fragility, or a wish to rise above.",
    reflectionNote:
      "A bird can symbolize a message from a quieter part of the self. Notice whether it was free, trapped, returning, or watching.",
    relatedEmotions: ["light", "fragile", "hopeful"],
    relatedThemes: ["perspective", "freedom", "message"],
    keywords: ["bird", "wings", "feather", "sparrow", "crow"],
  },
  {
    id: "lamp",
    label: "Lamp",
    category: "objects",
    shortMeaning: "May suggest comfort, attention, guidance, or a small light kept alive.",
    reflectionNote:
      "A lamp can symbolize a contained kind of care. It may ask where a small steady light is enough for now.",
    relatedEmotions: ["safe", "warm", "attentive"],
    relatedThemes: ["comfort", "clarity", "care"],
    keywords: ["lamp", "light", "lantern", "candle"],
  },
];

export const symbolById = new Map(dreamSymbols.map((symbol) => [symbol.id, symbol]));
