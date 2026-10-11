import {
  DEMO_CONNECTIONS,
  DEMO_DISCOVERIES,
  getConnectionsFrom,
  getDiscoveryById,
  wouldCreateImmediateLoop,
} from '../src/data/demo';

describe('discovery graph', () => {
  it('has 12–20 demo discoveries', () => {
    expect(DEMO_DISCOVERIES.length).toBeGreaterThanOrEqual(12);
    expect(DEMO_DISCOVERIES.length).toBeLessThanOrEqual(20);
    expect(DEMO_DISCOVERIES.every((d) => d.isDemo === true)).toBe(true);
  });

  it('only connects existing discovery ids', () => {
    const ids = new Set(DEMO_DISCOVERIES.map((d) => d.id));
    for (const connection of DEMO_CONNECTIONS) {
      expect(ids.has(connection.fromDiscoveryId)).toBe(true);
      expect(ids.has(connection.toDiscoveryId)).toBe(true);
      expect(connection.fromDiscoveryId).not.toBe(connection.toDiscoveryId);
    }
  });

  it('provides 2–4 outgoing branches for most discoveries', () => {
    const counts = DEMO_DISCOVERIES.map((d) => getConnectionsFrom(d.id).length);
    const withBranches = counts.filter((c) => c >= 2 && c <= 4);
    expect(withBranches.length).toBeGreaterThanOrEqual(10);
  });

  it('detects loops when revisiting history', () => {
    expect(wouldCreateImmediateLoop(['d01', 'd02'], 'd01')).toBe(true);
    expect(wouldCreateImmediateLoop(['d01', 'd02'], 'd03')).toBe(false);
  });

  it('resolves discoveries by id', () => {
    expect(getDiscoveryById('d01')?.slug).toBe('slime-mold-shortest-path');
    expect(getDiscoveryById('missing')).toBeUndefined();
  });
});
