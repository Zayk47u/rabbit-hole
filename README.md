# RABBIT HOLE 🐇

**An iOS-first discovery platform for fascinating, source-grounded ideas and surprising connections across disciplines.**

> Discover → React → Explore → Branch → Discover again.

**Status:** M1 Expo vertical slice on `feat/expo-mvp`, redesigned as a one-card curiosity engine (dark identity, obsession clusters, teaser-first branching). Demo content only — not a public production launch.

## The product
RABBIT HOLE offers a swipeable discovery feed that opens into meaningful, explorable relationships between ideas. Recommendations use deterministic, explainable scoring (not a trained model).

## Stack (this milestone)
- Expo SDK 57 + React Native + TypeScript (strict) + Expo Router
- React Native Gesture Handler + Reanimated
- AsyncStorage for local bookmarks and topic preferences
- Jest unit tests for ranking, graph, navigation, and bookmarks
- Supabase deferred until owner-authorized backend work

## Run the demo
Requires Node.js 22.13+ (Expo SDK 57 floor).

```bash
npm ci
npm start
```

Then press `w` for web, or scan the QR code with Expo Go on a device. iOS Simulator requires macOS.

Useful scripts:

```bash
npm run web        # Expo web
npm test           # Jest unit tests
npm run typecheck  # TypeScript
npm run lint       # ESLint
npm run check      # typecheck + lint + test
```

No `.env` or Supabase credentials are required for the offline demo.

## What works offline
- Vertical discovery feed with Skip/Next button alternatives and reduced-motion-aware paging
- 16 explicitly labeled demo discoveries with placeholder media (no external image rights)
- Typed branch exploration with path history, loop labels, and dead-end handling
- Local save/unsave + Saved tab (persists via AsyncStorage)
- Topic preference controls that reshuffle deterministic ranking
- Session reset and preference reset

## Documents
- [Product requirements](docs/PRODUCT.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Database design](docs/DATABASE.md)
- [Roadmap](docs/ROADMAP.md)
- [Decision log](docs/DECISIONS.md)
- [Agent instructions](AGENTS.md)

## Not done yet
- Supabase auth, RLS, and synced bookmarks
- Reviewed production content and real citations
- Actual iPhone development build / TestFlight
- App Store / privacy policy packaging

This project is in development; do not treat sample content or unreviewed generated text as published factual material.
