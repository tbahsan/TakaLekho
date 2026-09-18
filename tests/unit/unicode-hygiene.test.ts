import { describe, expect, it } from 'vitest';
import golden from '../fixtures/golden.json';
import examples from '../../src/data/examples.bn.json';
import numWords from '../../src/data/numwords.bn.json';
import { numWordsTable } from '../../src/engine/index.ts';

/**
 * Unicode hygiene for the shipped data.
 *
 * Rule: every string in the reviewable data must be NFC-normalised, and must not
 * contain invisible or joiner characters.
 *
 * Bengali “য়” is a trap here: U+09DF (BENGALI LETTER YYA) has a canonical
 * decomposition and is a composition exclusion, so
 *     NFC(U+09DF) === U+09AF U+09BC
 * i.e. the *decomposed* sequence is the normal form. An earlier version of this
 * test demanded U+09DF and therefore flagged correct data — the invariant that
 * actually matters is “one deterministic form everywhere”, which NFC gives us.
 */

const INVISIBLE = /[\u200B\u200C\u200D\uFEFF\u00AD\u2060]/u;
/** ZWJ/ZWNJ are meaningful in other scripts but must never appear in this data. */
const JOINERS = /[\u200C\u200D]/u;

function collectStrings(node: unknown, path: string[] = []): Array<{ path: string; value: string }> {
  if (typeof node === 'string') return [{ path: path.join('.'), value: node }];
  if (Array.isArray(node)) return node.flatMap((item, index) => collectStrings(item, [...path, String(index)]));
  if (typeof node === 'object' && node !== null) {
    return Object.entries(node as Record<string, unknown>).flatMap(([key, value]) =>
      collectStrings(value, [...path, key]),
    );
  }
  return [];
}

const dataFiles: Array<[string, unknown]> = [
  ['numwords.bn.json', numWords],
  ['examples.bn.json', examples],
  ['golden.json', golden],
];

describe('data files are Unicode-clean', () => {
  it.each(dataFiles)('%s contains no invisible or joiner characters', (_name, file) => {
    for (const { path, value } of collectStrings(file)) {
      expect(INVISIBLE.test(value), `${path} contains an invisible character`).toBe(false);
      expect(JOINERS.test(value), `${path} contains a ZWJ/ZWNJ`).toBe(false);
    }
  });

  it.each(dataFiles)('%s is NFC-normalised (so য় has one deterministic form)', (_name, file) => {
    for (const { path, value } of collectStrings(file)) {
      expect(value, `${path} is not NFC-normalised`).toBe(value.normalize('NFC'));
    }
  });

  it('documents the Bengali য় normal form so the rule cannot be “fixed” the wrong way', () => {
    // Guards the assumption: if a future Unicode version changed this, the test
    // above would silently start demanding a different byte sequence.
    expect('\u09df'.normalize('NFC')).toBe('\u09af\u09bc');
    expect('\u09af\u09bc'.normalize('NFC')).toBe('\u09af\u09bc');
  });

  it.each(dataFiles)('%s strings contain no double spaces and no stray whitespace', (_name, file) => {
    for (const { path, value } of collectStrings(file)) {
      // Intentional invalid inputs (`"   "`, `"12 450"`) live in the fixtures.
      if (path.endsWith('input')) continue;
      expect(/\s{2,}/.test(value), `${path} has repeated whitespace`).toBe(false);
      expect(value, `${path} is not trimmed`).toBe(value.trim());
    }
  });

  it('every Bengali letter in the word table is a Bengali-script or ASCII character', () => {
    const allowed = /^[\u0980-\u09FF\u09E6-\u09EF\u0964\u0965\s,.\u09F3\u09F2A-Za-z0-9()/-]*$/u;
    for (const word of numWordsTable.words0to99) {
      expect(allowed.test(word), `unexpected character in “${word}”`).toBe(true);
    }
  });

  it('the word table has no duplicate words (two numbers must not share one spelling)', () => {
    const seen = new Map<string, number>();
    numWordsTable.words0to99.forEach((word, index) => {
      const previous = seen.get(word);
      expect(previous, `“${word}” is used for both ${previous} and ${index}`).toBeUndefined();
      seen.set(word, index);
    });
  });
});
