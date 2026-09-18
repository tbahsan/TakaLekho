import type { ParsedAmount } from './parse.ts';

/**
 * Amount → Bengali words.
 *
 * Decomposition follows the domestic convention 1,23,45,678:
 *   কোটি (10^7) → লাখ (10^5) → হাজার (10^3) → শতক (10^2) → একক.
 *
 * Chunks whose value is zero are dropped entirely (never rendered as “শূন্য”,
 * never joined with “ও”). The only place “শূন্য” can appear is the taka part of
 * an amount whose integer part is zero.
 */

export type WordTable = {
  schemaVersion: number;
  id: string;
  version: string;
  language: string;
  license: string;
  sources: string[];
  reviewStatus: string;
  reviewer: string | null;
  reviewedAt: string | null;
  entryCount: number;
  knownLimitations: string[];
  words0to99: string[];
  hundredStems: string[];
  groupNames: { crore: string; lakh: string; thousand: string };
  units: { taka: string; poisha: string; only: string };
  variants: Record<
    string,
    {
      id: string;
      label: string;
      description: string;
      default: boolean;
      hundredSuffix: string;
      trailingOnly: boolean;
      reviewStatus: string;
    }
  >;
  knownVariants: Record<string, unknown>;
};

export type WordStyle = WordTable['variants'][string];

export const DEFAULT_HUNDRED_SUFFIX = 'শত';

export function validateWordTable(table: WordTable): string[] {
  const problems: string[] = [];
  if (table.words0to99.length !== 100) {
    problems.push(`words0to99 must have 100 entries, found ${table.words0to99.length}`);
  }
  table.words0to99.forEach((word, index) => {
    if (word.trim().length === 0) problems.push(`words0to99[${index}] is empty`);
    if (word !== word.trim()) problems.push(`words0to99[${index}] has outer whitespace`);
    if (/\s{2,}/.test(word)) problems.push(`words0to99[${index}] has repeated spaces`);
  });
  if (table.hundredStems.length !== 10) {
    problems.push(`hundredStems must have 10 entries, found ${table.hundredStems.length}`);
  }
  if (table.hundredStems[0] !== '') problems.push('hundredStems[0] must be an empty string');
  const defaults = Object.values(table.variants).filter((variant) => variant.default);
  if (defaults.length !== 1) {
    problems.push(`exactly one default style is required, found ${defaults.length}`);
  }
  for (const [id, variant] of Object.entries(table.variants)) {
    if (variant.id !== id) problems.push(`variant "${id}" has mismatched id "${variant.id}"`);
    if (variant.hundredSuffix.length === 0) problems.push(`variant "${id}" has an empty hundredSuffix`);
    if (typeof variant.trailingOnly !== 'boolean') problems.push(`variant "${id}" needs a boolean trailingOnly`);
  }
  if (table.units.taka.trim().length === 0) problems.push('units.taka is empty');
  if (table.units.poisha.trim().length === 0) problems.push('units.poisha is empty');
  return problems;
}

export function getStyle(table: WordTable, styleId: string): WordStyle {
  const style = table.variants[styleId];
  if (style) return style;
  const fallback = Object.values(table.variants).find((variant) => variant.default);
  if (!fallback) throw new Error(`Word table ${table.id} has no default style`);
  return fallback;
}

/** Words for 0…99. Returns an empty string for a zero chunk so callers can drop it. */
export function chunkToWords(chunk: number, table: WordTable): string {
  if (chunk <= 0) return '';
  const word = table.words0to99[chunk];
  if (word === undefined) throw new Error(`No word for ${chunk} in ${table.id}@${table.version}`);
  return word;
}

/**
 * Words for an integer taka amount, 0 … 99,99,99,999.
 * `hundredSuffix` comes from the active style (`শত` for দাপ্তরিক, `শ` for কথ্য).
 */
export function integerToWords(
  integerDigits: string,
  table: WordTable,
  hundredSuffix: string = DEFAULT_HUNDRED_SUFFIX,
): string {
  if (!/^[0-9]+$/.test(integerDigits)) {
    throw new Error(`integerToWords expects Latin digits, received "${integerDigits}"`);
  }
  if (integerDigits.length > 9) {
    throw new Error('integerToWords accepts at most 9 digits (99,99,99,999)');
  }

  const padded = integerDigits.padStart(9, '0');
  const chunks: Array<[number, string]> = [
    [Number(padded.slice(0, 2)), table.groupNames.crore],
    [Number(padded.slice(2, 4)), table.groupNames.lakh],
    [Number(padded.slice(4, 6)), table.groupNames.thousand],
  ];

  const parts: string[] = [];
  for (const [value, name] of chunks) {
    const words = chunkToWords(value, table);
    if (words.length > 0) parts.push(`${words} ${name}`);
  }

  const hundreds = Number(padded.slice(6, 7));
  if (hundreds > 0) parts.push(`${table.hundredStems[hundreds] ?? ''}${hundredSuffix}`);

  const rest = Number(padded.slice(7, 9));
  if (rest > 0) parts.push(chunkToWords(rest, table));

  if (parts.length === 0) return table.words0to99[0] ?? '';
  return parts.join(' ');
}

/** Full sentence for a parsed amount, in the requested wording style. */
export function amountToWords(parsed: ParsedAmount, table: WordTable, styleId: string): string {
  const style = getStyle(table, styleId);

  const takaWords = integerToWords(parsed.integerPart, table, style.hundredSuffix);
  const sentence: string[] = [`${takaWords} ${table.units.taka}`];

  const poisha = Number(parsed.fractionPart.length > 0 ? parsed.fractionPart : '0');
  if (poisha > 0) sentence.push(`${chunkToWords(poisha, table)} ${table.units.poisha}`);
  if (style.trailingOnly) sentence.push(table.units.only);

  return sentence.join(' ');
}

/**
 * Integer poisha, as a string (never a float).
 * Kept for cross-checking and future export formats.
 */
export function toPoishaString(parsed: ParsedAmount): string {
  const fraction = parsed.fractionPart.length > 0 ? parsed.fractionPart : '00';
  return `${parsed.integerPart}${fraction}`.replace(/^0+(?=\d)/, '');
}
