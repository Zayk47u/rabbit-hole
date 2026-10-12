import { useSyncExternalStore } from 'react';

// Avoid hydration mismatches by reading the client value only after mount.
export function useClientOnlyValue<T>(server: T, client: T): T {
  return useSyncExternalStore(
    () => () => {},
    () => client,
    () => server,
  );
}
