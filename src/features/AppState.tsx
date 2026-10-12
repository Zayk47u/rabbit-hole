import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import {
  DEMO_DISCOVERIES,
  getDiscoveryById,
  listInterestIdsForDiscovery,
} from '@/src/data/demo';
import type { Discovery, InterestId, InteractionKind, UserPreferences } from '@/src/domain/types';
import {
  applyInteractionSignal,
  buildColdStartFeed,
  toggleSelectedInterest,
} from '@/src/recommendations';

import {
  NEUTRAL_PREFERENCES,
  loadPreferences,
  resetPreferences as clearPrefs,
  savePreferences,
} from './discover/preferenceStore';
import {
  EMPTY_SESSION,
  markSeen,
  recordSkipStreak,
  resetSession,
  type SessionState,
} from './discover/sessionStore';
import {
  type BookmarkRecord,
  clearBookmarks,
  isBookmarked,
  loadBookmarks,
  saveBookmarks,
  toggleBookmark,
} from './saved/bookmarkStore';

type AppStateValue = {
  ready: boolean;
  error: string | null;
  preferences: UserPreferences;
  bookmarks: BookmarkRecord[];
  session: SessionState;
  feed: Discovery[];
  deckIndex: number;
  currentDiscovery: Discovery | undefined;
  toggleInterestSeed: (interestId: InterestId) => Promise<void>;
  resetAllPreferences: () => Promise<void>;
  toggleSave: (discoveryId: string) => Promise<void>;
  clearAllBookmarks: () => Promise<void>;
  reactToCard: (discoveryId: string, kind: InteractionKind) => Promise<void>;
  rebuildFeed: () => void;
  resetSessionState: () => void;
  isSaved: (discoveryId: string) => boolean;
  savedDiscoveries: Discovery[];
  hasOnboardedInterests: boolean;
};

const AppStateContext = createContext<AppStateValue | null>(null);

function computeFeed(preferences: UserPreferences, session: SessionState): Discovery[] {
  return buildColdStartFeed(
    DEMO_DISCOVERIES,
    {
      preferences,
      seenDiscoveryIds: new Set(session.seenDiscoveryIds),
      recentInterestIds: session.recentInterestIds,
      explorationBoost: 0.08,
    },
    DEMO_DISCOVERIES.length,
  );
}

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences>(NEUTRAL_PREFERENCES);
  const [bookmarks, setBookmarks] = useState<BookmarkRecord[]>([]);
  const [session, setSession] = useState<SessionState>(EMPTY_SESSION);
  const [feed, setFeed] = useState<Discovery[]>([]);
  const [deckIndex, setDeckIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [prefs, marks] = await Promise.all([loadPreferences(), loadBookmarks()]);
        if (cancelled) return;
        setPreferences(prefs);
        setBookmarks(marks);
        setFeed(computeFeed(prefs, EMPTY_SESSION));
        setDeckIndex(0);
        setReady(true);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : 'Failed to load local state');
        setFeed(computeFeed(NEUTRAL_PREFERENCES, EMPTY_SESSION));
        setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const advanceAfter = useCallback((discoveryId: string) => {
    setDeckIndex((idx) => idx + 1);
    setSession((prev) => {
      const discovery = getDiscoveryById(discoveryId);
      if (!discovery) return prev;
      return markSeen(prev, discoveryId, listInterestIdsForDiscovery(discovery));
    });
  }, []);

  const value = useMemo<AppStateValue>(() => {
    const currentDiscovery = feed[deckIndex];

    return {
      ready,
      error,
      preferences,
      bookmarks,
      session,
      feed,
      deckIndex,
      currentDiscovery,
      hasOnboardedInterests: preferences.selectedInterestIds.length > 0,
      toggleInterestSeed: async (interestId) => {
        const next = toggleSelectedInterest(preferences, interestId);
        setPreferences(next);
        await savePreferences(next);
        const rebuilt = computeFeed(next, session);
        setFeed(rebuilt);
        setDeckIndex(0);
      },
      resetAllPreferences: async () => {
        await clearPrefs();
        setPreferences(NEUTRAL_PREFERENCES);
        const rebuilt = computeFeed(NEUTRAL_PREFERENCES, session);
        setFeed(rebuilt);
        setDeckIndex(0);
      },
      toggleSave: async (discoveryId) => {
        const next = toggleBookmark(bookmarks, discoveryId);
        setBookmarks(next);
        await saveBookmarks(next);
      },
      clearAllBookmarks: async () => {
        await clearBookmarks();
        setBookmarks([]);
      },
      reactToCard: async (discoveryId, kind) => {
        const discovery = getDiscoveryById(discoveryId);
        if (!discovery) return;

        let nextPrefs = preferences;
        nextPrefs = applyInteractionSignal(preferences, discovery, kind);
        setPreferences(nextPrefs);
        await savePreferences(nextPrefs);

        if (kind === 'save') {
          const marks = toggleBookmark(bookmarks, discoveryId);
          if (!isBookmarked(bookmarks, discoveryId)) {
            setBookmarks(marks);
            await saveBookmarks(marks);
          }
        }

        setSession((prev) =>
          recordSkipStreak(
            markSeen(prev, discoveryId, listInterestIdsForDiscovery(discovery)),
            listInterestIdsForDiscovery(discovery),
            kind === 'skip',
          ),
        );

        if (kind === 'skip' || kind === 'save') {
          advanceAfter(discoveryId);
        } else {
          // Dive / branch: mark seen but stay until navigate; still advance deck for return.
          setSession((prev) => markSeen(prev, discoveryId, listInterestIdsForDiscovery(discovery)));
        }
      },
      rebuildFeed: () => {
        setFeed(computeFeed(preferences, session));
        setDeckIndex(0);
      },
      resetSessionState: () => {
        const next = resetSession();
        setSession(next);
        setFeed(computeFeed(preferences, next));
        setDeckIndex(0);
      },
      isSaved: (discoveryId) => isBookmarked(bookmarks, discoveryId),
      savedDiscoveries: bookmarks
        .map((b) => getDiscoveryById(b.discoveryId))
        .filter((d): d is Discovery => Boolean(d)),
    };
  }, [
    ready,
    error,
    preferences,
    bookmarks,
    session,
    feed,
    deckIndex,
    advanceAfter,
  ]);

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState(): AppStateValue {
  const ctx = useContext(AppStateContext);
  if (!ctx) {
    throw new Error('useAppState must be used within AppStateProvider');
  }
  return ctx;
}
