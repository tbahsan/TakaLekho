# CHANGELOG

এই প্রকল্প [Semantic Versioning](https://semver.org/) ব্যবহার করে। অ্যাপের সংস্করণ
(`package.json`) এবং শব্দ-তালিকার সংস্করণ (`src/data/numwords.bn.json`) আলাদা রাখা হয়।

গুরুত্বপূর্ণ: **সংখ্যার মান বদলাতে পারে এমন যেকোনো পরিবর্তন `amount-changing` হিসেবে চিহ্নিত**
হতে হবে, কারণ ব্যবহারকারী সেই লেখা চেক বা দলিলে বসাতে পারেন। শুধু UI/ডকুমেন্টেশন বদলালে
`amount-changing` নয়।

## [Unreleased]

### Planned (v0.2) — এখনো করা হয়নি, প্রতিশ্রুতি নয়

- আন্তর্জাতিক সংখ্যা-রীতি (মিলিয়ন/বিলিয়ন), আলাদা contract ও fixture সহ।
- রীতি-ভিত্তিক অতিরিক্ত wording presets (প্রতিটির নিজস্ব পর্যালোচনা)।
- স্বাধীন বাংলা ভাষা-পর্যালোচনার রেকর্ড যোগ করে `reviewStatus: reviewed`।

## [0.1.0] — 2026-09-18 — unpublished (tag দেওয়ার আগে পর্যালোচনা বাকি)

প্রথম সংস্করণ: সম্পূর্ণ ব্রাউজারে চলা, অফলাইন-সক্ষম, backend-বিহীন রূপান্তরকারী।

### Added

- পাবলিক ইঞ্জিন ইন্টারফেস (`src/engine/index.ts`): `convertAmount(input, styleId)`।
  ভেতরে চারটি বিচ্ছিন্ন স্তর — `digits.ts`, `parse.ts`, `convert.ts`, `index.ts`।
- ইনপুট যাচাই: বাংলা/ইংরেজি অঙ্ক (মেশানো নয়), ঐচ্ছিক `৳`, ঐচ্ছিক দেশীয় কমা
  (`,` + ফাঁকা), সর্বোচ্চ দুই ঘর দশমিক, পরিসর `০`–`৯৯,৯৯,৯৯,৯৯৯.৯৯`, সর্বোচ্চ ৬৪ অক্ষর।
- ১৮টি নির্দিষ্ট ত্রুটি-কোড, প্রতিটির সঙ্গে বাংলা `message` ও `hint`
  (`ERROR_MESSAGES`)। ত্রুটি থাকলে পুরোনো ফলাফল কপি/এক্সপোর্ট করা যায় না।
- শব্দ-তালিকা `src/data/numwords.bn.json@0.1.0` — ০–৯৯ (হাতে লেখা), শতক-শব্দ,
  কোটি/লাখ/হাজার, টাকা/পয়সা/মাত্র। `knownVariants`-এ ঢাকাইয়া বিকল্প বানান রাখা,
  কিন্তু কোনো রীতি সেগুলো ব্যবহার করে না।
- রীতি (presets): `official` (ডিফল্ট — একশত…শেষে “মাত্র”) এবং `colloquial`
  (পরীক্ষামূলক — একশ…, “মাত্র” ছাড়া)। UI-তে পরীক্ষামূলক অবস্থা লেখা থাকে।
- UI: বাংলা-প্রথম লেআউট, ইঞ্জিন থেকে তৈরি উদাহরণ-টেবিল (hand-written নয়),
  গৃহীত-না-হওয়া ইনপুটের কারণ-টেবিল, কপি, TXT ডাউনলোড, ত্রুটি/স্টেটাস ঘোষণা।
- ঐচ্ছিক সংরক্ষণ: ডিফল্টে সম্পূর্ণ বন্ধ; চালু করলে কেবল `localStorage`-এ
  `takalekho.settings.v1` ও `takalekho.history.v1` (সর্বোচ্চ ২০টি, ডুপ্লিকেট নয়),
  এক ক্লিকে সম্পূর্ণ মোছা। ব্যর্থ write-এ কখনো মিথ্যা “সংরক্ষিত” বার্তা নয়।
- PWA: `vite-plugin-pwa` (precache ১১টি entry, ৯২.৮৩ KiB), `registerType: 'prompt'`,
  অফলাইন-প্রস্তুত বার্তা এবং আপডেটের আগে সতর্কতা (সংরক্ষণ চালু না থাকলে ইনপুট হারানোর ঝুঁকি জানানো)।
- ডেটা গেট `scripts/validate-data.mjs` (manifest, licence, review field, shape, Unicode,
  golden `মাত্র`-নিয়ম) এবং রিভিউ-ডকুমেন্ট জেনারেটর `scripts/build-table.mjs`
  (`docs/TABLE.md`, `docs/TABLE.csv`)।
- পরীক্ষা: ১৪২টি unit/property/storage test (৫টি ফাইল) + ২৩টি E2E (UI, ক্লিপবোর্ড,
  ডাউনলোড, কীবোর্ড, axe, **offline**, subpath) + golden fixture ২৬ accepted / ২৬ rejected।
- CI (`.github/workflows/ci.yml`): `validate:data` → `typecheck` → `test` → `build` →
  E2E (production preview, `PAGES_BASE_PATH`)।
- Pages deployment (`.github/workflows/pages.yml`) — project subpath build সহ।
- ডকুমেন্টেশন: `docs/SCOPE.md`, `RULES.md`, `DATA_SOURCES.md`, `EVALUATION.md`,
  `ACCESSIBILITY.md`, `DEPLOY.md`, `RELEASE_CHECKLIST.md`, `THIRD_PARTY_NOTICES.md`,
  `CONTRIBUTING.md`, `SECURITY.md`।
- দ্বিভাষিক (বাংলা + English) README — উদাহরণ টেবিল, স্ক্রিনশট, GitHub Pages সংযোগের ধাপ,
  সীমাবদ্ধতা ও গোপনীয়তার স্পষ্ট ঘোষণা সহ।

### Changed (amount-changing)

- প্রস্তাবিত সীমা-বর্ণনার একটি অসঙ্গতি ধরা পড়ে সংশোধিত: roadmap-এ সর্বোচ্চ
  “৯৯,৯৯,৯৯,৯৯৯.৯৯” লেখা (৯ অঙ্ক), কিন্তু প্রথম বাস্তবায়নে সীমা ৮ অঙ্ক (`MAX_DIGITS = 8`)
  ধরে নেওয়া হয়েছিল, ফলে ১০ কোটি–৯৯ কোটি পরিসীমার মান ভুলভাবে প্রত্যাখ্যাত হচ্ছিল।
  `MAX_DIGITS` এখন **৯**, অর্থাৎ ঘোষিত সীমার সঙ্গে মিলে যায়। কোনো প্রকাশিত মান বদলায়নি
  (এটি প্রথম release), তবে গৃহীত-পরিসর বদলেছে — তাই এন্ট্রি রাখা হলো।
- `৳ ১২,৪৫০` (৳-এর পরে ফাঁকা) এখন গৃহীত; sebelumnya ভুলভাবে `WHITESPACE_INSIDE` দেখাত।
- ইংরেজি অঙ্ক + বাংলা অঙ্ক মেশানো ইনপুটের আগে যাচাই-ক্রম ঠিক করা হয়: ট্রেইলিং ফাঁকা
  বাদ দেওয়ার পর `১২ টাকা` এখন সঠিকভাবে `UNIT_WORD_IN_INPUT`, `WHITESPACE_INSIDE` নয়।

### Fixed

- `LICENSE`-এর placeholder নাম সরিয়ে প্রকৃত copyright holder **Tasneem Bin Ahsan** বসানো
  (repository-র LICENSE-এর সঙ্গে মিলিয়ে)।
- README/`docs/DEPLOY.md`-এ কাল্পনিক `https://<your-username>.github.io/takalekho/` বদলে
  প্রকৃত ঠিকানা `https://tbahsan.github.io/TakaLekho/` — repository নামের হাতের অক্ষর
  (বড় হাতের `T` ও `L`) URL-এ ঠিক সেইভাবেই বসে, তাই এটি গুরুত্বপূর্ণ।

### Notes

- দেশীয়-কমার ইঙ্গিত এখন আলাদা লাইনে এবং কেবল ৬+ অঙ্কে (যেখানে দুই রীতি ভিন্ন); ৫ অঙ্কে
  (`12450`) ইঙ্গিত দেখানো হয় না, কারণ সেখানে `12,450` দুই রীতিতেই একই।
- `ইংরেজি অঙ্কে দশমিক অংশ` এখন বাংলা অঙ্কে দেখানো হয় (`১২,৪৫০.৫০`), আগে `.50` ল্যাটিন অঙ্কে ছিল —
  এটি UI প্রদর্শনের সংশোধন, রূপান্তরের মান বদলায়নি।
- **Unicode নিয়ম সংশোধন:** “য় সবসময় U+09DF” — এই ধারণা ভুল ছিল। U+09DF-এর canonical
  decomposition আছে এবং সেটি composition exclusion, তাই `NFC(U+09DF) == U+09AF U+09BC`।
  এখন যাচাই শুধু NFC-normalisation দাবি করে; ভুল নিয়মটি test-এ ব্যাখ্যা সহ বন্ধ করা হয়েছে
  (`tests/unit/unicode-hygiene.test.ts`)।
- **স্বাধীন বাংলা ভাষা-পর্যালোচনা বাকি** (`reviewStatus: pending-independent-review`)।
  এই tag-এর আগে `docs/RELEASE_CHECKLIST.md` পূরণ করতে হবে।

### Known limitations

- আন্তর্জাতিক রীতি নেই; পরিসর ৯৯,৯৯,৯৯,৯৯৯.৯৯ পর্যন্ত।
- “কথ্য ও সংক্ষিপ্ত” রীতি পরীক্ষামূলক এবং স্বাধীন পর্যালোচনা ছাড়া।
- ব্যাংক/আইনগত দলিলের অনুমোদিত রূপ নয়; গুরুত্বপূর্ণ দলিলে নিজে মিলিয়ে নিতে হবে।
- Firefox/WebKit এবং প্রকৃত মোবাইল ডিভাইসে E2E চালানো হয়নি (CI কেবল Chromium)।
