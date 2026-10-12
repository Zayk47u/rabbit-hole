import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import {
  DEMO_CONNECTIONS,
  DEMO_DISCOVERIES,
  getDiscoveryById,
  listInterestIdsForDiscovery,
} from '@/src/data/demo';
import type {
  BranchType,
  Discovery,
  DiscoveryConnection,
  InterestId,
  InteractionKind,
  ScoredDiscovery,
  UserPreferences,
} from '@/src/domain/types';
import {
  applyInteractionSignal,
  buildAdaptiveFeed,
  pickNextDiscovery,
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
  noteCardShown,
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

const INCOMING_BY_ID: ReadonlyMap<string, readonly DiscoveryConnection[]> = (() => {
  const map = new Map<string, DiscoveryConnection[]>();
  for (const c of DEMO_CONNECTIONS) {
    const list = map.get(c.toDiscoveryId) ?? [];
    list.push(c);
    map.set(c.toDiscoveryId, list);
  }
  return map;
})();

type ReactOptions = {
  branchType?: BranchType;
  fromDiscoveryId?: string;
  dwellMs?: number;
};

type AppStateValue = {
  ready: boolean;
  error: string | null;
  preferences: UserPreferences;
  bookmarks: BookmarkRecord[];
  session: SessionState;
  feed: Discovery[];
  deckIndex: number;
  currentDiscovery: Discovery | undefined;
  currentScored: ScoredDiscovery | undefined;
  toggleInterestSeed: (interestId: InterestId) => Promise<void>;
  resetAllPreferences: () => Promise<void>;
  toggleSave: (discoveryId: string) => Promise<void>;
  clearAllBookmarks: () => Promise<void>;
  reactToCard: (
    discoveryId: string,
    kind: InteractionKind,
    options?: ReactOptions,
  ) => Promise<void>;
  rebuildFeed: () => void;
  resetSessionState: () => void;
  markCardVisible: () => void;
  isSaved: (discoveryId: string) => boolean;
  savedDiscoveries: Discovery[];
  hasOnboardedInterests: boolean;
};

const AppStateContext = createContext<AppStateValue | null>(null);

function seenUnion(prefs: UserPreferences, session: SessionState): Set<string> {
  return new Set([...prefs.seenDiscoveryIds, ...session.seenDiscoveryIds]);
}

function rankingContext(preferences: UserPreferences, session: SessionState) {
  return {
    preferences,
    seenDiscoveryIds: seenUnion(preferences, session),
    recentInterestIds: session.recentInterestIds,
    skipStreakByInterest: session.skipStreakByInterest,
  };
}

function computeFeed(preferences: UserPreferences, session: SessionState): ScoredDiscovery[] {
  return buildAdaptiveFeed(
    DEMO_DISCOVERIES,
    rankingContext(preferences, session),
    Math.min(DEMO_DISCOVERIES.length, 48),
    INCOMING_BY_ID,
  );
}

function pickLive(
  preferences: UserPreferences,
  session: SessionState,
): ScoredDiscovery | undefined {
  return pickNextDiscovery(
    DEMO_DISCOVERIES,
    rankingContext(preferences, session),
    session.pickCount,
    INCOMING_BY_ID,
  );
}

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences>(NEUTRAL_PREFERENCES);
  const [bookmarks, setBookmarks] = useState<BookmarkRecord[]>([]);
  const [session, setSession] = useState<SessionState>(EMPTY_SESSION);
  const [feed, setFeed] = useState<ScoredDiscovery[]>([]);
  const [deckIndex, setDeckIndex] = useState(0);
  const [liveCurrent, setLiveCurrent] = useState<ScoredDiscovery | undefined>(undefined);

  const startDeck = useCallback((prefs: UserPreferences, baseSession: SessionState) => {
    const built = computeFeed(prefs, baseSession);
    const first = built[0];
    setFeed(built);
    setDeckIndex(0);
    setLiveCurrent(first);
    if (first) {
      setSession(noteCardShown(baseSession, first, Date.now()));
    } else {
      setSession(baseSession);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [prefs, marks] = await Promise.all([loadPreferences(), loadBookmarks()]);
        if (cancelled) return;
        setPreferences(prefs);
        setBookmarks(marks);
        startDeck(prefs, EMPTY_SESSION);
        setReady(true);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : 'Failed to load local state');
        startDeck(NEUTRAL_PREFERENCES, EMPTY_SESSION);
        setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [startDeck]);

  const markCardVisible = useCallback(() => {
    setSession((prev) => ({ ...prev, cardShownAtMs: Date.now() }));
  }, []);

  const advanceToNext = useCallback((nextPrefs: UserPreferences, nextSessionBase: SessionState) => {
    const nextScored = pickLive(nextPrefs, nextSessionBase);
    if (!nextScored) {
      setLiveCurrent(undefined);
      setFeed([]);
      setDeckIndex(0);
      setSession(nextSessionBase);
      return;
    }
    const withShown = noteCardShown(nextSessionBase, nextScored, Date.now());
    setSession(withShown);
    setLiveCurrent(nextScored);
    const remaining = buildAdaptiveFeed(
      DEMO_DISCOVERIES,
      rankingContext(nextPrefs, withShown),
      Math.min(DEMO_DISCOVERIES.length, 40),
      INCOMING_BY_ID,
    );
    setFeed([nextScored, ...remaining.filter((s) => s.discovery.id !== nextScored.discovery.id)]);
    setDeckIndex(0);
  }, []);

  const toggleInterestSeed = useCallback(
    async (interestId: InterestId) => {
      const next = toggleSelectedInterest(preferences, interestId);
      setPreferences(next);
      await savePreferences(next);
      startDeck(next, {
        ...session,
        pickCount: 0,
        lastBucket: null,
        lastExplanation: null,
        cardShownAtMs: null,
      });
    },
    [preferences, session, startDeck],
  );

  const resetAllPreferences = useCallback(async () => {
    await clearPrefs();
    const next = { ...NEUTRAL_PREFERENCES };
    setPreferences(next);
    startDeck(next, resetSession());
  }, [startDeck]);

  const toggleSave = useCallback(
    async (discoveryId: string) => {
      const next = toggleBookmark(bookmarks, discoveryId);
      setBookmarks(next);
      await saveBookmarks(next);
    },
    [bookmarks],
  );

  const clearAllBookmarks = useCallback(async () => {
    await clearBookmarks();
    setBookmarks([]);
  }, []);

  const reactToCard = useCallback(
    async (discoveryId: string, kind: InteractionKind, options: ReactOptions = {}) => {
      const discovery = getDiscoveryById(discoveryId);
      if (!discovery) return;

      const dwellMs =
        options.dwellMs ??
        (session.cardShownAtMs != null ? Date.now() - session.cardShownAtMs : undefined);
      const sourceDiscovery = options.fromDiscoveryId
        ? getDiscoveryById(options.fromDiscoveryId)
        : undefined;

      const nextPrefs = applyInteractionSignal(preferences, discovery, kind, {
        branchType: options.branchType,
        sourceDiscovery,
        dwellMs,
      });
      setPreferences(nextPrefs);
      await savePreferences(nextPrefs);

      if (kind === 'save' && !isBookmarked(bookmarks, discoveryId)) {
        const marks = toggleBookmark(bookmarks, discoveryId);
        setBookmarks(marks);
        await saveBookmarks(marks);
      }

      const interests = listInterestIdsForDiscovery(discovery);
      const nextSession = recordSkipStreak(
        markSeen(session, discoveryId, interests),
        interests,
        kind === 'skip',
      );

      if (kind === 'skip' || kind === 'save' || kind === 'dive') {
        advanceToNext(nextPrefs, nextSession);
      } else {
        setSession(nextSession);
        setFeed(computeFeed(nextPrefs, nextSession));
      }
    },
    [preferences, session, bookmarks, advanceToNext],
  );

  const rebuildFeed = useCallback(() => {
    startDeck(preferences, {
      ...session,
      pickCount: 0,
      lastBucket: null,
      lastExplanation: null,
      cardShownAtMs: null,
    });
  }, [preferences, session, startDeck]);

  const resetSessionState = useCallback(() => {
    startDeck(preferences, resetSession());
  }, [preferences, startDeck]);

  const value = useMemo<AppStateValue>(() => {
    const currentScored = liveCurrent ?? feed[deckIndex];
    const currentDiscovery = currentScored?.discovery;

    return {
      ready,
      error,
      preferences,
      bookmarks,
      session,
      feed: feed.map((s) => s.discovery),
      deckIndex,
      currentDiscovery,
      currentScored,
      hasOnboardedInterests: preferences.selectedInterestIds.length > 0,
      toggleInterestSeed,
      resetAllPreferences,
      toggleSave,
      clearAllBookmarks,
      reactToCard,
      rebuildFeed,
      resetSessionState,
      markCardVisible,
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
    liveCurrent,
    toggleInterestSeed,
    resetAllPreferences,
    toggleSave,
    clearAllBookmarks,
    reactToCard,
    rebuildFeed,
    resetSessionState,
    markCardVisible,
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
