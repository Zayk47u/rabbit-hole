import { AccessibilityInfo, Platform } from 'react-native';

/** Best-effort reduced-motion probe for native + web. */
export async function getPrefersReducedMotion(): Promise<boolean> {
  if (Platform.OS === 'web' && typeof window !== 'undefined' && 'matchMedia' in window) {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
  try {
    return await AccessibilityInfo.isReduceMotionEnabled();
  } catch {
    return false;
  }
}
