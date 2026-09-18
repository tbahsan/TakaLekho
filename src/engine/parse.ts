import {
  bengaliToLatin,
  groupDomestic,
  hasBengaliDigits,
  hasLatinDigits,
  isBengaliDigit,
  isLatinDigit,
  latinToBengali,
} from './digits.ts';

/**
 * Input contract for টাকালেখো v0.1.0 — see docs/SCOPE.md.
 *
 * Accepted shape (after trimming outer whitespace):
 *   [৳][space]? digits[.digits]?
 * where `digits` is all-Bengali *or* all-Latin (never mixed), has no leading
 * zero (unless the value is exactly zero), may use domestic comma grouping
 * (1,23,45,678), and the decimal part is exactly one or two digits.
 *
 * Rejected: `12.005`, `.50`, `12.`, `+12`, `-12`, `1e3`, `007`, `12 450`,
 * `1,0000` (mis-grouped), `100,000` (Western grouping), `১২ টাকা`.
 *
 * The parser never converts the amount to a JS number: it returns canonical
 * strings so that no floating-point step can change a single poisha.
 */

export type ParseErrorCode =
  | 'EMPTY_INPUT'
  | 'TOO_LONG'
  | 'INVALID_CHARACTER'
  | 'MIXED_DIGIT_SCRIPT'
  | 'CURRENCY_SYMBOL_POSITION'
  | 'WHITESPACE_INSIDE'
  | 'NEGATIVE_NOT_SUPPORTED'
  | 'SIGN_NOT_SUPPORTED'
  | 'EXPONENT_NOT_SUPPORTED'
  | 'GROUPING_UNSUPPORTED'
  | 'GROUP_INVALID'
  | 'LEADING_ZERO'
  | 'DECIMAL_POINT_REPEATED'
  | 'DECIMAL_POINT_NO_DIGITS'
  | 'DECIMAL_POINT_MISSING_ZERO'
  | 'DECIMAL_DIGITS'
  | 'OUT_OF_RANGE'
  | 'UNIT_WORD_IN_INPUT';

export type ParseError = {
  code: ParseErrorCode;
  message: string;
  hint: string;
};

export type ParsedAmount = {
  ok: true;
  /** Latin digits, ungrouped, fraction as typed: `12345.50`. */
  canonical: string;
  integerPart: string;
  /** Exactly two Latin digits when a fraction was given, else empty. */
  fractionPart: string;
  /** e.g. `১২,৩৪৫.৫০` — grouped, Bengali digits. */
  groupedBengali: string;
  /** e.g. `12,345.50`. */
  groupedLatin: string;
  /** Present when an ungrouped value of 6+ digits has a distinct domestic grouping. */
  groupingHint?: { bengali: string; latin: string };
  /** True when the user typed the thousands separator themselves. */
  wasGrouped: boolean;
};

export type ParseResult = ParsedAmount | { ok: false; error: ParseError };

/**
 * 99,99,99,999 → nine digits. The documented ceiling is ৯৯,৯৯,৯৯,৯৯৯.৯৯
 * (999,999,999.99); any ten-digit value is out of range.
 */
export const MAX_DIGITS = 9;
export const MAX_DECIMALS = 2;
export const MAX_INPUT_LENGTH = 64;

const DIGITS_ONLY = /^[0-9]+$/;
/** 1,23,45,678 — first group 1–2 digits, middle groups 2, final group 3. */
const DOMESTIC_GROUPING = /^[0-9]{1,2}(?:,[0-9]{2})*,[0-9]{3}$/;
/** 100,000 — the three-by-three grouping this app deliberately does not accept. */
const WESTERN_GROUPING = /^[0-9]{1,3}(?:,[0-9]{3})+$/;
const LETTER = /\p{L}/u;
const UNIT_WORD = /(টাকা|পয়সা|পাইসা|taka|toka|poisha|paisa)/iu;
const EXPONENT = /^[0-9০-৯][0-9০-৯,.]*[eE][+-]?[0-9০-৯]+$/u;

export const ERROR_MESSAGES: Record<ParseErrorCode, ParseError> = {
  EMPTY_INPUT: {
    code: 'EMPTY_INPUT',
    message: 'কোনো পরিমাণ লেখা হয়নি।',
    hint: 'যেমন: ১২৪৫০ অথবা 1,24,500.50',
  },
  TOO_LONG: {
    code: 'TOO_LONG',
    message: 'ইনপুট অনেক লম্বা।',
    hint: `সর্বোচ্চ ${MAX_INPUT_LENGTH} অক্ষর গ্রহণ করা হয়।`,
  },
  INVALID_CHARACTER: {
    code: 'INVALID_CHARACTER',
    message: 'অনুমোদিত নয় এমন অক্ষর আছে।',
    hint: 'শুধু অঙ্ক, একটি দশমিক বিন্দু, দেশীয় কমা এবং শুরুতে ৳ ব্যবহার করা যায়।',
  },
  MIXED_DIGIT_SCRIPT: {
    code: 'MIXED_DIGIT_SCRIPT',
    message: 'একই ইনপুটে বাংলা ও ইংরেজি — দুই রকম অঙ্ক আছে।',
    hint: 'একটি লিপি বেছে নিন: ১০০০ অথবা 1000।',
  },
  CURRENCY_SYMBOL_POSITION: {
    code: 'CURRENCY_SYMBOL_POSITION',
    message: '৳ চিহ্ন একবারই, সবার শুরুতে বসবে।',
    hint: 'যেমন: ৳১২,৪৫০.৫০ অথবা ৳ ১২,৪৫০.৫০',
  },
  WHITESPACE_INSIDE: {
    code: 'WHITESPACE_INSIDE',
    message: 'সংখ্যার মাঝে ফাঁকা জায়গা আছে।',
    hint: 'ফাঁকা না দিয়ে 12450 লিখুন।',
  },
  NEGATIVE_NOT_SUPPORTED: {
    code: 'NEGATIVE_NOT_SUPPORTED',
    message: 'ঋণাত্মক পরিমাণ এই সংস্করণে নেই।',
    hint: '০ বা তার বেশি পরিমাণ লিখুন।',
  },
  SIGN_NOT_SUPPORTED: {
    code: 'SIGN_NOT_SUPPORTED',
    message: 'যোগ (+) চিহ্ন গ্রহণ করা হয় না।',
    hint: 'চিহ্ন ছাড়া শুধু অঙ্ক লিখুন।',
  },
  EXPONENT_NOT_SUPPORTED: {
    code: 'EXPONENT_NOT_SUPPORTED',
    message: 'বৈজ্ঞানিক রূপ (যেমন 1e3) গ্রহণ করা হয় না।',
    hint: 'পুরো অঙ্ক লিখুন: 1000।',
  },
  GROUPING_UNSUPPORTED: {
    code: 'GROUPING_UNSUPPORTED',
    message: 'কমার বিন্যাস দেশীয় রীতির নয় (তিন-তিন অঙ্ক)।',
    hint: 'দেশীয় রীতিতে লিখুন: 1,00,000 — অথবা কমা ছাড়া 100000।',
  },
  GROUP_INVALID: {
    code: 'GROUP_INVALID',
    message: 'কমার বিন্যাস সঠিক নয়।',
    hint: 'সঠিক রূপ: 1,23,45,678 — শেষে তিন অঙ্ক, তার আগে দুই-দুই অঙ্ক।',
  },
  LEADING_ZERO: {
    code: 'LEADING_ZERO',
    message: 'অঙ্কের শুরুতে অতিরিক্ত শূন্য আছে।',
    hint: 'শুরু থেকে শূন্য বাদ দিন; শূন্য হলে শুধু 0 লিখুন।',
  },
  DECIMAL_POINT_REPEATED: {
    code: 'DECIMAL_POINT_REPEATED',
    message: 'একাধিক দশমিক বিন্দু আছে।',
    hint: 'শুধু একটি বিন্দু ব্যবহার করুন।',
  },
  DECIMAL_POINT_NO_DIGITS: {
    code: 'DECIMAL_POINT_NO_DIGITS',
    message: 'দশমিক বিন্দুর পরে কোনো অঙ্ক নেই।',
    hint: '12.50 লিখুন, 12. নয়।',
  },
  DECIMAL_POINT_MISSING_ZERO: {
    code: 'DECIMAL_POINT_MISSING_ZERO',
    message: 'দশমিকের আগে অঙ্ক নেই।',
    hint: '0.50 লিখুন, .50 নয়।',
  },
  DECIMAL_DIGITS: {
    code: 'DECIMAL_DIGITS',
    message: 'দশমিকের পরে সর্বোচ্চ দুই ঘর লেখা যায়।',
    hint: '12.50 ঠিক, 12.505 ভুল — তিন ঘর নিলে পয়সার মান বদলে যেত।',
  },
  OUT_OF_RANGE: {
    code: 'OUT_OF_RANGE',
    message: 'পরিমাণ ঘোষিত সীমার বাইরে।',
    hint: 'সর্বোচ্চ ৯৯,৯৯,৯৯,৯৯৯.৯৯ (99,99,99,999.99)।',
  },
  UNIT_WORD_IN_INPUT: {
    code: 'UNIT_WORD_IN_INPUT',
    message: 'ইনপুটে “টাকা” বা “পয়সা” লেখা আছে।',
    hint: 'শুধু পরিমাণ লিখুন — একক (টাকা/পয়সা) অ্যাপ নিজেই যোগ করে।',
  },
};

function fail(code: ParseErrorCode): ParseResult {
  return { ok: false, error: ERROR_MESSAGES[code] };
}

export function parseAmount(rawInput: string): ParseResult {
  const trimmed = rawInput.trim();
  if (trimmed.length === 0) return fail('EMPTY_INPUT');
  if (trimmed.length > MAX_INPUT_LENGTH) return fail('TOO_LONG');

  // Signs and scientific notation get their own codes so the UI can explain them.
  if (EXPONENT.test(trimmed)) return fail('EXPONENT_NOT_SUPPORTED');
  if (trimmed.includes('-') || trimmed.includes('−')) return fail('NEGATIVE_NOT_SUPPORTED');
  if (trimmed.startsWith('+')) return fail('SIGN_NOT_SUPPORTED');

  // Optional single currency mark, only as the very first character.
  const currencyCount = trimmed.split('৳').length - 1;
  if (currencyCount > 1 || (currencyCount === 1 && !trimmed.startsWith('৳'))) {
    return fail('CURRENCY_SYMBOL_POSITION');
  }

  const body = (currencyCount === 1 ? trimmed.slice('৳'.length) : trimmed).trim();
  if (body.length === 0) return fail('EMPTY_INPUT');

  // Letters are checked before whitespace so “১২ টাকা” reports the right cause.
  if (LETTER.test(body)) {
    return fail(UNIT_WORD.test(body) ? 'UNIT_WORD_IN_INPUT' : 'INVALID_CHARACTER');
  }
  if (/\s/.test(body)) return fail('WHITESPACE_INSIDE');

  const bengaliDigits = hasBengaliDigits(body);
  const latinDigits = hasLatinDigits(body);
  if (bengaliDigits && latinDigits) return fail('MIXED_DIGIT_SCRIPT');
  if (!bengaliDigits && !latinDigits) return fail('INVALID_CHARACTER');

  for (const char of body) {
    if (isBengaliDigit(char) || isLatinDigit(char) || char === ',' || char === '.') continue;
    return fail('INVALID_CHARACTER');
  }

  const ascii = bengaliToLatin(body);

  const dotCount = (ascii.match(/\./g) ?? []).length;
  if (dotCount > 1) return fail('DECIMAL_POINT_REPEATED');

  let integerDigits = ascii;
  let fractionPart = '';
  if (dotCount === 1) {
    const [head = '', tail = ''] = ascii.split('.');
    if (tail.length === 0) return fail('DECIMAL_POINT_NO_DIGITS');
    if (head.length === 0) return fail('DECIMAL_POINT_MISSING_ZERO');
    if (tail.length > MAX_DECIMALS) return fail('DECIMAL_DIGITS');
    integerDigits = head;
    fractionPart = tail;
  }

  const wasGrouped = integerDigits.includes(',');
  if (wasGrouped) {
    if (!DIGITS_ONLY.test(integerDigits.replace(/,/g, ''))) return fail('GROUP_INVALID');
    if (!DOMESTIC_GROUPING.test(integerDigits)) {
      return fail(WESTERN_GROUPING.test(integerDigits) ? 'GROUPING_UNSUPPORTED' : 'GROUP_INVALID');
    }
    integerDigits = integerDigits.replace(/,/g, '');
  }

  if (!DIGITS_ONLY.test(integerDigits)) return fail('INVALID_CHARACTER');
  if (integerDigits.length > 1 && integerDigits.startsWith('0')) return fail('LEADING_ZERO');
  if (integerDigits.length > MAX_DIGITS) return fail('OUT_OF_RANGE');

  const canonical = fractionPart.length > 0 ? `${integerDigits}.${fractionPart}` : integerDigits;
  const groupedLatinBase = groupDomestic(integerDigits);
  const groupedBengaliBase = latinToBengali(groupedLatinBase);

  const parsed: ParsedAmount = {
    ok: true,
    canonical,
    integerPart: integerDigits,
    fractionPart: fractionPart.padEnd(MAX_DECIMALS, '0'),
    groupedBengali:
      fractionPart.length > 0 ? `${groupedBengaliBase}.${latinToBengali(fractionPart)}` : groupedBengaliBase,
    groupedLatin: fractionPart.length > 0 ? `${groupedLatinBase}.${fractionPart}` : groupedLatinBase,
    wasGrouped,
  };

  // For 5-digit values the everyday reading and the domestic grouping agree
  // (12,450), so a hint would be noise. From 6 digits they diverge (1,00,000).
  if (!wasGrouped && integerDigits.length >= 6) {
    parsed.groupingHint = {
      bengali: parsed.groupedBengali,
      latin: parsed.groupedLatin,
    };
  }

  return parsed;
}
