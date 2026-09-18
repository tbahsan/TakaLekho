/**
 * Opt-in local storage.
 *
 * Contract (see docs/SCOPE.md):
 * - Nothing is written unless the user turns persistence on.
 * - Only the converted result and the setting are stored. No analytics, no network.
 * - Every failure path (quota, blocked storage, private mode, malformed JSON) must
 *   surface honestly — a failed write is never reported as “saved”.
 * - Clearing removes both keys; a corrupt payload is dropped instead of crashing.
 */

export const SETTINGS_KEY = 'takalekho.settings.v1';
export const HISTORY_KEY = 'takalekho.history.v1';
export const HISTORY_LIMIT = 20;

export type StorageLike = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
};

export type Settings = {
  schemaVersion: 1;
  styleId: string | null;
  persistEnabled: boolean;
};

export type HistoryEntry = {
  id: string;
  /** What the user typed, trimmed, exactly as reviewed. */
  input: string;
  canonical: string;
  groupedBengali: string;
  words: string;
  styleId: string;
  createdAt: string;
};

export type StorageIssue = { reason: 'unavailable' | 'corrupt' | 'blocked' | 'write-failed' };

const DEFAULT_SETTINGS: Settings = { schemaVersion: 1, styleId: null, persistEnabled: false };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isStorageAvailable(backend: StorageLike | null | undefined): boolean {
  if (!backend) return false;
  try {
    const probe = 'takalekho.probe';
    backend.setItem(probe, '1');
    backend.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}

export function parseSettings(raw: string | null): Settings | null {
  if (raw === null) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) return null;
    if (parsed['schemaVersion'] !== 1) return null;
    const styleId = parsed['styleId'];
    const persistEnabled = parsed['persistEnabled'];
    if (styleId !== null && typeof styleId !== 'string') return null;
    if (typeof persistEnabled !== 'boolean') return null;
    return { schemaVersion: 1, styleId, persistEnabled };
  } catch {
    return null;
  }
}

export function parseHistory(raw: string | null): HistoryEntry[] | null {
  if (raw === null) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    const entries: HistoryEntry[] = [];
    for (const item of parsed) {
      if (!isRecord(item)) continue;
      const { id, input, canonical, groupedBengali, words, styleId, createdAt } = item;
      if (
        typeof id !== 'string' ||
        typeof input !== 'string' ||
        typeof canonical !== 'string' ||
        typeof groupedBengali !== 'string' ||
        typeof words !== 'string' ||
        typeof styleId !== 'string' ||
        typeof createdAt !== 'string'
      ) {
        continue;
      }
      entries.push({ id, input, canonical, groupedBengali, words, styleId, createdAt });
    }
    return entries;
  } catch {
    return null;
  }
}

export type Store = {
  /** True when a real, writable backend is present. */
  available: boolean;
  loadSettings(): Settings;
  saveSettings(settings: Settings): boolean;
  loadHistory(): HistoryEntry[];
  addHistoryEntry(entry: Omit<HistoryEntry, 'id' | 'createdAt'>): boolean;
  clearAll(): boolean;
  /** Load/write problems the UI should mention instead of claiming success. */
  problems: StorageIssue[];
};

export function createStore(backend: StorageLike | null | undefined): Store {
  const available = isStorageAvailable(backend);
  const problems: StorageIssue[] = [];

  const readRaw = (key: string): string | null => {
    if (!available || !backend) return null;
    try {
      return backend.getItem(key);
    } catch {
      if (!problems.some((problem) => problem.reason === 'blocked')) {
        problems.push({ reason: 'blocked' });
      }
      return null;
    }
  };

  const writeRaw = (key: string, value: string): boolean => {
    if (!available || !backend) return false;
    try {
      backend.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  };

  const loadSettings = (): Settings => {
    const raw = readRaw(SETTINGS_KEY);
    if (raw === null) return { ...DEFAULT_SETTINGS };
    const parsed = parseSettings(raw);
    if (parsed === null) {
      problems.push({ reason: 'corrupt' });
      return { ...DEFAULT_SETTINGS };
    }
    return parsed;
  };

  const loadHistory = (): HistoryEntry[] => {
    const raw = readRaw(HISTORY_KEY);
    if (raw === null) return [];
    const parsed = parseHistory(raw);
    if (parsed === null) {
      problems.push({ reason: 'corrupt' });
      return [];
    }
    return parsed;
  };

  const addHistoryEntry = (entry: Omit<HistoryEntry, 'id' | 'createdAt'>): boolean => {
    const existing = loadHistory();
    const next: HistoryEntry = {
      ...entry,
      id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
      createdAt: new Date().toISOString(),
    };
    const deduped = existing.filter(
      (item) => !(item.canonical === next.canonical && item.styleId === next.styleId),
    );
    const trimmed = [next, ...deduped].slice(0, HISTORY_LIMIT);
    return writeRaw(HISTORY_KEY, JSON.stringify(trimmed));
  };

  const clearAll = (): boolean => {
    if (!available || !backend) return false;
    let ok = true;
    for (const key of [SETTINGS_KEY, HISTORY_KEY]) {
      try {
        backend.removeItem(key);
      } catch {
        ok = false;
      }
    }
    return ok;
  };

  return {
    available,
    loadSettings,
    saveSettings: (settings) => writeRaw(SETTINGS_KEY, JSON.stringify(settings)),
    loadHistory,
    addHistoryEntry,
    clearAll,
    problems,
  };
}

/** In-memory fallback so the UI always has a store object, even without storage. */
export function createNullStore(): Store {
  return createStore(null);
}
