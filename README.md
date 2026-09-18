<div align="center">

# টাকালেখো · TakaLekho

**টাকার পরিমাণ, বাংলা কথায় — কোটি · লাখ · হাজার রীতিতে।**
*Write Bangladeshi taka amounts in Bengali words, using the domestic crore–lakh–thousand system.*

[![License: MIT](https://img.shields.io/badge/license-MIT-14532d)](LICENSE)
[![Tests](https://img.shields.io/badge/tests-142%20unit%20%C2%B7%2023%20e2e-14532d)](docs/EVALUATION.md)
[![PWA](https://img.shields.io/badge/PWA-offline--ready-14532d)](docs/EVALUATION.md)
[![No backend](https://img.shields.io/badge/backend-none-4b5a52)](#-বাংলা)
[![No tracking](https://img.shields.io/badge/tracking-none-4b5a52)](#-বাংলা)
[![Bundle](https://img.shields.io/badge/bundle-~12%20kB%20gzip-4b5a52)](docs/EVALUATION.md)

[বাংলা](#-বাংলা) · [English](#-english) · [GitHub Pages](#-github-pages-এ-প্রকাশ--publish-to-github-pages) · [Docs](#-ডকুমেন্টেশন--documentation)

**লাইভ অ্যাপ / Live app:** **[tbahsan.github.io/TakaLekho](https://tbahsan.github.io/TakaLekho/)**
*Repository: [github.com/tbahsan/TakaLekho](https://github.com/tbahsan/TakaLekho) — Pages চালু করার পরে লাইভ হবে / goes live once Pages is enabled.*

</div>

---

<div align="center">

| ইনপুট | বাংলা কথায় |
|---|---|
| `12450` | **বারো হাজার চারশত পঞ্চাশ টাকা মাত্র** |
| `12.5` | **বারো টাকা পঞ্চাশ পয়সা মাত্র** |
| `12.05` | **বারো টাকা পাঁচ পয়সা মাত্র** |
| `0` | **শূন্য টাকা মাত্র** |
| `0.01` | **শূন্য টাকা এক পয়সা মাত্র** |
| `1,23,45,678` | **এক কোটি তেইশ লাখ পঁয়তাল্লিশ হাজার ছয়শত আটাত্তর টাকা মাত্র** |

| ![ফলাফল](docs/screenshots/02-result.png) | ![ত্রুটি](docs/screenshots/03-error.png) | ![মোবাইল](docs/screenshots/05-mobile.png) |
|---|---|---|
| ফলাফল / result | ত্রুটি বার্তা / error | মোবাইল / mobile |

</div>

---

## 🇧🇩 বাংলা

### কেন আলাদা?

চেক, দলিল, ভাউচার বা দানপত্রে টাকার পরিমাণ কথায় লিখতে হয় — কিন্তু অনলাইনে বাংলা সংখ্যা-পদ্ধতি
(কোটি–লাখ–হাজার) ঠিকভাবে লেখে এমন সরল, বিজ্ঞাপনমুক্ত টুল কম। টাকালেখো সেটিই, শর্তসহ:

- **ব্যাকএন্ড নেই, লগইন নেই, বিশ্লেষণ (analytics) নেই।** সব হিসাব আপনার ব্রাউজারে।
- **একবার লোড হলে ইন্টারনেট ছাড়াও চলে** (service worker precache)।
- **কোনো অনুমান নয়, কোনো রাউন্ডিং নয়।** পয়সার মান বদলাতে পারে এমন ইনপুট (`12.005`)
  লুকিয়ে গোল না করে সোজা প্রত্যাখ্যান করা হয়।
- **যা করা হয়নি, তা লিখে রাখা আছে** — শব্দ-তালিকার স্বাধীন ভাষা-পর্যালোচনা এখনো বাকি।

### যা করতে পারে

| বিষয় | আচরণ |
|---|---|
| অঙ্কের লিপি | বাংলা `১২৩` **অথবা** ইংরেজি `123` — একই ইনপুটে দুটো মেশানো যায় না |
| পরিসর | `০` থেকে `৯৯,৯৯,৯৯,৯৯৯.৯৯` |
| কমা | দেশীয় রীতি `1,23,45,678`; `100,000` দিলে কারণসহ পরামর্শ দেয় |
| পয়সা | দুই ঘর; শূন্য হলে বাদ (`12.00`), অশূন্য হলে শূন্য-ছাড়া শব্দ (`12.05` → “পাঁচ পয়সা”) |
| রীতি | **দাপ্তরিক** (ডিফল্ট): একশত…শেষে “মাত্র” · **কথ্য** (পরীক্ষামূলক): একশ…, “মাত্র” ছাড়া |
| ত্রুটি | ১৮টি নির্দিষ্ট কোড, প্রতিটির সঙ্গে কারণ + সমাধানের ইঙ্গিত |
| আউটপুট | ক্লিপবোর্ড কপি · UTF-8 TXT ডাউনলোড |
| সংরক্ষণ | **ডিফল্টে কিছুই নয়**; চাইলে opt-in সাম্প্রতিক হিসাব, এক ক্লিকে সম্পূর্ণ মুছুন |
| অফলাইন | প্রথম লোডের পরে “অফলাইনের জন্য প্রস্তুত” জানায়; নেটওয়ার্ক বন্ধ করে reload করলেও কাজ করে |
| আপডেট | জোর করে reload নয় — “নতুন সংস্করণ এসেছে” prompt, সংরক্ষিত হিসাব অটুট |

<details>
<summary><strong>কোন ইনপুট প্রত্যাখ্যান করা হয় (উদাহরণসহ)</strong></summary>

| ইনপুট | কারণ |
|---|---|
| `12.005` | দশমিকের পরে দুই ঘরের বেশি — এতে পয়সা বদলে যেত |
| `12.` | দশমিকের পরে অঙ্ক নেই |
| `.50` | দশমিকের আগে অঙ্ক নেই (`0.50` লিখুন) |
| `007`, `০১২` | অপ্রয়োজনীয় শূন্য |
| `100,000` | ইংরেজি রীতির কমা (দেশীয়: `1,00,000`) |
| `1,0000`, `12,34` | কমার বিন্যাস ভুল |
| `-12`, `+12`, `1e3` | ঋণাত্মক / চিহ্ন / বৈজ্ঞানিক রূপ |
| `১২3` | একই ইনপুটে দুই লিপির অঙ্ক |
| `12 450` | সংখ্যার মাঝে ফাঁকা |
| `১২ টাকা` | ইনপুটে একক লেখা — অ্যাপ নিজেই যোগ করে |

পূর্ণ তালিকা: [`docs/SCOPE.md`](docs/SCOPE.md)

</details>

### যা করার আগে জানা দরকার (সীমাবদ্ধতা)

- **শব্দ-তালিকার স্বাধীন ভাষা-পর্যালোচনা বাকি** (`reviewStatus: pending-independent-review`)।
  তালিকা এই repository-তে লেখা ও স্বয়ংক্রিয়ভাবে যাচাই করা, কিন্তু ভাষাবিদের অনুমোদন নেই —
  অ্যাপ নিজেই এ কথা UI-তে বলে। পর্যালোচনার পত্র: [`docs/TABLE.md`](docs/TABLE.md)।
- আন্তর্জাতিক রীতি (মিলিয়ন/বিলিয়ন) নেই — v0.2-এ আলাদা চুক্তি সহ।
- ব্যাংক/আইনগত দলিলের অনুমোদিত রূপ নয়; গুরুত্বপূর্ণ দলিলে নিজে মিলিয়ে নিন।
- “কথ্য ও সংক্ষিপ্ত” রীতি পরীক্ষামূলক, স্বাধীন পর্যালোচনা ছাড়া।
- Firefox/WebKit ও প্রকৃত মোবাইল ডিভাইসে অটোমেটেড পরীক্ষা এখনো চালানো হয়নি (দেখুন
  [`docs/EVALUATION.md`](docs/EVALUATION.md))।

### গোপনীয়তা

| প্রশ্ন | উত্তর |
|---|---|
| ইনপুট কি সার্ভারে যায়? | না। কোনো ইনপুট কখনো নেটওয়ার্কে পাঠানো হয় না। |
| Analytics/CDN/রিমোট ফন্ট? | নেই — সব asset repository-তে bundled। |
| ডিফল্টে কিছু সংরক্ষিত হয়? | না। পেজ বন্ধ করলেই ইনপুট মুছে যায়। |
| ভাগ করা কম্পিউটারে? | সংরক্ষণ চালু না রাখাই সুপারিশ; চালু থাকলে এক ক্লিকে সব মুছুন। |
| “সম্পূর্ণ গোপনীয়তার নিশ্চয়তা”? | দাবি করা হয় না। GitHub Pages হোস্টিং-প্রদানকারীর মতো সাধারণ request log রাখতে পারে। |

---

## 🇬🇧 English

### Why another converter?

Writing taka amounts in words is a daily need on Bangladeshi cheques, deeds, vouchers and
receipts — but a plain, ad-free tool that follows the **domestic crore–lakh–thousand**
grouping is hard to find. TakaLekho is that tool, with explicit promises:

- **No backend, no login, no analytics, no CDN.** Every conversion happens in your browser.
- **Works offline** once loaded (service worker precache, update prompt instead of a forced reload).
- **No guessing and no rounding.** An input that would change the poisha value (`12.005`) is
  rejected with a specific reason rather than silently rounded.
- **Gaps are documented, not hidden.** The Bengali word list is machine-verified but **not yet
  signed off by an independent language reviewer** — and the app says so on screen.

### What it does

| Item | Behaviour |
|---|---|
| Digit script | Bengali `১২৩` **or** Latin `123` — never mixed in one input |
| Range | `0` to `৯৯,৯৯,৯৯,৯৯৯.৯৯` |
| Separators | Domestic grouping `1,23,45,678`; `100,000` is explained and corrected |
| Poisha | Two digits; omitted when zero (`12.00`), spoken without a leading zero (`12.05` → “পাঁচ পয়সা”) |
| Styles | **Official** (default): `একশত` … trailing “মাত্র” · **Colloquial** (experimental): `একশ`, no “মাত্র” |
| Errors | 18 specific codes, each with a Bengali reason and a fix hint |
| Output | Clipboard copy · UTF-8 TXT download |
| Storage | **Nothing by default**; optional recent-history save, cleared in one click |
| Offline | Announces “ready for offline” after the first load; works with the network off |
| Updates | Never a forced reload — an update prompt that preserves saved items |

### Development

Requires Node.js 20.19+ (22 recommended). Works in GitHub Codespaces out of the box
(`.devcontainer/`, forwarded ports 5173/4173, `postCreateCommand: npm ci`).

```bash
npm ci                 # reproducible install from the lockfile
npm run dev            # http://localhost:5173

npm run validate:data  # data gate: manifest, licence, review fields, Unicode, shape
npm run typecheck      # tsc --noEmit
npm test               # 142 unit / property / storage tests (Vitest)
npm run build          # tsc + vite build → dist/
npm run test:e2e       # 23 Playwright tests against the production build
npm run preview        # serve the production build on 0.0.0.0:4173
npm run screenshot     # regenerate docs/screenshots from the live app
```

Service workers only exist in production builds, so verify offline behaviour with
`npm run build && npm run preview` (or `npm run test:e2e`), never the dev server.

**Checking the GitHub Pages subpath locally** — GitHub project sites live under `/<repo>/`,
and root-only tests miss subpath bugs:

```bash
PAGES_BASE_PATH=/takalekho/ npm run build
PAGES_BASE_PATH=/takalekho/ npm run test:e2e
```

### Architecture

```text
src/
├── engine/        pure, DOM-free conversion engine
│   ├── digits.ts  Bengali/Latin digits + domestic grouping
│   ├── parse.ts   validation → canonical string + error code (never parseFloat)
│   ├── convert.ts amount → words (কোটি/লাখ/হাজার/শতক/একক) + wording style
│   └── index.ts   the only module the UI imports
├── data/          versioned word table and UI examples (JSON)
├── storage/       opt-in localStorage wrapper — never claims a failed write
├── ui/            DOM wiring, textContent only (no innerHTML anywhere)
└── styles.css     local CSS: dark mode, reduce-motion, visible focus
tests/
├── unit/          142 Vitest tests (engine, storage, Unicode hygiene)
├── fixtures/      golden.json — the single source of truth for accepted/rejected
└── e2e/           23 Playwright tests (UI, clipboard, download, axe, offline, subpath)
```

Measured on this build: **9.85 KB gzip JS + 2.02 KB gzip CSS**, mean conversion
**3.34 µs** (p95 5.70 µs) — see [`docs/EVALUATION.md`](docs/EVALUATION.md).

---

## 🚀 GitHub Pages-এ প্রকাশ / Publish to GitHub Pages

<details open>
<summary><strong>বাংলা — ধাপে ধাপে</strong></summary>

**১. Repository তৈরি করুন**
GitHub-এ নতুন **public** repository বানান, নাম দিন `takalekho`. README/gitignore template
যোগ করবেন না (আমাদের নিজের আছে)।

**২. ফাইল আপলোড করুন — দুই উপায়**

*via Git (সুপারিশকৃত):*

```bash
cd takalekho
git init
git add -A
git commit -m "feat: টাকালেখো v0.1.0"
git branch -M main
git remote add origin https://github.com/<your-username>/takalekho.git
git push -u origin main
```

*via GitHub web:* repository → **Add file → Upload files** → zip থেকে বের করা ফাইলগুলো
drag করুন (`.github`, `.devcontainer`, `.gitignore` ফোল্ডারগুলোসহ)। আপলোডের পরে নিশ্চিত করুন
যে `.github/workflows/pages.yml` ফাইলটি আছে — না থাকলে অটো-ডিপ্লয় চলবে না। ব্রাউজারের
drag-and-drop মাঝেমধ্যে ডট-ফাইল বাদ দেয়, তাই Git পথটি নিরাপদ।

**৩. Pages চালু করুন**
**Settings → Pages → Build and deployment → Source = “GitHub Actions”**।

**৪. অপেক্ষা করুন**
**Actions** ট্যাবে “Deploy Pages” workflow চলবে (validate → typecheck → test → build → deploy)।
সবুজ টিক এলে আপনার ঠিকানা:

```text
https://<your-username>.github.io/takalekho/
```

**৫. প্রকাশের পরে যাচাই করুন**

- টেবিলের ডান কলামে **সব ইনপুট** কাজ করছে কি না দেখুন।
- DevTools → Network: কোনো 404 নেই (icon, manifest, sw.js)।
- Network বন্ধ করে reload → অ্যাপ চলে কি না।
- কপি বাটন ও TXT ডাউনলোড মোবাইল ব্রাউজারে দেখুন।
- README-র `https://<your-username>.github.io/takalekho/` লাইনটি নিজের username দিয়ে বদলান।

**৬. ঐচ্ছিক — custom domain বা user-site**
Root-এ হোস্ট করলে (যেমন `example.com/` বা `tbahsan.github.io/`) workflow-এ
`PAGES_BASE_PATH: /` দিন। repository নাম `takalekho` ছাড়া অন্য কিছু হলে কিছু বদলাতে হবে না —
workflow নিজেই `${{ github.event.repository.name }}` থেকে base path বের করে।

পূর্ণ তালিকা: [`docs/DEPLOY.md`](docs/DEPLOY.md) ও [`docs/RELEASE_CHECKLIST.md`](docs/RELEASE_CHECKLIST.md)।

</details>

<details>
<summary><strong>English — step by step</strong></summary>

**1. Create the repository** — new **public** repo named `takalekho`, no template files
(the project ships its own README and .gitignore).

**2. Upload the files** — recommended (Git):

```bash
cd takalekho
git init && git add -A && git commit -m "feat: TakaLekho v0.1.0"
git branch -M main
git remote add origin https://github.com/<your-username>/takalekho.git
git push -u origin main
```

Or via the GitHub web UI: **Add file → Upload files**, dragging the extracted folder
contents. Verify afterwards that `.github/workflows/pages.yml` actually landed — browser
drag-and-drop sometimes skips dot-folders, and without that file nothing deploys.

**3. Enable Pages** — **Settings → Pages → Build and deployment → Source: “GitHub Actions”**.

**4. Wait for the deploy** — the "Deploy Pages" workflow runs data validation → typecheck →
tests → build → deploy, then publishes to
`https://<your-username>.github.io/takalekho/`.

**5. Smoke-test the live URL** — check a few table examples, watch for 404s in DevTools
Network (icons, manifest, `sw.js`), reload with the network off, and try copy + TXT download
on a phone.

**6. Optional** — hosting at a root path (custom domain or a `user.github.io` site) means
setting `PAGES_BASE_PATH: /` in the Pages workflow; any other repository name needs no change,
because the workflow derives the base path from `${{ github.event.repository.name }}`.

Full details: [`docs/DEPLOY.md`](docs/DEPLOY.md) and [`docs/RELEASE_CHECKLIST.md`](docs/RELEASE_CHECKLIST.md).

</details>

---

## 📚 ডকুমেন্টেশন / Documentation

| নথি / Document | বিষয় / What it covers |
|---|---|
| [`docs/SCOPE.md`](docs/SCOPE.md) | চুক্তি: target user, ইনপুট/আউটপুট, ১৮টি ত্রুটি-কোড, release gate |
| [`docs/RULES.md`](docs/RULES.md) | কথায় লেখার নিয়ম, শতক/পয়সা/“মাত্র”, নতুন রীতি যোগ করার প্রক্রিয়া |
| [`docs/DATA_SOURCES.md`](docs/DATA_SOURCES.md) | dataset manifest, লাইসেন্স, পর্যালোচনার অবস্থা |
| [`docs/EVALUATION.md`](docs/EVALUATION.md) | correctness-এর প্রমাণ, মাপা পারফরম্যান্স, কী এখনো বাকি |
| [`docs/ACCESSIBILITY.md`](docs/ACCESSIBILITY.md) | a11y মান, axe টেস্ট, যা স্বয়ংক্রিয়ভাবে হয় না |
| [`docs/DEPLOY.md`](docs/DEPLOY.md) | GitHub-এ প্রকাশ ও Pages সংযোগের পূর্ণ গাইড |
| [`docs/RELEASE_CHECKLIST.md`](docs/RELEASE_CHECKLIST.md) | tag দেওয়ার আগে ধাপে ধাপে যাচাই |
| [`docs/TABLE.md`](docs/TABLE.md) | ০–৯৯ শব্দ-তালিকার পর্যালোচনা-পত্র (ভাষা-পর্যালোচকের জন্য) |
| [`CHANGELOG.md`](CHANGELOG.md) | সংস্করণ, পরিবর্তন ও `amount-changing` চিহ্ন |
| [`CONTRIBUTING.md`](CONTRIBUTING.md) | অবদানের নিয়ম (নতুন শব্দ/রীতি যোগ করার প্রক্রিয়া) |
| [`SECURITY.md`](SECURITY.md) | থ্রেট মডেল ও নিরাপত্তা রিপোর্ট |
| [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md) | তৃতীয়-পক্ষ উপাদানের লাইসেন্স |

## 🛣️ রোডম্যাপ / Roadmap

- **v0.1.0 (এখন):** দাপ্তরিক + কথ্য রীতি, দেশীয় সংখ্যা-পদ্ধতি, অফলাইন PWA, opt-in সংরক্ষণ।
- **পরের ধাপ:** স্বাধীন বাংলা ভাষা-পর্যালোচনার রেকর্ড (`reviewStatus: reviewed`), Firefox/WebKit
  ও প্রকৃত মোবাইল ডিভাইসে পরীক্ষা, screenshot-এ ডার্ক মোড।
- **v0.2 (প্রতিশ্রুতি নয়):** আন্তর্জাতিক রীতি (মিলিয়ন/বিলিয়ন) — আলাদা চুক্তি ও fixtures সহ;
  অতিরিক্ত wording presets।

## ⚖️ লাইসেন্স / License

কোড: **MIT** ([`LICENSE`](LICENSE)) · শব্দ-তালিকা ও ডেটা: **MIT** ·
আইকনের গ্লিফ: **Noto Sans Bengali (SIL OFL 1.1)** — বিস্তারিত [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md)।

<div align="center">

**ছোট, সত্য, পরীক্ষিত প্রতিশ্রুতি** — *small, true, tested promises.*
ভুল বানান বা ভুল রূপান্তর পেলে issue খুলুন — কিন্তু **আসল টাকার অঙ্ক বা ব্যক্তিগত তথ্য লিখবেন না**।

</div>
