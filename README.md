# RABBIT HOLE 🐇

**An iOS-first discovery platform for fascinating, source-grounded ideas and surprising connections across disciplines.**

> Discover → React → Explore → Branch → Discover again.

**Status:** Product and engineering setup complete; the app has **not yet been implemented, built, deployed, or published**.

## The product
RABBIT HOLE offers a swipeable discovery feed that opens into meaningful, explorable relationships between ideas. Recommendations should learn from users' interests and exploration choices while balancing novelty, quality, and diversity.

## Proposed stack
- Expo + React Native + TypeScript + Expo Router
- React Native Gesture Handler + Reanimated
- Supabase Auth + PostgreSQL + Row Level Security (after the demo milestone)
- Deterministic recommendation baseline, with more advanced models only after evaluation

## Start building
1. Read [the product specification](docs/PRODUCT.md), [architecture](docs/ARCHITECTURE.md), and [roadmap](docs/ROADMAP.md).
2. Coding agents must follow [AGENTS.md](AGENTS.md).
3. Implement the first runnable vertical slice on a feature branch and open a PR.
4. Do not commit secrets or private user data. The repository is currently **public**.

## Documents
- [Product requirements](docs/PRODUCT.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Database design](docs/DATABASE.md)
- [Roadmap](docs/ROADMAP.md)
- [Decision log](docs/DECISIONS.md)

## Immediate milestone
A runnable Expo app with a smooth, accessible discovery feed; 12–20 clearly labeled demonstration cards; typed exploration branches; local bookmarks; and testable deterministic recommendations. No paid service or credentials should be required to run the demo.

This project is in development; do not treat sample content or unreviewed generated text as published factual material.
