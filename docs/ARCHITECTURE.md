# RABBIT HOLE — Architecture v0.1

## Components
- **Client**: Expo, React Native, TypeScript, Expo Router, Gesture Handler, Reanimated.
- **Client data**: TanStack Query for remote state; lightweight local store only when needed; AsyncStorage or other appropriate local persistence for demo bookmarks.
- **Backend**: Supabase Auth + PostgreSQL + RLS; Edge Functions for protected server actions and recommendation requests.
- **Discovery graph**: discoveries connected by typed, directed relationships with explanatory text.
- **Recommendations**: separate deterministic scoring service first; optional embeddings and experiments later.
- **Content pipeline**: draft → sourced → editorial review → published → corrected/unpublished.

## Proposed project layout
```
app/                  Expo Router screens
src/components/       reusable accessible UI
src/features/discover/
src/features/explore/
src/features/saved/
src/data/demo/        explicitly non-production sample content
src/domain/           typed domain entities
src/recommendations/  scoring, diversity and deduplication
src/lib/              integrations and utilities
supabase/migrations/  versioned SQL migrations
docs/                 product and engineering decisions
tests/                unit and integration tests
```

## Recommendation baseline
Score candidate discoveries using configurable normalized factors: topic relevance 0.30, connection relevance 0.25, novelty 0.20, editorial quality 0.15, diversity 0.10. These are unvalidated starting assumptions, not optimized or deployed metrics. Exclude hidden/unpublished content and already-seen items as appropriate. Apply repetition penalties and diversify cold starts. Track meaningful interactions without collecting unnecessary personal data.

## Data security
- Anonymous demo mode must work without secrets.
- Client receives only publishable content and its own private records.
- Enforce user-owned access in PostgreSQL RLS; never trust a client-supplied user ID.
- Admin/editor actions require server-verified authorization.
- Supabase service-role credentials never enter the app bundle.
- Event ingestion must be validated and rate-limited before public release.
- Account deletion and data removal require a verified implementation before launch.

## Delivery
Develop on a feature branch; use pull requests and CI checks. Start with the demo experience before provisioning Supabase. When backend is connected, add environment examples, migrations, tests, and a migration guide. Test via Expo development build and TestFlight before public launch.

## Risks
Image rights, source reliability, graph quality, cold-start recommendations, spam/content abuse, privacy, cost per recommendation, and mobile animation performance.
