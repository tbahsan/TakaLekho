# CONTRIBUTING

ধন্যবাদ। এই repository-র মূল্য হলো **ছোট, সত্য, পরীক্ষিত প্রতিশ্রুতি** — নতুন feature-এর
চেয়ে শুদ্ধতা ও স্পষ্ট সীমা বেশি গুরুত্বপূর্ণ।

## ১. শুরু করার আগে

```bash
npm ci
npm run validate:data
npm run typecheck
npm test
npm run build
npm run test:e2e      # প্রথমবার: npx playwright install chromium
```

সবগুলো pass করলে আপনি প্রস্তুত। একটাও fail করলে সেটিই প্রথম কাজ।

## ২. কোন ধরনের অবদান সবচেয়ে দরকারি

| ধরন | উদাহরণ | label |
|---|---|---|
| ভাষাগত পর্যালোচনা | ০–৯৯ বানান, শতক-শব্দ, “মাত্র” ব্যবহার — `docs/TABLE.md` | `domain-review` |
| ভুল বানান বা ভুল রূপান্তরের রিপোর্ট | “এই ইনপুটে এটা হওয়া উচিত ছিল” | `bug` |
| নতুন ত্রুটি-পরিস্থিতি | এমন ইনপুট যা এখন চুপচাপ গৃহীত হয় | `scope`, `tests` |
| অ্যাক্সেসিবিলিটি | কীবার্ড, স্ক্রিন-রিডার, মোবাইল | `accessibility` |
| ডকুমেন্টেশন | উদাহরণ, সীমাবদ্ধতা, অনুবাদ | `docs` |

**অনুরোধ:** issue বা PR-এ **কখনো আসল টাকার অঙ্ক, ব্যাংক অ্যাকাউন্ট, চেক নম্বর বা ব্যক্তিগত
আর্থিক তথ্য লিখবেন না**। উদাহরণ হিসেবে `12450`-র মতো কাল্পনিক সংখ্যাই যথেষ্ট।

## ৩. নতুন শব্দ / নতুন রীতি যোগ করা

1. **আগে expectation, পরে কোড।** `tests/fixtures/golden.json`-এ হাতে expected output লিখুন।
2. `src/data/numwords.bn.json` বদলান। মনে রাখুন:
   - ডেটায় `ও`, `টাকা`, `মাত্র` লিখবেন না — সেগুলো formatter যোগ করে।
   - একটি ডিফল্ট রীতি থাকতে হবে (`default: true`)।
   - নতুন রীতি হলে `reviewStatus` সৎভাবে লিখুন (`experimental-not-reviewed` হতে পারে)।
3. `node scripts/build-table.mjs` — পর্যালোচনা-পত্র নতুন করে তৈরি হবে।
4. `npm test && npm run validate:data` — সব pass হতে হবে।
5. PR-এ লিখুন: কার জন্য, কী বদলাল, কোন সূত্র/পর্যালোচনার ভিত্তিতে। কোনো “অভিধান থেকে নেওয়া”
   দাবি করলে লাইসেন্স দেখাতে হবে।

## ৪. নতুন নিয়ম (rule) বা কোড পরিবর্তন

- ইঞ্জিন (`src/engine/`) pure থাকবে: DOM, `window`, storage বা ফাইল-সিস্টেম নয়। In/out contract-এ
  JSON-serialisable আশা করা হয়।
- সংখ্যা/টাকা কখনো `Number`, `parseFloat` বা গাণিতিক রাউন্ডিং-এ নেওয়া যাবে না — string-পথেই থাকবে।
- নতুন ত্রুটি-কোড যোগ করলে `ERROR_MESSAGES`-এ বাংলা `message` + `hint` দিন, unit test ও
  `src/data/examples.bn.json`-এ উদাহরণ যোগ করুন।
- UI-তে `innerHTML` নয় — `textContent`/`createElement`।
- নতুন dependency যোগ করার আগে: লাইসেন্স (MIT-সঙ্গে সামঞ্জস্যপূর্ণ কি না), maintenance,
  bundle size ও অফলাইন আচরণ PR-এ লিখুন; `package-lock.json` commit করুন।

## ৫. টেস্ট যুক্ত করার নিয়ম

| স্তর | কোথায় | কী যোগ করবেন |
|---|---|---|
| unit | `tests/unit/*.test.ts` | pure logic, error code, boundary |
| fixture | `tests/fixtures/golden.json` | new accepted/rejected case (একক উৎস) |
| property | `tests/unit/properties.test.ts` | invariant (script equivalence, non-rounding) |
| e2e | `tests/e2e/*.spec.ts` | ব্যবহারকারীর দেখা আচরণ, offline, a11y |

নতুন feature-এর সঙ্গে অন্তত: (ক) একটি accepted case, (খ) একটি rejected case, (গ) একটি
counterexample (যেটা ভাঙা উচিত নয়)।

## ৬. PR চেকলিস্ট

- [ ] `npm run validate:data`, `typecheck`, `test`, `build`, `test:e2e` — সব pass।
- [ ] Scope বদলালে `docs/SCOPE.md` হালনাগাদ।
- [ ] আচরণ বদলালে `CHANGELOG.md`-এ এন্ট্রি; সংখ্যার মান বদলালে `amount-changing` চিহ্ন।
- [ ] কোনো private বা আসল আর্থিক ডেটা টেস্ট fixture-এ নেই।
- [ ] নতুন asset হলে লাইসেন্স + `THIRD_PARTY_NOTICES.md` হালনাগাদ।
- [ ] Commit message বর্ণনামূলক (`fix: ১২.৫০-এ পয়সার শব্দ ভুল ছিল`)।

## ৭. রিপোর্ট ও যোগাযোগ

- বাগ/ফিচার: repository issue; টেমপ্লেট: user problem → in scope → out of scope →
  input/output example → edge cases → acceptance criteria → licence/privacy impact।
- নিরাপত্তা: `SECURITY.md` দেখুন (public issue নয়)।
- আচরণবিধি: ভাষাগত বা আঞ্চলিক ভিন্নতা নিয়ে আলোচনা শ্রদ্ধার সঙ্গে; “আপনার বাংলা ভুল” ধরনের
  ভাষা নয় — “এই রূপটি কোথায় প্রচলিত” সেভাবে জানতে চাইব।
