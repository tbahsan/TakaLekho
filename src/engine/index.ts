import numWordsTableJson from '../data/numwords.bn.json';
import { amountToWords, getStyle, type WordTable } from './convert.ts';
import { parseAmount, type ParseError } from './parse.ts';

/**
 * পাবলিক ইঞ্জিন ইন্টারফেস — শুধু এই ফাইলটিই UI থেকে আমদানি করা হয়।
 * UI এই ইন্টারফেসের বাইরের কিছু জানে না, তাই ইঞ্জিন আলাদাভাবে পরীক্ষা করা যায়।
 */

export const ENGINE_VERSION = '0.1.0';

export const numWordsTable = numWordsTableJson as WordTable;

export type ConversionSuccess = {
  ok: true;
  /** ব্যবহারকারী যা লিখেছেন, হুবহু (শুধু বাইরের ফাঁকা বাদ)। */
  input: string;
  canonical: string;
  groupedBengali: string;
  groupedLatin: string;
  words: string;
  styleId: string;
  styleLabel: string;
  styleIsDefault: boolean;
  styleReviewStatus: string;
  groupingHint?: { bengali: string; latin: string };
  engineVersion: string;
  tableVersion: string;
  tableReviewStatus: string;
};

export type ConversionFailure = {
  ok: false;
  input: string;
  error: ParseError;
  engineVersion: string;
};

export type Conversion = ConversionSuccess | ConversionFailure;

export function convertAmount(input: string, styleId: string): Conversion {
  const style = getStyle(numWordsTable, styleId);
  const parsed = parseAmount(input);

  if (!parsed.ok) {
    return { ok: false, input, error: parsed.error, engineVersion: ENGINE_VERSION };
  }

  return {
    ok: true,
    input,
    canonical: parsed.canonical,
    groupedBengali: parsed.groupedBengali,
    groupedLatin: parsed.groupedLatin,
    words: amountToWords(parsed, numWordsTable, style.id),
    styleId: style.id,
    styleLabel: style.label,
    styleIsDefault: style.default,
    styleReviewStatus: style.reviewStatus,
    ...(parsed.groupingHint ? { groupingHint: parsed.groupingHint } : {}),
    engineVersion: ENGINE_VERSION,
    tableVersion: numWordsTable.version,
    tableReviewStatus: numWordsTable.reviewStatus,
  };
}

export type { ParseError, ParseErrorCode } from './parse.ts';
export { ERROR_MESSAGES, MAX_INPUT_LENGTH, parseAmount } from './parse.ts';
export { getStyle, validateWordTable } from './convert.ts';
export type { WordTable } from './convert.ts';
export {
  bengaliToLatin,
  latinToBengali,
  groupDomestic,
  hasBengaliDigits,
  hasLatinDigits,
} from './digits.ts';
