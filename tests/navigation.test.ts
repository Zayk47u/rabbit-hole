import {
  canGoBack,
  createHistory,
  currentDiscoveryId,
  historyIds,
  popStep,
  pushStep,
} from '../src/features/explore/navigationHistory';

describe('exploration navigation history', () => {
  it('starts on the seed discovery', () => {
    const history = createHistory('d01');
    expect(currentDiscoveryId(history)).toBe('d01');
    expect(canGoBack(history)).toBe(false);
  });

  it('pushes branches and pops back', () => {
    let history = createHistory('d01');
    history = pushStep(history, 'd02', 'c01');
    history = pushStep(history, 'd03', 'c02');
    expect(historyIds(history)).toEqual(['d01', 'd02', 'd03']);
    expect(canGoBack(history)).toBe(true);

    history = popStep(history);
    expect(currentDiscoveryId(history)).toBe('d02');
    history = popStep(history);
    expect(currentDiscoveryId(history)).toBe('d01');
    history = popStep(history);
    expect(currentDiscoveryId(history)).toBe('d01');
  });
});
