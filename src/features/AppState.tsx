import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { DEMO_DISCOVERIES, getDiscoveryById, listTopicIdsForDiscovery } from '@/src/data/demo';
import type { Discovery, UserPreferences } from '@/src/domain/types';
import { buildColdStartFeed } from '@/src/recommendations';

import {
  NEUTRAL_PREFERENCES,
  loadPreferences,
  resetPreferences as clearPrefs,
  savePreferences,
  setTopicWeight,
} from './discover/preferenceStore';
import { EMPTY_SESSION, markSeen, resetSession, type SessionState } from './discover/sessionStore';
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
  setTopicPreference: (topicId: Parameters<typeof setTopicWeight>[1], weight: number) => Promise<void>;
  resetAllPreferences: () => Promise<void>;
  toggleSave: (discoveryId: string) => Promise<void>;
  clearAllBookmarks: () => Promise<void>;
  recordView: (discoveryId: string) => void;
  rebuildFeed: () => void;
  resetSessionState: () => void;
  isSaved: (discoveryId: string) => boolean;
  savedDiscoveries: Discovery[];
};

const AppStateContext = createContext<AppStateValue | null>(null);

function computeFeed(preferences: UserPreferences, session: SessionState): Discovery[] {
  return buildColdStartFeed(DEMO_DISCOVERIES, {
    preferences,
    seenDiscoveryIds: new Set(session.seenDiscoveryIds),
    recentTopicIds: session.recentTopicIds,
  }, DEMO_DISCOVERIES.length);
}

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences>(NEUTRAL_PREFERENCES);
  const [bookmarks, setBookmarks] = useState<BookmarkRecord[]>([]);
  const [session, setSession] = useState<SessionState>(EMPTY_SESSION);
  const [feed, setFeed] = useState<Discovery[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [prefs, marks] = await Promise.all([loadPreferences(), loadBookmarks()]);
        if (cancelled) return;
        setPreferences(prefs);
        setBookmarks(marks);
        setFeed(computeFeed(prefs, EMPTY_SESSION));
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

  const value = useMemo<AppStateValue>(() => {
    return {
      ready,
      error,
      preferences,
      bookmarks,
      session,
      feed,
      setTopicPreference: async (topicId, weight) => {
        const next = setTopicWeight(preferences, topicId, weight);
        setPreferences(next);
        await savePreferences(next);
        setFeed(computeFeed(next, session));
      },
      resetAllPreferences: async () => {
        await clearPrefs();
        setPreferences(NEUTRAL_PREFERENCES);
        setFeed(computeFeed(NEUTRAL_PREFERENCES, session));
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
      recordView: (discoveryId) => {
        const discovery = getDiscoveryById(discoveryId);
        if (!discovery) return;
        // Track views for later reshuffles; do not rebuild the in-progress feed under the user.
        setSession((prev) => markSeen(prev, discoveryId, listTopicIdsForDiscovery(discovery)));
      },
      rebuildFeed: () => {
        setFeed(computeFeed(preferences, session));
      },
      resetSessionState: () => {
        const next = resetSession();
        setSession(next);
        setFeed(computeFeed(preferences, next));
      },
      isSaved: (discoveryId) => isBookmarked(bookmarks, discoveryId),
      savedDiscoveries: bookmarks
        .map((b) => getDiscoveryById(b.discoveryId))
        .filter((d): d is Discovery => Boolean(d)),
    };
  }, [ready, error, preferences, bookmarks, session, feed]);

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState(): AppStateValue {
  const ctx = useContext(AppStateContext);
  if (!ctx) {
    throw new Error('useAppState must be used within AppStateProvider');
  }
  return ctx;
}
