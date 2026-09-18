# Data sources, licence ও পর্যালোচনার অবস্থা

## ১. Dataset manifest

```json
{
  "id": "takalekho.numwords.bn",
  "version": "0.1.0",
  "language": "bn",
  "license": "MIT",
  "sources": ["authored in-repository (no third-party corpus copied)"],
  "reviewStatus": "pending-independent-review",
  "reviewer": null,
  "reviewedAt": null,
  "entryCount": 100,
  "knownLimitations": ["…src/data/numwords.bn.json দেখুন"]
}
```

`npm run validate:data` নিচের শর্তে ব্যর্থ হয়:

- manifest-এর কোনো বাধ্যতামূলক field অনুপস্থিত;
- licence বা sources খালি;
- `reviewStatus: reviewed` অথচ `reviewer` নেই;
- `words0to99` ঠিক ১০০টি নয়, খালি entry আছে, দুবার একই শব্দ আছে বা entry-তে অঙ্ক আছে;
- `hundredStems` ভুল দৈর্ঘ্যের;
- ঠিক একটি ডিফল্ট রীতি নেই;
- Unicode হাইজিন ভাঙা (invisible/joiner অক্ষর, decomposed `য়`, NFC-বিহীন string);
- golden fixture-এ `মাত্র` একবার নয় বা মাঝখানে `ও` আছে;
- `examples.bn.json`-এর কোনো rejected সারিতে কোড/ব্যাখ্যা নেই;
- package/table version semver নয়।

## ২. কোথা থেকে কী এসেছে

| উপাদান | উৎস | লাইসেন্স | পর্যালোচনা |
|---|---|---|---|
| ০–৯৯ শব্দ-তালিকা | এই repository-তে লেখা | MIT | **বাকি** (স্বাধীন বাংলা ভাষা-পর্যালোচক প্রয়োজন) |
| শতক/কোটি/লাখ/হাজার/টাকা/পয়সা/মাত্র শব্দ | এই repository-তে লেখা | MIT | **বাকি** |
| রুপান্তর-নিয়ম (কোটি–লাখ–হাজার বিন্যাস) | বাংলাদেশের প্রচলিত দেশীয় সংখ্যা-রীতি; কোনো মালিকানাধীন টুল থেকে কপি নয় | — | — |
| Noto Sans Bengali (ঐচ্ছিক ফন্ট) | Google Fonts / notofonts | SIL OFL 1.1 | ফন্ট ডিজাইনার কর্তৃক স্বীকৃত |
| আইকন | `public/icons/` — এই repository-তে তৈরি (Noto glyph-এর আউটলাইন থেকে আঁকা) | MIT (glyph: OFL 1.1) | — |
| পরীক্ষার ফিক্সচার ও উদাহরণ | এই repository-তে লেখা | MIT | ইঞ্জিন দিয়ে যাচাইকৃত, মানুষ দিয়ে অনুমোদিত নয় |

**যা করা হয়নি:** কোনো বাণিজ্যিক ওয়ার্ড-লিস্ট, অভিধান, ব্যাংকের নথি, NCERT/textbook,
বা অনুমতি-বিহীন corpus থেকে কিছু নেওয়া হয়নি। “ফ্রি ডাউনলোড করা যায়” মানে “পুনর্বিতরণ করা যায়” নয় —
এই নিয়ম মেনেই সব লেখা নিজে তৈরি করা হয়েছে।

## ৩. পর্যালোচনার বর্তমান অবস্থা (গুরুত্বপূর্ণ)

`reviewStatus: pending-independent-review` — অর্থাৎ:

- তালিকা নিজে লেখা এবং স্বয়ংক্রিয় পরীক্ষায় যাচাই করা, কিন্তু **কোনো স্বাধীন
  বাংলা ভাষা/সাহিত্য পর্যালোচক এখনো অনুমোদন দেননি**;
- অর্থাৎ অ্যাপ v0.1.0 হিসেবেও release করার আগে UI/README-তে এই সীমাবদ্ধতা দেখা যাবে;
- কেউ পর্যালোচনা করলে `src/data/numwords.bn.json`-এ `reviewStatus: "reviewed"`,
  `reviewer`, `reviewedAt` বসাতে হবে এবং `docs/EVALUATION.md`-এ রেকর্ড রাখতে হবে।

সিমুলেটেড বা “একজন দেখেছে ধরে নেওয়া হলো” — এমন কোনো দাবি কোথাও নেই।

## ৪. Version policy

- `numwords.bn.json.version` এবং অ্যাপের `package.json.version` আলাদা রাখা হয়;
  UI ফুটারে দুটোই দেখানো হয়।
- শব্দ বদলালে table version এবং changelog একসঙ্গে বদলাতে হবে।
- Storage/export schema বদলালে `schemaVersion` বদলাবে; incompatible ডেটা চুপচাপ
  পড়ার চেষ্টা করা হবে না (`src/storage/store.ts` শুধু `schemaVersion: 1` গোছাতে পারে)।
