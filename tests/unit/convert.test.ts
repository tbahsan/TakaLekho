import { describe, expect, it } from 'vitest';
import { amountToWords, chunkToWords, integerToWords, toPoishaString } from '../../src/engine/convert.ts';
import { parseAmount } from '../../src/engine/parse.ts';
import { numWordsTable } from '../../src/engine/index.ts';

const table = numWordsTable;

function official(input: string): string {
  const parsed = parseAmount(input);
  if (!parsed.ok) throw new Error(`expected ${input} to parse (${parsed.error.code})`);
  return amountToWords(parsed, table, 'official');
}

function colloquial(input: string): string {
  const parsed = parseAmount(input);
  if (!parsed.ok) throw new Error(`expected ${input} to parse (${parsed.error.code})`);
  return amountToWords(parsed, table, 'colloquial');
}

describe('chunkToWords', () => {
  it('renders 0 as the empty chunk so callers can drop it', () => {
    expect(chunkToWords(0, table)).toBe('');
  });

  it('renders every value 1–99 from the reviewed table', () => {
    for (let value = 1; value <= 99; value += 1) {
      expect(chunkToWords(value, table)).toBe(table.words0to99[value]);
      expect(chunkToWords(value, table).length).toBeGreaterThan(0);
    }
  });

  it('refuses out-of-table input instead of inventing a word', () => {
    expect(() => chunkToWords(100, table)).toThrow();
  });
});

describe('integerToWords — official style', () => {
  it('drops zero chunks (never “শূন্য কোটি”, never “ও”)', () => {
    expect(integerToWords('0', table)).toBe('শূন্য');
    expect(integerToWords('1000', table)).toBe('এক হাজার');
    expect(integerToWords('1000000', table)).toBe('দশ লাখ');
    expect(integerToWords('10000000', table)).toBe('এক কোটি');
    expect(integerToWords('100001', table)).toBe('এক লাখ এক');
    expect(integerToWords('120', table)).toBe('একশত বিশ');
    expect(official('12450')).not.toContain('শূন্য');
    expect(official('12450')).not.toMatch(/ ও /);
  });

  it('renders every hundred from ১০০ to ৯০০', () => {
    const stems = ['', 'এক', 'দুই', 'তিন', 'চার', 'পাঁচ', 'ছয়', 'সাত', 'আট', 'নয়'];
    for (let hundreds = 1; hundreds <= 9; hundreds += 1) {
      expect(integerToWords(String(hundreds * 100), table)).toBe(`${stems[hundreds]}শত`);
    }
  });

  it('keeps thousand + hundred separate (no invented “এগারোশত”)', () => {
    expect(integerToWords('1100', table)).toBe('এক হাজার একশত');
    expect(integerToWords('11100', table)).toBe('এগারো হাজার একশত');
    expect(integerToWords('100100', table)).toBe('এক লাখ একশত');
    expect(integerToWords('1100', table)).not.toContain('শতশত');
  });

  it('keeps group order কোটি → লাখ → হাজার → শতক → একক', () => {
    expect(integerToWords('12345678', table)).toBe(
      'এক কোটি তেইশ লাখ পঁয়তাল্লিশ হাজার ছয়শত আটাত্তর',
    );
    expect(integerToWords('99999999', table)).toBe(
      'নয় কোটি নিরানব্বই লাখ নিরানব্বই হাজার নয়শত নিরানব্বই',
    );
  });

  it('does not use the international million/billion system', () => {
    expect(integerToWords('1000000', table)).not.toContain('মিলিয়ন');
    expect(integerToWords('1000000', table)).toBe('দশ লাখ');
  });

  it('rejects non-digit input rather than guessing', () => {
    expect(() => integerToWords('১২', table)).toThrow();
    expect(() => integerToWords('1,000', table)).toThrow();
    expect(() => integerToWords('1234567890', table)).toThrow();
  });
});

describe('amountToWords — official (default) style', () => {
  const golden: Array<[string, string]> = [
    ['0', 'শূন্য টাকা মাত্র'],
    ['7', 'সাত টাকা মাত্র'],
    ['12.5', 'বারো টাকা পঞ্চাশ পয়সা মাত্র'],
    ['12.50', 'বারো টাকা পঞ্চাশ পয়সা মাত্র'],
    ['12.05', 'বারো টাকা পাঁচ পয়সা মাত্র'],
    ['12.00', 'বারো টাকা মাত্র'],
    ['100', 'একশত টাকা মাত্র'],
    ['105', 'একশত পাঁচ টাকা মাত্র'],
    ['999', 'নয়শত নিরানব্বই টাকা মাত্র'],
    ['1000', 'এক হাজার টাকা মাত্র'],
    ['12450', 'বারো হাজার চারশত পঞ্চাশ টাকা মাত্র'],
    ['100000', 'এক লাখ টাকা মাত্র'],
    ['1,23,45,678', 'এক কোটি তেইশ লাখ পঁয়তাল্লিশ হাজার ছয়শত আটাত্তর টাকা মাত্র'],
    ['99999999.99', 'নয় কোটি নিরানব্বই লাখ নিরানব্বই হাজার নয়শত নিরানব্বই টাকা নিরানব্বই পয়সা মাত্র'],
    ['0.99', 'শূন্য টাকা নিরানব্বই পয়সা মাত্র'],
    ['0.01', 'শূন্য টাকা এক পয়সা মাত্র'],
    ['2000', 'দুই হাজার টাকা মাত্র'],
    ['1000000', 'দশ লাখ টাকা মাত্র'],
  ];

  it.each(golden)('%s → %s', (input, expected) => {
    expect(official(input)).toBe(expected);
  });

  it('never rounds: the poisha digits influence only the poisha words', () => {
    expect(official('1.01')).toBe('এক টাকা এক পয়সা মাত্র');
    expect(official('1.02')).toBe('এক টাকা দুই পয়সা মাত্র');
    expect(official('1.99')).toBe('এক টাকা নিরানব্বই পয়সা মাত্র');
  });

  it('mentions “মাত্র” exactly once, at the end, and never joins with “ও”', () => {
    for (const input of ['0', '12.5', '12450', '1,23,45,678', '99999999.99']) {
      const words = official(input);
      expect(words.split('মাত্র')).toHaveLength(2);
      expect(words.endsWith('মাত্র')).toBe(true);
      expect(words).not.toMatch(/\sও\s/u);
    }
  });

  it('omits the poisha clause only when poisha is zero', () => {
    expect(official('12.00')).not.toContain('পয়সা');
    expect(official('12.01')).toContain('পয়সা');
  });

  it('preserves “শূন্য টাকা” when the integer part is zero but poisha is not', () => {
    expect(official('0.01')).toBe('শূন্য টাকা এক পয়সা মাত্র');
  });
});

describe('amountToWords — কথ্য (experimental) style', () => {
  it('uses একশ / দুইশ and omits “মাত্র”', () => {
    expect(colloquial('100')).toBe('একশ টাকা');
    expect(colloquial('12450')).toBe('বারো হাজার চারশ পঞ্চাশ টাকা');
    expect(colloquial('0.01')).toBe('শূন্য টাকা এক পয়সা');
  });

  it('only differs from the default in the hundred suffix and “মাত্র”', () => {
    for (const input of ['100', '12450', '99999999.99']) {
      const a = official(input).replaceAll('শত', 'শ').replace(/ মাত্র$/u, '');
      expect(colloquial(input)).toBe(a);
    }
  });
});

describe('toPoishaString', () => {
  it('builds integer poisha without floating point', () => {
    const cases: Array<[string, string]> = [
      ['0', '0'],
      ['0.01', '1'],
      ['1', '100'],
      ['12.5', '1250'],
      ['12.05', '1205'],
      ['99999999.99', '9999999999'],
    ];
    for (const [input, expected] of cases) {
      const parsed = parseAmount(input);
      if (!parsed.ok) throw new Error(input);
      expect(toPoishaString(parsed)).toBe(expected);
    }
  });
});
