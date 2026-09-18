<div align="center">

# ৳ টাকালেখো · TakaLekho

### টাকার পরিমাণ, বাংলা কথায় — কোটি · লাখ · হাজার রীতিতে।
*Convert Bangladeshi Taka amounts into precise Bengali words using the authentic domestic system.*

<br/>

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-tbahsan.github.io%2FTakaLekho-14532d?style=for-the-badge)](https://tbahsan.github.io/TakaLekho/)
[![Author](https://img.shields.io/badge/Author-Tasneem_Bin_Ahsan-0b6bbf?style=for-the-badge&logo=github)](https://github.com/tbahsan)
[![License: MIT](https://img.shields.io/badge/License-MIT-22c55e?style=for-the-badge)](LICENSE)

<br/>

[![Tests](https://img.shields.io/badge/Vitest-142%20passed-14532d?logo=vitest&logoColor=white)](docs/EVALUATION.md)
[![E2E Tests](https://img.shields.io/badge/Playwright-23%20passed-14532d?logo=playwright&logoColor=white)](docs/EVALUATION.md)
[![PWA](https://img.shields.io/badge/PWA-100%25%20Offline%20Ready-14532d?logo=pwa&logoColor=white)](docs/EVALUATION.md)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178c6?logo=typescript&logoColor=white)](tsconfig.json)
[![Vite](https://img.shields.io/badge/Vite-Fast%20Bundler-646cff?logo=vite&logoColor=white)](vite.config.ts)
[![Privacy](https://img.shields.io/badge/Privacy-Zero%20Tracking-15803d)](#-গোপনীয়তা--privacy)

<br/>

[**লাইভ ডেমো**](https://tbahsan.github.io/TakaLekho/) •
[**বাংলা বিবরণ**](#-বাংলা-বিবরণ) •
[**English Overview**](#-english-overview) •
[**বৈশিষ্ট্য**](#-মূল-বৈশিষ্ট্য--key-features) •
[**উদাহরণ**](#-কথায়-লেখার-নিয়ম-ও-উদাহরণ--rules--examples) •
[**সেটআপ**](#-লোকাল-সেটআপ--local-development) •
[**লেখক**](#-লেখক-ও-স্বত্ব--author--license)

</div>

---

## 🎯 এক নজরে রূপান্তর / At a Glance

| ইনপুট / Input | বাংলা কথায় / Bengali Words | নোট / Remarks |
|---|---|---|
| `12450` | **বারো হাজার চারশত পঞ্চাশ টাকা মাত্র** | আদর্শ ভাউচার ফরম্যাট |
| `12.5` | **বারো টাকা পঞ্চাশ পয়সা মাত্র** | দশমিক এক ঘর = ৫০ পয়সা |
| `12.05` | **বারো টাকা পাঁচ পয়সা মাত্র** | শূন্যসহ পয়সার সঠিক রূপ |
| `1,23,45,678` | **এক কোটি তেইশ লাখ পঁয়তাল্লিশ হাজার ছয়শত আটাত্তর টাকা মাত্র** | দেশীয় কমা রীতি |
| `0` | **শূন্য টাকা মাত্র** | শূন্য টাকার রূপ |
| `0.01` | **শূন্য টাকা এক পয়সা মাত্র** | সর্বনিম্ন পয়সা |
| `৯৯,৯৯,৯৯,৯৯৯.৯৯` | **নিরানব্বই কোটি নিরানব্বই লাখ নিরানব্বই হাজার নয়শত নিরানব্বই টাকা নিরানব্বই পয়সা মাত্র** | ঘোষিত সর্বোচ্চ সীমা |

---

## 📸 স্ক্রিনশট / Preview

<div align="center">

| ফলাফল ভিউ (Result) | ত্রুটি বার্তা (Guidance) | মোবাইল সংস্করণ (Mobile PWA) |
|:---:|:---:|:---:|
| <img src="docs/screenshots/02-result.png" width="260" alt="Result View" /> | <img src="docs/screenshots/03-error.png" width="260" alt="Error Guidance" /> | <img src="docs/screenshots/05-mobile.png" width="200" alt="Mobile Responsive View" /> |

</div>

---

## 🇧🇩 বাংলা বিবরণ

ব্যাংক চেক, জমির দলিল, রশিদ, ভাউচার বা প্রাতিষ্ঠানিক ফর্মে টাকার অঙ্ক কথায় লিখতে হয়। অনলাইনে প্রচলিত অনেক টুল ভুল কোটি-লাখ কমা দেয়, দশমিকের পয়সায় রাউন্ডিং ভুল করে, কিংবা অতিরিক্ত বিজ্ঞাপনে ভরা থাকে।

**টাকালেখো** একটি উন্মুক্ত, নির্ভরযোগ্য এবং সম্পূর্ণ বিজ্ঞাপনমুক্ত বাংলা কারেন্সি কনভার্টার। এটি আপনার ব্রাউজারে সম্পূর্ণ অফলাইনে কাজ করে — কোনো সার্ভার বা ইন্টারনেটের প্রয়োজন হয় না।

### ✨ কেন টাকালেখো বেছে নেবেন?

1. **খাঁটি দেশীয় রীতি:** আন্তর্জাতিক মিলিয়ন-বিলিয়নের বদলে খাঁটি কোটি · লাখ · হাজার · শতক কাঠামো অনুসরণ করে।
2. **শতভাগ অফলাইন (PWA):** প্রগ্রেসিভ ওয়েব অ্যাপ (PWA) হিসেবে তৈরি। একবার ভিজিট করলেই আপনার ডিভাইসে ইনস্টলযোগ্য এবং ইন্টারনেট সংযোগ ছাড়াই আজীবন ব্যবহার করা যায়।
3. **কোনো রাউন্ডিং বিভ্রাট নেই:** জাভাস্ক্রিপ্টের সাধারণ `parseFloat`-এর দশমিক বা রাউন্ডিং বাগ এড়িয়ে স্ট্রিক্ট স্ট্রিং পার্সিং ব্যবহার করা হয়েছে।
4. **১৮টি স্পষ্ট ত্রুটি বার্তা:** ইনপুটে কোনো ভুল হলে (যেমন অপ্রয়োজনীয় শূন্য, আন্তর্জাতিক কমা, বেশি দশমিক ঘর) ব্যবহারকারীকে স্পষ্ট কারণ ও সমাধানের উপায় বলে দেয়।
5. **সম্পূর্ণ প্রাইভেট:** কোনো অ্যানালিটিক্স, কুকি বা ট্র্যাকার নেই। আপনার লেখা টাকার পরিমাণ কোনো সার্ভারে যায় না।
6. **এক ক্লিকে কপি ও ডাউনলোড:** ফলাফল সহজে ক্লিপবোর্ডে কপি করুন অথবা রিসিট আকারে UTF-8 `.txt` ফাইলে ডাউনলোড করুন।

---

## 🇬🇧 English Overview

Writing financial amounts in words is a legal necessity for bank cheques, invoices, receipts, deeds, and official contracts in Bangladesh. Most existing tools rely on ad-heavy servers or produce incorrect commas and rounding issues.

**TakaLekho** is a high-precision, distraction-free, privacy-first web application designed to convert numeric Taka figures into grammatically sound Bengali words using Bangladesh's domestic *Crore-Lakh-Thousand-Hundred* system.

### ✨ Key Highlights

- **Domestic Numbering System:** Strictly adheres to Bangladeshi financial conventions (Crore, Lakh, Hazar, Shatak).
- **100% Client-Side & Offline PWA:** Instant loading backed by a Service Worker precache. Works completely offline after initial load.
- **Deterministic String-Math:** Zero floating-point inaccuracies. Amounts up to 9 digits (`99,99,99,999.99`) are parsed losslessly without rounding errors.
- **Strict Input Validation:** 18 descriptive error codes that politely guide users when formatting is invalid (e.g., misaligned commas, trailing decimals).
- **Zero Surveillance:** No backend servers, no analytics, no external CDN dependencies, and zero tracking scripts.
- **Accessible & Tested:** High contrast ratios, full keyboard navigation, ARIA live-regions, verified with 142 unit tests and 23 Playwright browser tests.

---

## 📋 কথায় লেখার নিয়ম ও উদাহরণ / Rules & Examples

### ১. সংখ্যা বিন্যাস (Number Grouping)
দেশীয় সংখ্যা রীতিতে ডান দিক থেকে প্রথম ৩ ঘরে কমা, এরপর প্রতি ২ ঘর পর পর কমা বসে:
```text
  ১, ২৩, ৪৫, ৬৭৮  (এক কোটি তেইশ লাখ পঁয়তাল্লিশ হাজার ছয়শত আটাত্তর)
```

### ২. শতকের নিয়ম (The Hundreds Rule)
- শতক ঘরে ১ থাকলে: **একশত** (যেমন: `100` → একশত টাকা মাত্র, `1100` → এক হাজার একশত টাকা মাত্র)
- শতক ঘরে শূন্য থাকলে: কোনো শব্দ বসে না (যেমন: `1050` → এক হাজার পঞ্চাশ টাকা মাত্র)

### ৩. পয়সা ও "মাত্র" (Paisa & Trailing Suffix)
- দশমিক অংশ থাকলে তা পয়সা হিসেবে আলাদা যুক্ত হয় (যেমন: `12.05` → বারো টাকা পাঁচ পয়সা মাত্র)।
- দাপ্তরিক রীতিতে হিসাবের নিরাপত্তা নিশ্চিত করতে বাক্যের শেষে এককভাবে **"মাত্র"** যুক্ত হয়।

---

## 🛠️ প্রযুক্তি ও স্থাপত্য / Tech Stack & Architecture

```text
src/
├── engine/              # সম্পূর্ণ স্বাধীন কোর কনভার্সন ইঞ্জিন
│   ├── digits.ts        # বাংলা <-> ইংরেজি অঙ্ক ম্যাপিং ও কমা হ্যান্ডলিং
│   ├── parse.ts         # স্ট্রিক্ট পার্সিং ও ১৮টি নির্দিষ্ট এরর কোড
│   ├── convert.ts       # কোটি, লাখ, হাজার, শতক বিন্যাস ও পয়সা ইঞ্জিন
│   └── index.ts         # পাবলিক এপিআই (convertAmount, formatBengaliGrouping)
├── data/
│   ├── numwords.bn.json # ০ থেকে ৯৯ পর্যন্ত শব্দকোষ ও শতক/হাজার/লাখ/কোটি রূপ
│   └── examples.bn.json # সুনির্দিষ্ট টেস্ট কেস ও উদাহরণ
├── storage/             # ঐচ্ছিক অপ্ট-ইন ব্রাউজার স্টোরেজ (localStorage)
└── ui/                  # অ্যাক্সেসিবল ডম ইন্টারফেস ও ইভেন্ট হ্যান্ডলার
```

- **Frontend:** TypeScript + Modern Vanilla DOM (No bulky frameworks)
- **Bundler:** Vite
- **Testing:** Vitest (142 Unit & Property tests) + Playwright (23 Cross-browser E2E tests)
- **PWA:** Vite PWA Plugin + Workbox Service Worker
- **CI/CD:** GitHub Actions (Automated Lint, Test, Typecheck & Pages Deploy)

---

## 🚀 লোকাল সেটআপ / Local Development

প্রজেক্টটি আপনার কম্পিউটারে রান ও টেস্ট করতে:

```bash
# ১. রিপোজিটরি ক্লোন করুন
git clone https://github.com/tbahsan/TakaLekho.git
cd TakaLekho

# ২. ডিপেন্ডেন্সি ইনস্টল করুন
npm install

# ৩. ডেভেলপমেন্ট সার্ভার চালু করুন
npm run dev

# ৪. টেস্ট চালান
npm test                 # ১৪২টি Vitest টেস্ট
npm run validate:data    # ডেটা ফাইল ও ইউনিকোড হাইজিন যাচাই
npm run build            # প্রোডাকশন বিল্ড
```

---

## 👤 লেখক ও স্বত্ব / Author & License

### তৈরি করেছেন / Created By

<div align="center">

**Tasneem Bin Ahsan**  
GitHub: [@tbahsan](https://github.com/tbahsan) • Repository: [tbahsan/TakaLekho](https://github.com/tbahsan/TakaLekho)

</div>

### লাইসেন্স / License

- সোর্স কোড: **[MIT License](LICENSE)** © 2026 Tasneem Bin Ahsan.
- শব্দকোষ ও ডেটা: **MIT License**.
- আইকন ফন্ট গ্লিফ: **SIL Open Font License 1.1** ([Noto Sans Bengali](https://fonts.google.com/noto/specimen/Noto+Sans+Bengali)).

---

<div align="center">

⭐ **প্রজেক্টটি ভালো লাগলে GitHub-এ একটি Star দিন!**  
*If you find this project helpful, please consider giving it a star on GitHub!*

</div>
