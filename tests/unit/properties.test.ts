import { describe, expect, it } from 'vitest';
import golden from '../fixtures/golden.json';
import examples from '../../src/data/examples.bn.json';
import { convertAmount, numWordsTable } from '../../src/engine/index.ts';
import { parseAmount } from '../../src/engine/parse.ts';
import { groupDomestic, latinToBengali } from '../../src/engine/digits.ts';

/**
 * Property/invariant tests. These are the checks the roadmap asks for beyond
 * golden fixtures: untouched text, equivalent scripts, non-rounding, and
 * agreement between the engine, the fixture file and the documented examples.
 */

type AcceptedCase = { input: string; official: string; colloquial: string };

describe('invariants across the whole accepted range', () => {
  it('keeps every golden case consistent with the engine output', () => {
    for (const item of golden.accepted as AcceptedCase[]) {
      expect(convertAmount(item.input, 'official')).toMatchObject({ ok: true, words: item.official });
      expect(convertAmount(item.input, 'colloquial')).toMatchObject({ ok: true, words: item.colloquial });
    }
  });

  it('never rounds: outcome is identical whether the fraction is typed as 1 or 2 digits', () => {
    for (let poisha = 0; poisha <= 9; poisha += 1) {
      const oneDigit = convertAmount(`5.${poisha}`, 'official');
      const twoDigits = convertAmount(`5.${poisha}0`, 'official');
      if (!oneDigit.ok || !twoDigits.ok) throw new Error('expected parse');
      expect(oneDigit.words).toBe(twoDigits.words);
      expect(oneDigit.canonical).toBe(`5.${poisha}`);
      expect(twoDigits.canonical).toBe(`5.${poisha}0`);
    }
  });

  it('never rounds: every 0.01–0.99 step keeps the integer part untouched', () => {
    for (let poisha = 1; poisha <= 99; poisha += 1) {
      const fraction = String(poisha).padStart(2, '0');
      const result = convertAmount(`7.${fraction}`, 'official');
      if (!result.ok) throw new Error(`7.${fraction} should parse`);
      expect(result.words.startsWith('সাত টাকা')).toBe(true);
      expect(result.words.endsWith('মাত্র')).toBe(true);
      expect(result.words).not.toContain('সাত টাকা টাকা');
    }
  });

  it('produces the same words for equivalent digit scripts', () => {
    const pairs: Array<[string, string]> = [
      ['0', '০'],
      ['7', '৭'],
      ['12450', '১২৪৫০'],
      ['1,23,45,678', '১,২৩,৪৫,৬৭৮'],
      ['99,99,99,999.99', '৯৯,৯৯,৯৯,৯৯৯.৯৯'],
    ];
    for (const [latin, bengali] of pairs) {
      const a = convertAmount(latin, 'official');
      const b = convertAmount(bengali, 'official');
      if (!a.ok || !b.ok) throw new Error(`${latin} / ${bengali} should parse`);
      expect(b.words).toBe(a.words);
      expect(a.words.length).toBeGreaterThan(0);
    }
  });

  it('produces the same words with and without a ৳ prefix', () => {
    expect(convertAmount('৳12450', 'official')).toMatchObject({
      ok: true,
      words: 'বারো হাজার চারশত পঞ্চাশ টাকা মাত্র',
    });
  });

  it('output contains no digits, no Latin letters and only single spaces', () => {
    const inputs = ['0', '12.05', '12450', '1,23,45,678.99', '৯৯,৯৯,৯৯,৯৯৯.৯৯'];
    for (const input of inputs) {
      for (const style of ['official', 'colloquial']) {
        const result = convertAmount(input, style);
        if (!result.ok) throw new Error(`${input} should parse`);
        expect(result.words).not.toMatch(/[0-9০-৯]/u);
        expect(result.words).not.toMatch(/[A-Za-z]/);
        expect(result.words).not.toMatch(/\s{2,}/);
        expect(result.words.trim()).toBe(result.words);
      }
    }
  });

  it('always ends with the currency unit (or the unit of the last clause)', () => {
    for (const input of ['0', '5', '12.5', '12450.99']) {
      const result = convertAmount(input, 'official');
      if (!result.ok) throw new Error(input);
      expect(result.words.endsWith('মাত্র')).toBe(true);
      expect(result.words).toMatch(/টাকা/u);
    }
  });

  it('is monotonically decomposable: adding a group never removes a smaller group', () => {
    const big = convertAmount('1,23,45,678', 'official');
    if (!big.ok) throw new Error('expected parse');
    expect(big.words).toContain('কোটি');
    expect(big.words).toContain('লাখ');
    expect(big.words).toContain('হাজার');
    expect(big.words).toContain('শত');
  });

  it('covers every 0–99 word through the engine (not only through the table)', () => {
    for (let value = 0; value <= 99; value += 1) {
      const result = convertAmount(String(value), 'official');
      if (!result.ok) throw new Error(String(value));
      const expectedWord = numWordsTable.words0to99[value];
      expect(result.words.startsWith(`${expectedWord} টাকা`)).toBe(true);
    }
  });

  it('covers every hundred 100–900', () => {
    for (let hundreds = 1; hundreds <= 9; hundreds += 1) {
      const result = convertAmount(String(hundreds * 100), 'official');
      if (!result.ok) throw new Error(String(hundreds));
      expect(result.words.endsWith('টাকা মাত্র')).toBe(true);
      expect(result.words).toContain('শত');
    }
  });

  it('grouped display always equals the domestic grouping of the canonical value', () => {
    for (const item of golden.accepted as AcceptedCase[]) {
      const parsed = parseAmount(item.input);
      if (!parsed.ok) throw new Error(item.input);
      const [integer = '', fraction] = parsed.canonical.split('.');
      const expectedBengali = latinToBengali(groupDomestic(integer));
      expect(parsed.groupedBengali.startsWith(expectedBengali)).toBe(true);
      if (fraction) expect(parsed.groupedBengali.endsWith(`.${latinToBengali(fraction)}`)).toBe(true);
    }
  });
});

describe('documented examples in the UI data file', () => {
  it('every accepted example really converts and is covered by the golden fixture', () => {
    const goldenInputs = new Set((golden.accepted as AcceptedCase[]).map((item) => item.input));
    for (const example of examples.accepted) {
      const result = convertAmount(example.input, 'official');
      expect(result.ok).toBe(true);
      expect(goldenInputs.has(example.input)).toBe(true);
    }
  });

  it('every rejected example really fails with the documented error code', () => {
    const codes = new Map(
      (golden.rejected as Array<{ input: string; code: string }>).map((item) => [item.input, item.code]),
    );
    for (const example of examples.rejected) {
      const result = convertAmount(example.input, 'official');
      expect(result.ok).toBe(false);
      if (result.ok) continue;
      expect(result.error.code).toBe(example.code);
      expect(codes.get(example.input)).toBe(example.code);
    }
  });

  it('has a non-empty Bengali note for every example row', () => {
    for (const example of examples.accepted) {
      expect(example.note.trim().length).toBeGreaterThan(0);
    }
    for (const example of examples.rejected) {
      expect(example.why.trim().length).toBeGreaterThan(0);
    }
  });
});
