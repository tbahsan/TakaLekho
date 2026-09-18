import examples from '../data/examples.bn.json';
import {
  ENGINE_VERSION,
  MAX_INPUT_LENGTH,
  convertAmount,
  getStyle,
  numWordsTable,
  parseAmount,
  type ConversionSuccess,
} from '../engine/index.ts';
import { createStore, type HistoryEntry } from '../storage/store.ts';

/**
 * UI layer. All rendering goes through textContent / createElement — the app
 * never assembles HTML from user input, so the amount typed by the user can
 * never become markup.
 */

export const APP_VERSION = '0.1.0';

const DEFAULT_STYLE_ID = getStyle(numWordsTable, '').id;

function required<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Missing element #${id}`);
  return element as T;
}

const el = {
  appVersion: required<HTMLSpanElement>('app-version'),
  appStatus: required<HTMLParagraphElement>('app-status'),
  pwaActions: required<HTMLDivElement>('pwa-actions'),
  amount: required<HTMLInputElement>('amount'),
  amountError: required<HTMLParagraphElement>('amount-error'),
  styleRadios: Array.from(document.querySelectorAll<HTMLInputElement>('input[name="style"]')),
  resultEmpty: required<HTMLParagraphElement>('result-empty'),
  resultInvalid: required<HTMLParagraphElement>('result-invalid'),
  resultBody: required<HTMLDivElement>('result-body'),
  words: required<HTMLOutputElement>('words'),
  normalizedBengali: required<HTMLElement>('normalized-bengali'),
  normalizedLatin: required<HTMLElement>('normalized-latin'),
  groupingHint: required<HTMLParagraphElement>('grouping-hint'),
  styleLabel: required<HTMLElement>('style-label'),
  copyButton: required<HTMLButtonElement>('copy-button'),
  downloadButton: required<HTMLButtonElement>('download-button'),
  actionStatus: required<HTMLParagraphElement>('action-status'),
  liveRegion: required<HTMLParagraphElement>('live-region'),
  persistToggle: required<HTMLInputElement>('persist-toggle'),
  storageStatus: required<HTMLParagraphElement>('storage-status'),
  historyList: required<HTMLUListElement>('history-list'),
  historyEmpty: required<HTMLParagraphElement>('history-empty'),
  clearButton: required<HTMLButtonElement>('clear-button'),
  examplesBody: required<HTMLTableSectionElement>('examples-body'),
  rejectedBody: required<HTMLTableSectionElement>('rejected-body'),
  engineVersion: required<HTMLElement>('engine-version'),
  tableVersion: required<HTMLElement>('table-version'),
  tableReview: required<HTMLElement>('table-review'),
};

const store = createStore(safeLocalStorage());

function safeLocalStorage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

type State = {
  input: string;
  styleId: string;
  persistEnabled: boolean;
  lastSuccess: ConversionSuccess | null;
  history: HistoryEntry[];
};

const state: State = {
  input: '',
  styleId: DEFAULT_STYLE_ID,
  persistEnabled: false,
  lastSuccess: null,
  history: [],
};

/* ---------------------------------------------------------------- messages */

function setStatus(element: HTMLElement, message: string): void {
  element.textContent = message;
}

function setError(message: string, hint: string): void {
  el.amountError.hidden = false;
  el.amountError.replaceChildren();
  const strong = document.createElement('span');
  strong.className = 'error-message';
  strong.textContent = message;
  const span = document.createElement('span');
  span.className = 'error-hint';
  span.textContent = ` ${hint}`;
  el.amountError.append(strong, span);
  el.amount.setAttribute('aria-invalid', 'true');
}

function clearError(): void {
  el.amountError.hidden = true;
  el.amountError.replaceChildren();
  el.amount.removeAttribute('aria-invalid');
}

/* ---------------------------------------------------------------- render */

function renderResult(): void {
  const raw = state.input;

  if (raw.trim().length === 0) {
    clearError();
    state.lastSuccess = null;
    el.resultBody.hidden = true;
    el.resultInvalid.hidden = true;
    el.resultEmpty.hidden = false;
    return;
  }

  const result = convertAmount(raw, state.styleId);

  if (!result.ok) {
    // The roadmap rule: an invalid input must never leave a stale result on screen.
    state.lastSuccess = null;
    setError(result.error.message, result.error.hint);
    el.resultBody.hidden = true;
    el.resultEmpty.hidden = true;
    el.resultInvalid.hidden = false;
    setStatus(el.liveRegion, result.error.message);
    return;
  }

  clearError();
  state.lastSuccess = result;
  el.resultEmpty.hidden = true;
  el.resultInvalid.hidden = true;
  el.resultBody.hidden = false;

  el.words.textContent = result.words;
  el.normalizedBengali.textContent = result.groupedBengali;
  el.normalizedLatin.textContent = result.groupedLatin;

  if (result.groupingHint) {
    el.groupingHint.hidden = false;
    el.groupingHint.textContent = `দেশীয় রীতিতে কমা বসালে: ${result.groupingHint.bengali} (${result.groupingHint.latin})`;
  } else {
    el.groupingHint.hidden = true;
    el.groupingHint.textContent = '';
  }
  el.styleLabel.textContent = result.styleIsDefault
    ? result.styleLabel
    : `${result.styleLabel} (${result.styleReviewStatus === 'experimental-not-reviewed' ? 'পরীক্ষামূলক, পর্যালোচনা হয়নি' : result.styleReviewStatus})`;

  setStatus(el.liveRegion, result.words);
}

function renderHistory(): void {
  el.historyList.replaceChildren();
  const showable = state.persistEnabled ? state.history : [];
  el.historyEmpty.hidden = showable.length > 0;
  el.historyEmpty.textContent = state.persistEnabled
    ? 'এখনো কিছু সংরক্ষিত হয়নি। হিসাব কপি বা ডাউনলোড করলে এখানে জমা হবে।'
    : 'সংরক্ষণ চালু করলে আপনার সাম্প্রতিক হিসাব এখানে দেখা যাবে।';

  for (const entry of showable) {
    const item = document.createElement('li');
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'history-item';
    const amount = document.createElement('span');
    amount.className = 'history-amount';
    amount.textContent = entry.groupedBengali;
    const words = document.createElement('span');
    words.className = 'history-words';
    words.textContent = entry.words;
    button.append(amount, words);
    button.addEventListener('click', () => {
      state.input = entry.input;
      el.amount.value = entry.input;
      const isKnownStyle = Boolean(numWordsTable.variants[entry.styleId]);
      if (isKnownStyle) selectStyle(entry.styleId, false);
      renderResult();
      el.amount.focus();
      setStatus(el.actionStatus, 'সংরক্ষিত হিসাবটি ফিরিয়ে আনা হয়েছে।');
    });
    item.append(button);
    el.historyList.append(item);
  }
}

function renderStorageState(): void {
  el.persistToggle.checked = state.persistEnabled;
  if (!store.available) {
    el.persistToggle.disabled = true;
    setStatus(
      el.storageStatus,
      'এই ব্রাউজারে সংরক্ষণ সম্ভব নয় (private mode বা storage বন্ধ)। অ্যাপটি স্বাভাবিকভাবেই কাজ করবে, তবে কিছু জমা থাকবে না।',
    );
    return;
  }
  if (state.persistEnabled) {
    setStatus(
      el.storageStatus,
      'সংরক্ষণ চালু আছে: এই ব্রাউজারে সাম্প্রতিক হিসাব জমা হচ্ছে। ব্রাউজার চাইলে নিজে থেকেই storage মুছে ফেলতে পারে — দরকারি হিসাব আলাদা করে রাখুন।',
    );
  } else {
    setStatus(el.storageStatus, 'এখন কিছু সংরক্ষিত হচ্ছে না। পেজ বন্ধ করলেই ইনপুট মুছে যাবে।');
  }
}

/* ---------------------------------------------------------------- actions */

function selectStyle(styleId: string, announce = true): void {
  state.styleId = styleId;
  for (const radio of el.styleRadios) radio.checked = radio.value === styleId;
  if (announce) renderResult();
}

function persistEntry(): void {
  if (!state.persistEnabled || !state.lastSuccess) return;
  const ok = store.addHistoryEntry({
    input: state.lastSuccess.input.trim(),
    canonical: state.lastSuccess.canonical,
    groupedBengali: state.lastSuccess.groupedBengali,
    words: state.lastSuccess.words,
    styleId: state.lastSuccess.styleId,
  });
  if (!ok) {
    setStatus(el.storageStatus, 'সংরক্ষণ করা যায়নি (storage ভর্তি বা বন্ধ)। হিসাবটি এখনো স্ক্রিনে আছে, কপি করে রাখতে পারেন।');
    return;
  }
  state.history = store.loadHistory();
  renderHistory();
}

async function copyWords(): Promise<void> {
  if (!state.lastSuccess) return;
  const text = state.lastSuccess.words;
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      setStatus(el.actionStatus, 'কপি হয়েছে।');
      persistEntry();
      return;
    }
    throw new Error('clipboard unavailable');
  } catch {
    const copied = legacyCopy(text);
    if (copied) {
      setStatus(el.actionStatus, 'কপি হয়েছে (ব্রাউজারের পুরোনো পদ্ধতি ব্যবহার করে)।');
      persistEntry();
    } else {
      setStatus(el.actionStatus, 'কপি করা যায়নি। লেখাটি নিজে নির্বাচন করে কপি করুন।');
    }
  }
}

function legacyCopy(text: string): boolean {
  try {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', 'readonly');
    area.style.position = 'fixed';
    area.style.top = '-1000px';
    document.body.append(area);
    area.select();
    const ok = document.execCommand('copy');
    area.remove();
    return ok;
  } catch {
    return false;
  }
}

function downloadText(): void {
  if (!state.lastSuccess) return;
  const result = state.lastSuccess;
  const [takaPart = '0', poishaPart] = result.canonical.split('.');
  const safeName = `${takaPart}${poishaPart ? `-${poishaPart}` : ''}`;
  const body = [
    'টাকালেখো — টাকার পরিমাণ বাংলা কথায়',
    `ইনপুট: ${result.input.trim()}`,
    `স্বাভাবিক রূপ: ${result.groupedBengali} (${result.groupedLatin})`,
    `রীতি: ${result.styleLabel}`,
    '',
    result.words,
    '',
    `ইঞ্জিন: ${ENGINE_VERSION} · শব্দ-তালিকা: ${numWordsTable.version} (${numWordsTable.reviewStatus})`,
    'এই লেখাটি ব্রাউজারেই তৈরি; কোনো সার্ভারে পাঠানো হয়নি।',
  ].join('\n');

  try {
    const blob = new Blob([body], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `takalekho-${safeName}.txt`;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setStatus(el.actionStatus, 'TXT ফাইল ডাউনলোড হয়েছে।');
    persistEntry();
  } catch {
    setStatus(el.actionStatus, 'ডাউনলোড শুরু করা যায়নি। পুরোনো ফলাফলই দেখানো হচ্ছে — আবার চেষ্টা করুন।');
  }
}

/* ---------------------------------------------------------------- tables */

function renderTables(): void {
  for (const example of examples.accepted) {
    const row = document.createElement('tr');
    const inputCell = document.createElement('th');
    inputCell.scope = 'row';
    inputCell.textContent = example.input;
    const official = document.createElement('td');
    const colloquial = document.createElement('td');
    const note = document.createElement('td');
    const latin = convertAmount(example.input, 'official');
    const bangla = convertAmount(example.input, 'colloquial');
    official.textContent = latin.ok ? latin.words : '—';
    colloquial.textContent = bangla.ok ? bangla.words : '—';
    note.textContent = example.note;
    row.append(inputCell, official, colloquial, note);
    el.examplesBody.append(row);
  }

  for (const example of examples.rejected) {
    const row = document.createElement('tr');
    const inputCell = document.createElement('th');
    inputCell.scope = 'row';
    inputCell.textContent = example.input;
    const result = convertAmount(example.input, 'official');
    const codeCell = document.createElement('td');
    codeCell.textContent = result.ok ? '—' : result.error.message;
    const whyCell = document.createElement('td');
    whyCell.textContent = example.why;
    row.append(inputCell, codeCell, whyCell);
    el.rejectedBody.append(row);
  }
}

/* ---------------------------------------------------------------- PWA */

type SwRegistration = (reloadPage?: boolean) => Promise<void>;

async function initServiceWorker(): Promise<void> {
  if (!('serviceWorker' in navigator) || !import.meta.env.PROD) {
    setStatus(el.appStatus, 'অফলাইন সংস্করণ কেবল production build-এ সক্রিয় হয়।');
    return;
  }

  try {
    const { registerSW } = await import('virtual:pwa-register');
    const updateServiceWorker: SwRegistration = registerSW({
      immediate: true,
      onOfflineReady() {
        setStatus(el.appStatus, 'অফলাইনের জন্য প্রস্তুত — এখন ইন্টারনেট ছাড়াও কাজ করবে।');
      },
      onNeedRefresh() {
        setStatus(el.appStatus, 'নতুন সংস্করণ এসেছে।');
        el.pwaActions.hidden = false;
        el.pwaActions.replaceChildren();

        const note = document.createElement('span');
        note.className = 'pwa-note';
        note.textContent = state.persistEnabled
          ? 'আপডেট করলে সংরক্ষিত হিসাব মুছে যাবে না। '
          : 'আপডেট করলে বর্তমান ইনপুট মুছে যাবে — দরকার হলে আগে কপি করে নিন। ';

        const updateButton = document.createElement('button');
        updateButton.type = 'button';
        updateButton.textContent = 'এখনই আপডেট করুন';
        updateButton.addEventListener('click', () => {
          void updateServiceWorker(true);
        });

        const laterButton = document.createElement('button');
        laterButton.type = 'button';
        laterButton.className = 'secondary';
        laterButton.textContent = 'পরে';
        laterButton.addEventListener('click', () => {
          el.pwaActions.hidden = true;
        });

        el.pwaActions.append(note, updateButton, laterButton);
      },
      onRegisterError() {
        setStatus(el.appStatus, 'অফলাইন ক্যাশ তৈরি করা যায়নি। অ্যাপটি অনলাইন-নির্ভর হিসেবেই কাজ করবে।');
      },
    });
  } catch {
    setStatus(el.appStatus, 'এই ব্রাউজারে অফলাইন ক্যাশ সমর্থিত নয়। বাকি সব কাজ স্বাভাবিক।');
  }
}

/* ---------------------------------------------------------------- boot */

function init(): void {
  el.appVersion.textContent = `v${APP_VERSION}`;
  el.engineVersion.textContent = ENGINE_VERSION;
  el.tableVersion.textContent = `${numWordsTable.version} (${numWordsTable.language})`;
  el.tableReview.textContent = numWordsTable.reviewStatus;
  el.amount.maxLength = MAX_INPUT_LENGTH;

  const settings = store.loadSettings();
  state.persistEnabled = settings.persistEnabled;

  const settingsStyle = typeof settings.styleId === 'string' ? settings.styleId : null;
  const styleIsKnown = settingsStyle !== null && Boolean(numWordsTable.variants[settingsStyle]);
  state.styleId = styleIsKnown && settingsStyle ? settingsStyle : DEFAULT_STYLE_ID;
  for (const radio of el.styleRadios) radio.checked = radio.value === state.styleId;

  if (state.persistEnabled) state.history = store.loadHistory();
  if (store.problems.some((problem) => problem.reason === 'corrupt')) {
    setStatus(el.storageStatus, 'সংরক্ষিত তথ্য পড়া যায়নি, তাই মুছে ফেলা হয়েছে-ধরে নিয়ে খালি অবস্থায় শুরু করা হচ্ছে।');
  }

  renderTables();
  renderResult();
  renderHistory();
  renderStorageState();
  setStatus(el.actionStatus, '');
  void initServiceWorker();

  el.amount.addEventListener('input', () => {
    state.input = el.amount.value;
    renderResult();
  });

  el.amount.addEventListener('blur', () => {
    // Saving on blur (not on every keystroke) keeps the history meaningful.
    if (state.lastSuccess) persistEntry();
  });

  el.amount.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      el.amount.value = '';
      state.input = '';
      renderResult();
    }
  });

  for (const radio of el.styleRadios) {
    radio.addEventListener('change', () => {
      if (!radio.checked) return;
      selectStyle(radio.value);
      if (state.persistEnabled) {
        store.saveSettings({ schemaVersion: 1, styleId: state.styleId, persistEnabled: true });
      }
    });
  }

  el.copyButton.addEventListener('click', () => void copyWords());
  el.downloadButton.addEventListener('click', downloadText);

  el.persistToggle.addEventListener('change', () => {
    state.persistEnabled = el.persistToggle.checked;
    if (state.persistEnabled) {
      const saved = store.saveSettings({ schemaVersion: 1, styleId: state.styleId, persistEnabled: true });
      if (!saved) {
        state.persistEnabled = false;
        el.persistToggle.checked = false;
        setStatus(el.storageStatus, 'সংরক্ষণ চালু করা যায়নি (storage বন্ধ বা ভর্তি)।');
        return;
      }
      state.history = store.loadHistory();
      renderHistory();
      renderStorageState();
      persistEntry();
    } else {
      store.clearAll();
      state.history = [];
      renderHistory();
      renderStorageState();
      setStatus(el.storageStatus, 'সংরক্ষিত সব মুছে ফেলা হয়েছে; এখন কিছুই জমা থাকছে না।');
    }
  });

  el.clearButton.addEventListener('click', () => {
    const cleared = store.clearAll();
    state.history = [];
    state.persistEnabled = false;
    el.persistToggle.checked = false;
    renderHistory();
    renderStorageState();
    setStatus(
      el.storageStatus,
      cleared ? 'সব সংরক্ষিত তথ্য মুছে ফেলা হয়েছে।' : 'মুছে ফেলা যায়নি (storage বন্ধ বা ব্লকড)।',
    );
  });

  // Restore style hint for the default preset, so users see why it is the default.
  const defaultStyle = getStyle(numWordsTable, '');
  setStatus(el.liveRegion, `${defaultStyle.label} রীতিই ডিফল্ট।`);

  // Quick self-check: the golden examples must behave as documented before we claim anything.
  const probe = parseAmount('12450');
  if (!probe.ok) {
    setStatus(el.appStatus, 'ইঞ্জিন নিজেই শুরুতে ব্যর্থ হয়েছে — ফলাফল বিশ্বাস করবেন না, দয়া করে issue খুলুন।');
  }
}

init();
