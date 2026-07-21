# Weave

Weave is a private dream archive that turns saved dreams into a visual story of the user's inner world.

## Features

- Fast dream capture with local persistence
- One visual archive card per saved dream
- Horizontal drag, wheel, and swipe exploration
- Dream detail scenes with clickable symbol notes
- Recurring symbol and mood summaries
- Responsive layouts for desktop and mobile

## Stack

- React 18
- Vite 6
- TypeScript
- Tailwind CSS
- Framer Motion
- Three.js for the atmospheric LiquidEther background

## Development

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
npm run preview
```

The MVP stores dream entries in the browser with `localStorage`. Dream analysis and scene imagery currently use deterministic local helpers and curated assets; future AI services can be connected in `src/lib/dreamAnalysis.ts` and `src/data/sceneAssets.ts`.
