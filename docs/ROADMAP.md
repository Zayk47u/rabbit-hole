# RABBIT HOLE — Implementation roadmap

## M0 — Repository foundation
- [x] Repository created by owner.
- [x] Initial product/architecture/agent documentation.
- [ ] Confirm repository visibility is intentional (currently public).
- [x] Create feature branch for app implementation (`feat/expo-mvp`).

## M1 — Working Expo vertical slice
- [x] Initialize Expo Router TypeScript app using mutually compatible current dependencies.
- [x] Build single-column, accessible, swipeable discovery feed.
- [x] Add 12–20 explicitly demo-labeled discoveries with safe placeholder media.
- [x] Add typed discovery-to-discovery branches and exploration backtracking.
- [x] Add local save/unsave and saved screen.
- [x] Add deterministic recommendation module, cold-start diversity and deduplication.
- [x] Test ranking, navigation, bookmarks, reduced motion, and error states.
- [x] Run lint, typecheck, tests and report results (`npm run check`: 15 tests passed).
- [x] Open implementation PR (#5).

## M2 — Content and backend
- [ ] Create Supabase project after explicit authorization/credentials setup.
- [ ] Implement SQL migrations and RLS tests.
- [ ] Add user authentication, guest mode and account deletion.
- [ ] Add source review and media-rights workflow.
- [ ] Seed 150–300 reviewed discoveries only after source and licensing validation.
- [ ] Implement server-side feed ranking and event capture.

## M3 — iPhone and public beta
- [ ] Test actual iPhone development build.
- [ ] Measure feed loading, animations, crash rate and accessibility.
- [ ] Evaluate recommendation quality against nonpersonalized baseline.
- [ ] Complete privacy policy, moderation/reporting, deletion and App Store requirements.
- [ ] Invite limited beta testers through TestFlight.
- [ ] Iterate before public release.

## Decision gates
No paid infrastructure, Apple developer enrollment, external publication, or live credentials without owner authorization.
