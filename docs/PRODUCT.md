# RABBIT HOLE — Product specification v0.1
Date: 2026-10-11
Status: approved direction; implementation pending

## Vision
A public-facing iOS-first platform for personalized discovery of fascinating, source-grounded ideas and surprising connections across disciplines. The loop is **Discover → React → Explore → Branch → Discover again**.

## Who it serves
Curious people who want a visually engaging, low-friction way to learn and connect ideas, not a conventional article reader, encyclopedia search box, or AI chatbot.

## v0.1 must-have experiences
1. **Discover**: full-screen vertical cards with title, image, short explanation, topics, estimated reading time, sources, skip, save, and explore.
2. **Branch**: each discovery leads to 2–4 typed, editorially meaningful connections. Preserve navigation history; handle loops and dead ends.
3. **Personalize**: optional topic preferences, explicit feedback, and deterministic explainable ranking; diverse cold-start feed; repeat suppression; reset controls.
4. **Save**: guest-local bookmarks and optional account-based sync in a later integration stage.
5. **Trust**: editorial publication status, reviewable sources, image usage rights, reports and corrections.
6. **Admin foundation**: protected editorial workflow and moderation schema; production admin UI may follow the first app slice.

## First implementation milestone
A runnable Expo application with 12–20 *clearly labeled demonstration* discoveries, branching exploration, local bookmarks, and a deterministic ranking module. It must run without external secrets. The mock-data mode is not public production content.

## Exclusions
No user posts, direct messaging, followers, payments, subscriptions, video generation, infinite LLM calls, or unreviewed AI-published factual content.

## Experience rules
- Show a discovery immediately; onboarding optional.
- Keep primary interactions usable with one thumb.
- Preserve an alternative to swipes and honor reduced-motion settings.
- Minimize blank states, avoid forced streaks and dark patterns.
- Optimize for meaningful branches, saves, and return value, not raw time-on-app.

## Success criteria (targets, not achieved metrics)
- Fast first discovery and smooth next-card transitions on representative phones.
- No duplicates in a session under normal conditions.
- 100% of production-published factual cards have reviewable sources.
- Recommendation relevance improves measurably against a diversified editorial baseline.
- Accessibility and account/data-deletion pathways before public release.

## Open questions
Final brand identity, name availability, licensing strategy for images, editorial policy details, and public beta launch date.
