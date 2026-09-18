#!/usr/bin/env node
/**
 * Generates two review documents from the shipped word table so a Bengali
 * language reviewer can read every entry without opening a JSON file:
 *
 *   docs/TABLE.md       — ০–৯৯ plus the hundred/group building blocks
 *   docs/TABLE.csv      — the same list for a spreadsheet
 *
 * Reviewer sign-off is recorded in src/data/numwords.bn.json (reviewStatus,
 * reviewer, reviewedAt); this script never writes those fields itself.
 *
 * Usage: node scripts/build-table.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const table = JSON.parse(readFileSync(join(root, 'src/data/numwords.bn.json'), 'utf8'));

const toBengaliDigits = (value) => String(value).replace(/[0-9]/g, (digit) => String.fromCodePoint(0x09e6 + Number(digit)));

mkdirSync(join(root, 'docs'), { recursive: true });

const header = [
  '# শব্দ-তালিকা পর্যালোচনা-পত্র',
  '',
  `> তৈরি: \`scripts/build-table.mjs\` — হাতে সম্পাদনা করবেন না।  `,
  `> তালিকা: \`${table.id}\` সংস্করণ \`${table.version}\`  `,
  `> অবস্থা: **${table.reviewStatus}**${table.reviewer ? ` (পর্যালোচক: ${table.reviewer})` : ' (পর্যালোচক এখনো নেই)'}  `,
  `> লাইসেন্স: ${table.license}`,
  '',
  '## কীভাবে পর্যালোচনা করবেন',
  '',
  '1. প্রতিটি সারিতে সংখ্যা ও প্রকাশিত বানান মিলিয়ে দেখুন।',
  '2. সংশোধন লাগলে `src/data/numwords.bn.json`-এর `words0to99` সারিতে সরাসরি বদলান।',
  '3. বিকল্প বানান (যেমন ১৪-এর “চোদ্দ”) `knownVariants`-এ রাখুন — কোনো রীতি নিজে থেকে সেটি ব্যবহার করবে না।',
  '4. সব ঠিক থাকলে `reviewStatus` → `reviewed`, `reviewer` ও `reviewedAt` বসান; তারপর `npm test` চালান।',
  '',
  '## ০–৯৯',
  '',
  '| সংখ্যা | শব্দ | সংখ্যা | শব্দ | সংখ্যা | শব্দ | সংখ্যা | শব্দ |',
  '|---|---|---|---|---|---|---|---|',
];

const rows = [];
for (let start = 0; start < 100; start += 4) {
  const columns = [0, 1, 2, 3].map((offset) => {
    const value = start + offset;
    if (value > 99) return '| | |';
    const word = table.words0to99[value];
    return `| ${toBengaliDigits(value)} | ${word} `;
  });
  rows.push(`${columns.join('')}|`);
}

const blocks = [
  '',
  '## শতক ও গোষ্ঠী',
  '',
  `- শতক-শব্দ (ডিফল্ট রীতিতে “শত” যোগ হয়): ${table.hundredStems
    .slice(1)
    .map((stem, index) => `${toBengaliDigits((index + 1) * 100)} = ${stem}শত`)
    .join(', ')}`,
  `- একক: ${table.units.taka}, ${table.units.poisha}, ${table.units.only}`,
  `- গোষ্ঠী: ${table.groupNames.crore}, ${table.groupNames.lakh}, ${table.groupNames.thousand}`,
  '',
  '## রীতি (presets)',
  '',
  '| id | নাম | শতক | “মাত্র” | ডিফল্ট | পর্যালোচনা |',
  '|---|---|---|---|---|---|',
  ...Object.values(table.variants).map(
    (variant) =>
      `| ${variant.id} | ${variant.label} | ${variant.hundredSuffix} | ${variant.trailingOnly ? 'হ্যাঁ' : 'না'} | ${
        variant.default ? 'হ্যাঁ' : 'না'
      } | ${variant.reviewStatus} |`,
  ),
  '',
  '## পরিচিত সীমাবদ্ধতা',
  '',
  ...(table.knownLimitations ?? []).map((limitation) => `- ${limitation}`),
  '',
];

writeFileSync(join(root, 'docs/TABLE.md'), [...header, ...rows, ...blocks].join('\n'), 'utf8');

const csv = [
  'number,bengali_number,word,review_status,reviewer',
  ...table.words0to99.map((word, index) =>
    [index, toBengaliDigits(index), word, table.reviewStatus, table.reviewer ?? ''].join(','),
  ),
].join('\n');
writeFileSync(join(root, 'docs/TABLE.csv'), `${csv}\n`, 'utf8');

console.log(`docs/TABLE.md and docs/TABLE.csv written for ${table.id}@${table.version}`);
