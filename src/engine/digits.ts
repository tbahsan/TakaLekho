/**
 * Bengali / Latin digit-script helpers.
 *
 * The engine is deliberately string-based: amounts are never routed through
 * `Number`/`parseFloat`, so no rounding can change a single poisha.
 */

export type DigitScript = 'bengali' | 'latin';

export const BENGALI_DIGIT_ZERO = 0x09e6; // ০
export const BENGALI_DIGIT_NINE = 0x09ef; // ৯

export function isBengaliDigit(char: string): boolean {
  const code = char.codePointAt(0);
  return code !== undefined && code >= BENGALI_DIGIT_ZERO && code <= BENGALI_DIGIT_NINE;
}

export function isLatinDigit(char: string): boolean {
  return char >= '0' && char <= '9';
}

export function hasBengaliDigits(value: string): boolean {
  for (const char of value) {
    if (isBengaliDigit(char)) return true;
  }
  return false;
}

export function hasLatinDigits(value: string): boolean {
  for (const char of value) {
    if (isLatinDigit(char)) return true;
  }
  return false;
}

/** ০-৯ → 0-9. Every other character is preserved as-is. */
export function bengaliToLatin(value: string): string {
  let out = '';
  for (const char of value) {
    const code = char.codePointAt(0);
    out +=
      code !== undefined && code >= BENGALI_DIGIT_ZERO && code <= BENGALI_DIGIT_NINE
        ? String(code - BENGALI_DIGIT_ZERO)
        : char;
  }
  return out;
}

/** 0-9 → ০-৯. Every other character is preserved as-is. */
export function latinToBengali(value: string): string {
  let out = '';
  for (const char of value) {
    out += char >= '0' && char <= '9' ? String.fromCodePoint(BENGALI_DIGIT_ZERO + (char.charCodeAt(0) - 48)) : char;
  }
  return out;
}

/** Groups digits using the domestic (Indian) convention: 1,23,45,678. */
export function groupDomestic(digits: string): string {
  if (digits.length <= 3) return digits;
  const lastThree = digits.slice(-3);
  let head = digits.slice(0, -3);
  const chunks: string[] = [];
  while (head.length > 2) {
    chunks.unshift(head.slice(-2));
    head = head.slice(0, -2);
  }
  if (head.length > 0) chunks.unshift(head);
  return [...chunks, lastThree].join(',');
}
