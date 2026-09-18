import { describe, expect, it } from 'vitest';
import golden from '../fixtures/golden.json';
import { convertAmount, numWordsTable, validateWordTable } from '../../src/engine/index.ts';
import { parseAmount, type ParseErrorCode } from '../../src/engine/parse.ts';
import {
  bengaliToLatin,
  groupDomestic,
  hasBengaliDigits,
  hasLatinDigits,
  latinToBengali,
} from '../../src/engine/digits.ts';

type AcceptedCase = { input: string; official: string; colloquial: string };
type RejectedCase = { input: string; code: string };

describe('parseAmount — accepted inputs', () => {
  it.each(golden.accepted as AcceptedCase[])('$input parses', ({ input }) => {
    const parsed = parseAmount(input);
    expect(parsed.ok).toBe(true);
  });

  it('keeps the canonical value free of grouping and leading zeros', () => {
    const arabicIndic = parseAmount('١٢٣');
    if (arabicIndic.ok) throw new Error('expected rejection');
    expect(arabicIndic.error.code).toBe('INVALID_CHARACTER');

    const ok = parseAmount('১২,৪৫০.৫০');
    if (!ok.ok) throw new Error('expected parse');
    expect(ok.canonical).toBe('12450.50');
    expect(ok.integerPart).toBe('12450');
    expect(ok.fractionPart).toBe('50');
    expect(ok.groupedBengali).toBe('১২,৪৫০.৫০');
    expect(ok.groupedLatin).toBe('12,450.50');
  });

  it('hints domestic grouping only when the user typed an ungrouped long number', () => {
    const hinted = parseAmount('100000');
    if (!hinted.ok) throw new Error('expected parse');
    expect(hinted.groupingHint).toEqual({ bengali: '১,০০,০০০', latin: '1,00,000' });

    const alreadyGrouped = parseAmount('1,00,000');
    if (!alreadyGrouped.ok) throw new Error('expected parse');
    expect(alreadyGrouped.groupingHint).toBeUndefined();

    // 5 digits read the same either way, so no hint is shown.
    const small = parseAmount('12450');
    if (!small.ok) throw new Error('expected parse');
    expect(small.groupingHint).toBeUndefined();

    // 6 digits are where the two conventions diverge.
    const diverging = parseAmount('100000');
    if (!diverging.ok) throw new Error('expected parse');
    expect(diverging.groupingHint).toEqual({ bengali: '১,০০,০০০', latin: '1,00,000' });
  });

  it('pads the poisha part to two digits without changing its value', () => {
    const oneDigit = parseAmount('12.5');
    const twoDigits = parseAmount('12.50');
    if (!oneDigit.ok || !twoDigits.ok) throw new Error('expected parse');
    expect(oneDigit.fractionPart).toBe('50');
    expect(twoDigits.fractionPart).toBe('50');
    expect(oneDigit.canonical).toBe('12.5');
    expect(twoDigits.canonical).toBe('12.50');
  });
});

describe('parseAmount — rejected inputs', () => {
  it.each(golden.rejected as RejectedCase[])('$input → $code', ({ input, code }) => {
    const parsed = parseAmount(input);
    expect(parsed.ok).toBe(false);
    if (parsed.ok) return;
    expect(parsed.error.code).toBe(code);
    expect(parsed.error.message.length).toBeGreaterThan(0);
    expect(parsed.error.hint.length).toBeGreaterThan(0);
  });

  it('every error code in the fixture exists in the error catalogue', () => {
    const catalogue = new Set(Object.keys(ERROR_CODES));
    for (const item of golden.rejected as RejectedCase[]) {
      expect(catalogue.has(item.code as ParseErrorCode)).toBe(true);
    }
  });
});

describe('parseAmount — boundary behaviour', () => {
  it('accepts the documented maximum and rejects one poisha more', () => {
    const max = parseAmount('৯৯,৯৯,৯৯,৯৯৯.৯৯');
    expect(max.ok).toBe(true);
    if (!max.ok) return;
    expect(max.canonical).toBe('999999999.99');

    const tooBig = parseAmount('৯৯,৯৯,৯৯,৯৯৯.৯৯৯');
    if (tooBig.ok) throw new Error('expected rejection');
    expect(tooBig.error.code).toBe('DECIMAL_DIGITS');

    // A ten-digit amount is out of range; a nine-digit one is still inside it.
    const oneMoreTaka = parseAmount('1000000000');
    if (oneMoreTaka.ok) throw new Error('expected rejection');
    expect(oneMoreTaka.error.code).toBe('OUT_OF_RANGE');

    const nineDigits = parseAmount('100000000');
    expect(nineDigits.ok).toBe(true);
    if (!nineDigits.ok) return;
    expect(nineDigits.canonical).toBe('100000000');
    expect(nineDigits.groupedBengali).toBe('১০,০০,০০,০০০');
  });

  it('rejects inputs longer than the declared cap', () => {
    const parsed = parseAmount('1'.repeat(80));
    if (parsed.ok) throw new Error('expected rejection');
    expect(parsed.error.code).toBe('TOO_LONG');
  });

  it('tolerates outer whitespace and a single leading ৳', () => {
    expect(parseAmount('  12.50  ').ok).toBe(true);
    expect(parseAmount('৳12.50').ok).toBe(true);
    expect(parseAmount('৳ 12.50').ok).toBe(true);
  });

  it('is deterministic: identical input always yields identical output', () => {
    const first = convertAmount('1,23,45,678.90', 'official');
    const second = convertAmount('1,23,45,678.90', 'official');
    expect(first).toEqual(second);
  });
});

describe('digit helpers', () => {
  it('round-trips Bengali and Latin digits', () => {
    expect(bengaliToLatin('০১২৩৪৫৬৭৮৯')).toBe('0123456789');
    expect(latinToBengali('0123456789')).toBe('০১২৩৪৫৬৭৮৯');
    expect(bengaliToLatin(latinToBengali('123'))).toBe('123');
  });

  it('detects scripts independently', () => {
    expect(hasBengaliDigits('১২')).toBe(true);
    expect(hasBengaliDigits('12')).toBe(false);
    expect(hasLatinDigits('12')).toBe(true);
    expect(hasLatinDigits('১২')).toBe(false);
  });

  it('groups ০–৯ digits with the domestic convention', () => {
    expect(groupDomestic('0')).toBe('0');
    expect(groupDomestic('999')).toBe('999');
    expect(groupDomestic('1000')).toBe('1,000');
    expect(groupDomestic('12450')).toBe('12,450');
    expect(groupDomestic('100000')).toBe('1,00,000');
    expect(groupDomestic('12345678')).toBe('1,23,45,678');
  });
});

describe('word table integrity', () => {
  it('passes the table validation rules', () => {
    expect(validateWordTable(numWordsTable)).toEqual([]);
  });

  it('holds exactly one default style and it is দাপ্তরিক', () => {
    const defaults = Object.values(numWordsTable.variants).filter((variant) => variant.default);
    expect(defaults).toHaveLength(1);
    expect(defaults[0]?.id).toBe('official');
  });

  it('does not put “ও” or “মাত্র” inside data entries', () => {
    for (const word of numWordsTable.words0to99) {
      expect(word).not.toBe('ও');
      expect(word).not.toContain('মাত্র');
      expect(word).not.toContain('টাকা');
    }
  });

  it('declares an honest review status', () => {
    expect(numWordsTable.reviewStatus).toBe('pending-independent-review');
    expect(numWordsTable.reviewedAt).toBeNull();
    expect(numWordsTable.reviewer).toBeNull();
    expect(numWordsTable.license).toBe('MIT');
  });
});

/* Kept local to this file so the fixture check cannot drift from the engine. */
const ERROR_CODES: Record<ParseErrorCode, true> = {
  EMPTY_INPUT: true,
  TOO_LONG: true,
  INVALID_CHARACTER: true,
  MIXED_DIGIT_SCRIPT: true,
  CURRENCY_SYMBOL_POSITION: true,
  WHITESPACE_INSIDE: true,
  NEGATIVE_NOT_SUPPORTED: true,
  SIGN_NOT_SUPPORTED: true,
  EXPONENT_NOT_SUPPORTED: true,
  GROUPING_UNSUPPORTED: true,
  GROUP_INVALID: true,
  LEADING_ZERO: true,
  DECIMAL_POINT_REPEATED: true,
  DECIMAL_POINT_NO_DIGITS: true,
  DECIMAL_POINT_MISSING_ZERO: true,
  DECIMAL_DIGITS: true,
  OUT_OF_RANGE: true,
  UNIT_WORD_IN_INPUT: true,
};
