import { describe, expect, it } from 'vitest';
import {
  HISTORY_KEY,
  HISTORY_LIMIT,
  SETTINGS_KEY,
  createNullStore,
  createStore,
  isStorageAvailable,
  parseHistory,
  parseSettings,
  type StorageLike,
} from '../../src/storage/store.ts';

class FakeStorage implements StorageLike {
  readonly map = new Map<string, string>();
  failOnWrite = false;
  failOnRead = false;

  getItem(key: string): string | null {
    if (this.failOnRead) throw new Error('SecurityError: storage blocked');
    return this.map.has(key) ? (this.map.get(key) as string) : null;
  }

  setItem(key: string, value: string): void {
    if (this.failOnWrite) throw new Error('QuotaExceededError');
    this.map.set(key, value);
  }

  removeItem(key: string): void {
    this.map.delete(key);
  }
}

const entry = {
  input: '12450',
  canonical: '12450',
  groupedBengali: '১২,৪৫০',
  words: 'বারো হাজার চারশত পঞ্চাশ টাকা মাত্র',
  styleId: 'official',
};

describe('isStorageAvailable', () => {
  it('is false without a backend (private mode / blocked storage)', () => {
    expect(isStorageAvailable(null)).toBe(false);
    expect(isStorageAvailable(undefined)).toBe(false);
  });

  it('is false when the backend throws on write', () => {
    const backend = new FakeStorage();
    backend.failOnWrite = true;
    expect(isStorageAvailable(backend)).toBe(false);
  });

  it('is true for a working backend and leaves no probe key behind', () => {
    const backend = new FakeStorage();
    expect(isStorageAvailable(backend)).toBe(true);
    expect([...backend.map.keys()]).toEqual([]);
  });
});

describe('createStore — opt-in behaviour', () => {
  it('writes nothing while persistence is off', () => {
    const backend = new FakeStorage();
    const store = createStore(backend);
    expect(store.loadSettings().persistEnabled).toBe(false);
    expect(store.loadHistory()).toEqual([]);
    // Loading must not create keys by itself.
    expect([...backend.map.keys()]).toEqual([]);
  });

  it('round-trips settings once the user opts in', () => {
    const backend = new FakeStorage();
    const store = createStore(backend);
    expect(store.saveSettings({ schemaVersion: 1, styleId: 'colloquial', persistEnabled: true })).toBe(true);
    expect(store.loadSettings()).toEqual({ schemaVersion: 1, styleId: 'colloquial', persistEnabled: true });
  });

  it('stores only the reviewed conversion fields', () => {
    const backend = new FakeStorage();
    const store = createStore(backend);
    expect(store.addHistoryEntry(entry)).toBe(true);
    const stored = JSON.parse(backend.map.get(HISTORY_KEY) as string) as Array<Record<string, unknown>>;
    expect(stored).toHaveLength(1);
    expect(Object.keys(stored[0] ?? {}).sort()).toEqual(
      ['canonical', 'createdAt', 'groupedBengali', 'id', 'input', 'styleId', 'words'].sort(),
    );
  });

  it('reports a failed write instead of pretending it saved', () => {
    const backend = new FakeStorage();
    const store = createStore(backend);
    backend.failOnWrite = true;
    expect(store.addHistoryEntry(entry)).toBe(false);
    expect(store.saveSettings({ schemaVersion: 1, styleId: null, persistEnabled: true })).toBe(false);
  });

  it('keeps at most the declared number of entries, newest first', () => {
    const backend = new FakeStorage();
    const store = createStore(backend);
    for (let value = 0; value < HISTORY_LIMIT + 5; value += 1) {
      store.addHistoryEntry({ ...entry, input: String(value), canonical: String(value) });
    }
    const history = store.loadHistory();
    expect(history).toHaveLength(HISTORY_LIMIT);
    expect(history[0]?.canonical).toBe(String(HISTORY_LIMIT + 4));
  });

  it('de-duplicates the same amount in the same style', () => {
    const backend = new FakeStorage();
    const store = createStore(backend);
    store.addHistoryEntry(entry);
    store.addHistoryEntry(entry);
    expect(store.loadHistory()).toHaveLength(1);
  });

  it('clears everything the app wrote', () => {
    const backend = new FakeStorage();
    const store = createStore(backend);
    store.addHistoryEntry(entry);
    store.saveSettings({ schemaVersion: 1, styleId: 'official', persistEnabled: true });
    expect(store.clearAll()).toBe(true);
    expect(store.loadHistory()).toEqual([]);
    expect(store.loadSettings().persistEnabled).toBe(false);
    expect([...backend.map.keys()]).toEqual([]);
  });

  it('survives corrupt payloads without throwing, and flags them', () => {
    const backend = new FakeStorage();
    backend.map.set(SETTINGS_KEY, '{not json');
    backend.map.set(HISTORY_KEY, '{"nope":true}');
    const store = createStore(backend);
    expect(store.loadSettings()).toEqual({ schemaVersion: 1, styleId: null, persistEnabled: false });
    expect(store.loadHistory()).toEqual([]);
    expect(store.problems.map((problem) => problem.reason)).toContain('corrupt');
  });

  it('treats an unknown schema version as unusable rather than guessing', () => {
    const backend = new FakeStorage();
    backend.map.set(SETTINGS_KEY, JSON.stringify({ schemaVersion: 99, styleId: 'x', persistEnabled: true }));
    const store = createStore(backend);
    expect(store.loadSettings().persistEnabled).toBe(false);
    expect(store.problems.length).toBeGreaterThan(0);
  });

  it('never throws when reads are blocked', () => {
    const backend = new FakeStorage();
    const store = createStore(backend);
    backend.failOnRead = true;
    expect(store.loadSettings()).toEqual({ schemaVersion: 1, styleId: null, persistEnabled: false });
    expect(store.loadHistory()).toEqual([]);
  });
});

describe('createNullStore', () => {
  it('behaves like a browser with storage switched off', () => {
    const store = createNullStore();
    expect(store.available).toBe(false);
    expect(store.saveSettings({ schemaVersion: 1, styleId: null, persistEnabled: true })).toBe(false);
    expect(store.addHistoryEntry(entry)).toBe(false);
    expect(store.clearAll()).toBe(false);
    expect(store.loadHistory()).toEqual([]);
  });
});

describe('parsers', () => {
  it('rejects shapes it does not own', () => {
    expect(parseSettings('[]')).toBeNull();
    expect(parseSettings('{"schemaVersion":1,"styleId":5,"persistEnabled":true}')).toBeNull();
    expect(parseSettings('{"schemaVersion":1,"styleId":null}')).toBeNull();
    expect(parseHistory('{"a":1}')).toBeNull();
    expect(parseHistory('[{"id":"1"}]')).toEqual([]);
  });
});
