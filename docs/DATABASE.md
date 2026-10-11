# RABBIT HOLE — Data model proposal

This document is a design specification, not a claim that the database is deployed.

## Editorial data
- `discoveries`: id, slug, title, hook, body, image_asset_id, reading_seconds, editorial_status, quality_score, created_at, updated_at.
- `sources`: id, url, title, publisher, retrieved_at, review_status.
- `discovery_sources`: discovery_id, source_id, supporting_note.
- `topics`: id, slug, label, parent_topic_id.
- `discovery_topics`: discovery_id, topic_id, weight.
- `discovery_connections`: id, from_discovery_id, to_discovery_id, relation_type, explanation, editorial_status.
- `media_assets`: id, storage_path, attribution, license, rights_status.
- `content_reports`: id, discovery_id, reporter_user_id, reason, status.

## User-owned data
- `profiles`: user_id, display_name, created_at.
- `user_preferences`: user_id, topic_id, preference_weight.
- `interaction_events`: id, user_id, session_id, discovery_id, event_type, occurred_at.
- `bookmarks`: user_id, discovery_id, created_at.
- `exploration_sessions`: id, user_id, started_at, ended_at.
- `exploration_steps`: session_id, sequence_number, discovery_id, via_connection_id.

## Constraints and access
- Unique bookmark per (user_id, discovery_id).
- Prevent self-connection unless intentionally permitted for a future special case.
- Foreign keys and indexes on graph edges, topics, event timestamps and ownership.
- Public/guest reads: published, reviewed, rights-cleared content only.
- Authenticated reads/writes: own preferences, bookmarks, sessions and events.
- No direct client writes to published content or editorial status.
- Editors/admins: verified server-side authorization, audit log for moderation.
- Minimize retained event data and define deletion/retention policy before launch.

Implement migrations and tests during the backend milestone; do not expose an unfinished schema as production-ready.
