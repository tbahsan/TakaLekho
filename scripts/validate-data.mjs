#!/usr/bin/env node
/**
 * Dataset gate: run before release and in CI.
 *
 * Fails (exit 1) when the shipped data is malformed, when a licence/review field
 * is missing, when the word table breaks its shape rules, when Unicode hygiene
 * is violated, or when the documented examples disagree with the table.
 *
 * Usage: node scripts/validate-data.mjs
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const problems = [];
const notes = [];

const readJson = (relativePath) => JSON.parse(readFileSync(join(root, relativePath), 'utf8'));

const table = readJson('src/data/numwords.bn.json');
const examples = readJson('src/data/examples.bn.json');
const golden = readJson('tests/fixtures/golden.json');
const pkg = readJson('package.json');

/* ---------------------------------------------------------------- manifest */

const REQUIRED_MANIFEST_FIELDS = [
  'schemaVersion',
  'id',
  'version',
  'language',
  'license',
  'sources',
  'reviewStatus',
  'reviewedAt',
  'entryCount',
  'knownLimitations',
];

for (const field of REQUIRED_MANIFEST_FIELDS) {
  if (!(field in table)) problems.push(`numwords.bn.json is missing the manifest field “${field}”`);
}

if (typeof table.license !== 'string' || table.license.trim().length === 0) {
  problems.push('numwords.bn.json must declare a licence');
}
if (Array.isArray(table.sources) && table.sources.length === 0) {
  problems.push('numwords.bn.json must list at least one source');
}
if (!Array.isArray(table.knownLimitations) || table.knownLimitations.length === 0) {
  problems.push('numwords.bn.json must document known limitations');
}
if (table.reviewStatus === 'reviewed' && !table.reviewer) {
  problems.push('reviewStatus is “reviewed” but no reviewer is named');
}
if (table.reviewStatus !== 'reviewed') {
  notes.push(`word table review status: ${table.reviewStatus} — the app must say so in the UI`);
}

/* ---------------------------------------------------------------- shape */

if (!Array.isArray(table.words0to99) || table.words0to99.length !== 100) {
  problems.push(`words0to99 must have 100 entries, found ${table.words0to99?.length ?? 0}`);
} else {
  table.words0to99.forEach((word, index) => {
    if (typeof word !== 'string' || word.trim().length === 0) problems.push(`words0to99[${index}] is empty`);
    if (word !== word.trim()) problems.push(`words0to99[${index}] has outer whitespace`);
    if (/\s{2,}/.test(word)) problems.push(`words0to99[${index}] has repeated whitespace`);
    if (/[0-9০-৯]/.test(word)) problems.push(`words0to99[${index}] contains a digit`);
  });
  const duplicates = table.words0to99.filter((word, index) => table.words0to99.indexOf(word) !== index);
  if (duplicates.length > 0) problems.push(`duplicate words in words0to99: ${[...new Set(duplicates)].join(', ')}`);
  if (table.entryCount !== 100) problems.push(`entryCount should be 100, found ${table.entryCount}`);
}

if (!Array.isArray(table.hundredStems) || table.hundredStems.length !== 10) {
  problems.push('hundredStems must have 10 entries');
} else if (table.hundredStems[0] !== '') {
  problems.push('hundredStems[0] must be the empty string');
}

/* ---------------------------------------------------------------- styles */

const styles = Object.entries(table.variants ?? {});
if (styles.length === 0) problems.push('at least one wording style is required');
const defaults = styles.filter(([, variant]) => variant.default);
if (defaults.length !== 1) problems.push(`exactly one default style is required, found ${defaults.length}`);
if (defaults[0] && defaults[0][0] !== 'official') notes.push(`default style is “${defaults[0][0]}”`);
for (const [id, variant] of styles) {
  if (variant.id !== id) problems.push(`variant “${id}” has mismatched id “${variant.id}”`);
  if (typeof variant.hundredSuffix !== 'string' || variant.hundredSuffix.length === 0) {
    problems.push(`variant “${id}” needs a hundredSuffix`);
  }
  if (typeof variant.trailingOnly !== 'boolean') problems.push(`variant “${id}” needs a boolean trailingOnly`);
  if (variant.reviewStatus !== 'reviewed') notes.push(`style “${id}” is not independently reviewed (${variant.reviewStatus})`);
}

/* ---------------------------------------------------------------- Unicode */

const INVISIBLE = /[\u200B\u200C\u200D\uFEFF\u00AD\u2060]/u;

function walkStrings(node, path, visit) {
  if (typeof node === 'string') return visit(node, path);
  if (Array.isArray(node)) return node.forEach((item, index) => walkStrings(item, `${path}[${index}]`, visit));
  if (node && typeof node === 'object') {
    return Object.entries(node).forEach(([key, value]) => walkStrings(value, `${path}.${key}`, visit));
  }
  return undefined;
}

for (const [name, file] of [
  ['numwords.bn.json', table],
  ['examples.bn.json', examples],
  ['golden.json', golden],
]) {
  walkStrings(file, name, (value, path) => {
    if (INVISIBLE.test(value)) problems.push(`${path} contains an invisible/joiner character`);
    // Note: NFC(য়) is U+09AF U+09BC, so the decomposed sequence is the normal form.
    // We only require one deterministic form, never a particular code point.
    if (value !== value.normalize('NFC')) problems.push(`${path} is not NFC-normalised`);
  });
}

/* ------------------------------------------------------------ correctness */

const words = table.words0to99;
const needsReview = [
  [14, 'চোদ্দ'],
  [16, 'ষোল'],
];
for (const [value, alternate] of needsReview) {
  if (words[value] === alternate) notes.push(`words0to99[${value}] uses the colloquial spelling “${alternate}”`);
}

for (const example of golden.accepted) {
  if (typeof example.official !== 'string' || example.official.length === 0) {
    problems.push(`golden.accepted “${example.input}” has no expected official output`);
  }
  if (typeof example.colloquial !== 'string' || example.colloquial.length === 0) {
    problems.push(`golden.accepted “${example.input}” has no expected colloquial output`);
  }
  if (example.official.includes(' ও ')) problems.push(`golden.accepted “${example.input}” contains a mid-sentence “ও”`);
  if (example.official.split('মাত্র').length - 1 !== 1) {
    problems.push(`golden.accepted “${example.input}” must contain exactly one “মাত্র”`);
  }
}

for (const example of examples.rejected) {
  if (!example.code) problems.push(`examples.rejected “${example.input}” has no error code`);
  if (!example.why) problems.push(`examples.rejected “${example.input}” has no explanation`);
}

/* ------------------------------------------------------------- reporting */

const versionFields = [
  ['table version', table.version],
  ['application version', pkg.version],
];
for (const [label, value] of versionFields) {
  if (typeof value !== 'string' || !/^\d+\.\d+\.\d+$/.test(value)) {
    problems.push(`${label} must be a plain semver string, found ${String(value)}`);
  }
}

console.log(`word table : ${table.id}@${table.version} (${table.reviewStatus})`);
console.log(`examples   : ${examples.accepted.length} accepted, ${examples.rejected.length} rejected`);
console.log(`golden     : ${golden.accepted.length} accepted, ${golden.rejected.length} rejected`);
for (const note of notes) console.log(`note       : ${note}`);

if (problems.length > 0) {
  console.error('\nData validation FAILED:');
  for (const problem of problems) console.error(` - ${problem}`);
  process.exit(1);
}

console.log('\nData validation passed.');
