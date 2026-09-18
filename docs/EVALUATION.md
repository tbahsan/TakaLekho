# EVALUATION — correctness-এর প্রমাণ ও ফাঁক

> এই নথির উদ্দেশ্য: কোন দাবির পিছনে কী প্রমাণ আছে, আর কী এখনো **নেই** — সেটি স্পষ্ট লেখা।
> পরিমাপযোগ্য সংখ্যা মাপা হয়েছে এই repository-তে; অনুমান থেকে লেখা হয়নি।

## ১. দাবির শ্রেণি

| দাবি | শ্রেণি | প্রমাণ |
|---|---|---|
| নির্দিষ্ট ইনপুটে নির্দিষ্ট শব্দ-আউটপুট | নির্ধারিত রূপান্তর | 26টি accepted golden fixture + 15টি property test |
| নির্দিষ্ট ইনপুট প্রত্যাখ্যান ও কারণ | নির্ধারিত যাচাই | 26টি rejected fixture, 18টি error code |
| পয়সার মান কখনো বদলায় না | invariant | ০–৯৯ পয়সার প্রতিটি মানে engine-পর্যায়ের যাচাই; `parseFloat` অনুপস্থিত |
| বাংলা/ইংরেজি অঙ্কে একই ফল | invariant | equivalent-script property test |
| শব্দ-তালিকার বানান শুদ্ধ | **মানবিক ভাষাগত দাবি** | **প্রমাণ নেই — স্বাধীন পর্যালোচনা বাকি** |

শেষ সারিটিই সবচেয়ে গুরুত্বপূর্ণ: স্বয়ংক্রিয় পরীক্ষা কেবল সামঞ্জস্য (consistency) প্রমাণ করে,
শুদ্ধতা (correctness) নয়।

## ২. স্বয়ংক্রিয় প্রমাণ

| স্তর | পরিমাণ | কমান্ড |
|---|---|---|
| Unit test (Vitest) | ১৪২টি test, ৫টি ফাইল | `npm test` |
| Golden fixture | ২৬ accepted + ২৬ rejected | `tests/fixtures/golden.json` |
| Property/invariant test | ১৫টি (০–৯৯ পূর্ণ কভারেজ, শতক ১০০–৯০০, পয়সা ০–৯৯, script equivalence) | `tests/unit/properties.test.ts` |
| Data gate | manifest/licence/review/Unicode/shape — CI-তে fail করে | `npm run validate:data` |
| Storage test | ১৫টি (quota, blocked, corrupt, schema mismatch, opt-in) | `tests/unit/storage.test.ts` |
| E2E (Playwright) | ২৩টি — UI, ক্লিপবোর্ড, ডাউনলোড, keyboard, axe, **offline**, subpath | `npm run test:e2e` |
| Offline প্রমাণ | service worker precache করার পরে network বন্ধ করে reload → রূপান্তর কাজ করে | `tests/e2e/offline.spec.ts` |
| Subpath প্রমাণ | একই suite `PAGES_BASE_PATH=/takalekho/` দিয়ে pass | `PAGES_BASE_PATH=/takalekho/ npm run test:e2e` |

### ২.১ যা স্পষ্টভাবে পরীক্ষা করা হয়

- ০–৯৯ প্রতিটি সংখ্যা, ১০০–৯০০ প্রতিটি শতক, পয়সা ০০–৯৯ প্রতিটি মান।
- সীমা: `৯৯,৯৯,৯৯,৯৯৯.৯৯` গৃহীত; ১০ অঙ্ক বা তিন-ঘর দশমিক প্রত্যাখ্যাত।
- `০.০১` → “শূন্য টাকা এক পয়সা মাত্র” (শূন্যও সঠিকভাবে উচ্চারিত)।
- `মাত্র` ঠিক একবার; বাক্যের মাঝে `ও` নেই (fixture-স্তরে যাচাইকৃত)।
- সমতুল্য ইনপুট: `12450` = `১২৪৫০` = `৳12450` = `৳ ১২,৪৫০` (একই শব্দ)।
- দেশীয়-কমার ইঙ্গিত কেবল তখনই দেখানো হয় যখন দুই রীতি সত্যিই আলাদা (`100000` → `১,০০,০০০`),
  কিন্তু `12450`-এ নয় — কারণ সেখানে দুই রীতি একই (E2E-তে দুটোই যাচাই করা)।
- invalid ইনপুটে পুরোনো ফলাফল কপি/ডাউনলোড করা যায় না (E2E-তে প্রমাণিত)।
- Word table-এ duplicate শব্দ নেই, খালি entry নেই, invisible অক্ষর নেই, সব string NFC-normalised।

### ২.২ Unicode-বিষয়ে একটি প্রকৃত পাঠ

প্রস্তাবিত একটি “নিয়ম” (য় কে U+09DF হিসেবেই লিখতে হবে) ভুল ছিল: U+09DF-এর canonical
decomposition আছে এবং সেটি composition-exclusion, তাই

```text
NFC(U+09DF) === U+09AF U+09BC      // অর্থাৎ decomposed ক্রমই স্বাভাবিক রূপ
```

Data যাচাই এখন কেবল **একটি নির্দিষ্ট রূপ** দাবি করে (NFC), কোনো নির্দিষ্ট code point নয়।
এই কারণসহ নিয়মটি `tests/unit/unicode-hygiene.test.ts`-এ লেখা আছে, যাতে ভবিষ্যতে কেউ
সেটি “ঠিক করতে গিয়ে” ভুল না করে।

## ৩. পারফরম্যান্স (মাপা)

পরিমাপ: Node 20.20.2 (Vitest, same process), এই sandbox-এর x86_64 CPU,
৫,০০০ warm-up + ৫০,০০০ রূপান্তর (৫টি ভিন্ন ইনপুট, দুই রীতিতে)।

| পরিমাপ | মান |
|---|---|
| mean | ৩.৩৪ µs |
| p50 | ২.২৭ µs |
| p95 | ৫.৭০ µs |
| p99 | ৯.১৫ µs |
| সর্বোচ্চ (GC outlier সহ) | ৯৮০ µs |

একটি keystroke-প্রতি এই খরচ মানব-চোখে অদৃশ্য (৬০ fps frame = ১৬,৬৬৭ µs)। max মানটি
garbage-collection-এর বিরল outlier; সেই কারণেই worker/debounce-এর দরকার নেই এবং
main thread-এ বিশ্লেষণ চলে।

মাপা bundle (production build, gzip) — `npm run build`-এর reported মান ও স্বাধীন gzip মাপ:

| ফাইল | raw | gzip |
|---|---|---|
| `index-*.js` (অ্যাপ) | ৩০.১৫ KB | **৯.৫৭ KB** |
| `index-*.css` | ৫.৯২ KB | **১.৯৭ KB** |
| `workbox-window` (শুধু আপডেট UX-এর জন্য, lazy) | ৫.৫৮ KB | ২.১৯ KB |
| `index.html` | ১৪.৪৮ KB | ৩.৯০ KB |

অর্থাৎ মূল JS+CSS ≈ **১১.৫ KB gzip** (স্ব-ঘোষিত বাজেট ~৩০০ KB-এর অনেক নিচে)। Font/icon/data
আলাদা: মোট precache **৯২.৮৩ KiB / ১১টি entry** (service worker output থেকে)।

নিজে মাপতে (ফলাফল উপরের টেবিলের সঙ্গে মিলিয়ে দেখুন):

```bash
npm run build                    # gzip bundle আকার
npm run test:e2e                 # offline + subpath + UI আচরণ
PAGES_BASE_PATH=/takalekho/ npm run test:e2e
```

## ৪. কী এখনো বাকি (release blocker)

1. **স্বাধীন বাংলা ভাষা পর্যালোচনা** — ০–৯৯ তালিকা, শতক-শব্দ, “মাত্র” নিয়ম ও
   “কথ্য” রীতির অনুমোদন। পত্র: [`TABLE.md`](TABLE.md)। সম্পন্ন হলে
   `src/data/numwords.bn.json`-এ `reviewStatus: "reviewed"`, `reviewer`, `reviewedAt` বসবে।
2. **বাস্তব ডিভাইস-পরীক্ষা** — Android Chrome ও iOS Safari-তে আসল টাইপিং, Bangla keyboard
   (অভ্র/রিদ্মিক) ও কপি-পেস্ট যাচাই। এখানে কেবল Chromium (headless) চালানো হয়েছে।
3. **স্ক্রিন-রিডার পর্যালোচনা** — NVDA/TalkBack-এ বাংলা উচ্চারণ সহ ব্যবহার।
4. **Firefox/WebKit** — CI-তে Chromium; release-এর আগে দুটোতে smoke test।

উপরের ১ নম্বর ছাড়া বাকিগুলো “পরীক্ষা করে দেখা” পর্যায়ের কাজ, নতুন feature নয়।

## ৫. Heuristic evaluation কেন এখানে প্রযোজ্য নয়

এই অ্যাপে কোনো ভাষাগত সনাক্তকরণ নেই — সব রূপান্তর নির্ধারিত। তাই precision/recall-এর
বদলে প্রমাণ হলো: (ক) golden fixture, (খ) invariant test, (গ) মানবিক বানান-পর্যালোচনা।
“সম্ভাব্য ত্রুটি” শ্রেণির কোনো rule এই release-এ নেই, এবং auto-edit কোথাও নেই — ব্যবহারকারী
নিজে কপি করে নেন।

## ৬. নতুন প্রমাণ যোগ করার নিয়ম

- নতুন behavior যোগ হলে আগে `tests/fixtures/golden.json`-এ expected output লিখুন (মূল ভাষা জেনে),
  তারপর কোড লিখুন। ইঞ্জিন চালিয়ে পাওয়া output-কে expectation বানাবেন না।
- প্রতিটি নতুন error code-এর জন্য অন্তত একটি accepted counterexample ও একটি rejected example।
- সংখ্যার মান বদলাতে পারে এমন কোনো পরিবর্তন `CHANGELOG.md`-এ `amount-changing` হিসেবে চিহ্নিত হবে।
