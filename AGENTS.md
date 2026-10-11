# RABBIT HOLE — coding agent instructions

This repository is the source of truth for the RABBIT HOLE iOS-first discovery product. Read docs/PRODUCT.md, docs/ARCHITECTURE.md, docs/DECISIONS.md, and docs/ROADMAP.md before making significant changes.

## Product nonnegotiables
- Discovery first: users see a useful discovery immediately, without account creation.
- Every card is a doorway to multiple meaningful, explainable connections.
- Personalization is user-controlled and should optimize meaningful exploration, not endless screen time.
- Published factual claims require reviewable sources; never fabricate citations or media rights.
- Public-facing, multiuser security and accessibility from the outset.
- Keep original content and user-generated preferences private; the repository may be public.
- Avoid feature creep: no social network, payments, AI chat feed, or generative media in v0.1.

## Engineering approach
- Expo + React Native + TypeScript strict mode; Expo Router; Gesture Handler and Reanimated.
- Supabase Auth, PostgreSQL, RLS, and Edge Functions when backend integration begins.
- Prefer a deterministic, offline sample-content mode for the first runnable vertical slice.
- Treat recommendation scoring as a separate testable module; do not claim a trained model.
- Keep secrets out of Git. Never commit .env or service-role keys.
- Avoid unsupported claims about builds, deployments, performance, and tests.
- Respect reduced-motion preferences, screen readers, large text, and touch alternatives to swipes.
- Add tests for ranking, deduplication, navigation, and data access rules.
- Run available checks and report exact results.

## First coding task
Implement the initial Expo app with a working vertical discovery feed, branch navigation, bookmarks, demo data, deterministic recommendation logic, tests, and accurate setup instructions. See docs/ROADMAP.md. Make a feature branch and PR rather than pushing substantial generated code directly to main.

## Completion report
Report files changed, commands actually executed, tests that passed or failed, and remaining blockers. Do not claim iPhone testing without an iPhone build.
