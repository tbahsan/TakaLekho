# SECURITY

## ১. থ্রেট মডেল (এই অ্যাপের প্রকৃত ঝুঁকি)

টাকালেখো একটি static, browser-only অ্যাপ: কোনো backend, database, account বা API key নেই।
তাই ঝুঁকির তালিকা ছোট এবং নির্দিষ্ট।

| ঝুঁকি | বাস্তবায়িত প্রতিকার |
|---|---|
| ব্যবহারকারীর লেখা দিয়ে DOM XSS | সব আউটপুট `textContent`/`createElement` দিয়ে বসানো; কোথাও `innerHTML` নেই |
| Remote code/CDN-compromise | কোনো CDN, remote font বা third-party runtime script নেই; সব asset repository-তে |
| Trackers/analytics | নেই; কোনো request তৃতীয় পক্ষে যায় না (`tests/e2e/offline.spec.ts`-এ assert করা) |
| সংবেদনশীল ইনপুট জমা থাকা | ডিফল্টে কিছুই সংরক্ষিত হয় না; opt-in করলে কেবল `localStorage`; এক ক্লিকে মুছে ফেলা যায় |
| ভাগ করা কম্পিউটারে ফাঁস | সেশন-ডিফল্ট আচরণ + UI-তে সেভ না করার সুপারিশ |
| Malformed storage ডেটা | `schemaVersion` mismatch/ভাঙা JSON চুপচাপ ব্যবহার নয় — খালি ধরে নেওয়া ও UI-তে জানানো |
| Quota/blocked storage | ব্যর্থ write-এ মিথ্যা “saved” বার্তা নেই; ব্যবহারকারী কপি করে নিতে পারেন |
| Regex DoS | সব regex সীমিত ইনপুটে (≤৬৪ অক্ষর) চলে; catastrophic backtracking-প্রবণ প্যাটার্ন নেই |
| Dependency compromise | pinned lockfile (`npm ci`), ন্যূনতম dependency, `npm audit` release-চেকলিস্টে |
| CSV/স্প্রেডশিট ইনজেকশন | v0.1.0-এ কোনো CSV export নেই (একমাত্র টেক্সট export); CSV যোগ হলে escape নিয়ম যোগ করতে হবে |

## ২. যা এই পরিবেশে কাস্টমাইজ করা যায় না

GitHub Pages কাস্টম HTTP security header দিতে দেয় না। `frame-ancestors`-এর মতো header-only
directive `<meta http-equiv="Content-Security-Policy">` দিয়ে কার্যকর হয় না, তাই
**meta CSP বসানো হলে সেটি browser-এ হাতে পরীক্ষা করা বাধ্যতামূলক** — Worker, font, Blob
download বা service worker ভেঙে গেলে সেটি নিরাপত্তার বদলে ক্ষতি করবে। এই মুহূর্তে কোনো CSP
meta tag যোগ করা হয়নি (ওপরে তালিকাভুক্ত প্রতিকারগুলো structural: কোড কোনো untrusted HTML
ইনজেক্টই করে না)।

## ৩. নিরাপত্তা ইস্যু রিপোর্ট করা

- **করবেন না:** public issue-এ দুর্বলতার বিস্তারিত পোস্ট।
- **করুন:** repository-র owner-কে (`tbahsan`) সরাসরি message, অথবা GitHub-এর
  “Report a vulnerability” (Security → Advisories) ব্যবহার করুন।
- রিপোর্টে যা থাকলে দ্রুত ব্যবস্থা নেওয়া সহজ হয়:
  1. প্রভাবিত সংস্করণ (`package.json`-এর version, `docs/EVALUATION.md`-এর bundle তথ্য),
  2. পুনরুৎপাদনের ধাপ (কোন ইনপুট, কোন ব্রাউজার),
  3. সম্ভাব্য প্রভাব (যেমন: “ফলাফল text হিসেবে নয়, HTML হিসেবে রেন্ডার হচ্ছে”),
  4. সম্ভব হলে PoC — **কিন্তু আসল টাকার অঙ্ক বা ব্যক্তিগত তথ্য দিয়ে নয়**।
- প্রত্যাশিত সমাধান-সময়: স্বেচ্ছাসেবী প্রকল্প হিসেবে ৭ দিনের মধ্যে প্রাথমিক সাড়া দেওয়ার চেষ্টা;
  কোনো নির্দিষ্ট সময়সীমার প্রতিশ্রুতি নয়।

## ৪. Contributors-দের জন্য নিয়ম

- `innerHTML`, `insertAdjacentHTML`, `outerHTML`, `document.write`, `eval`, `new Function`
  ব্যবহার করা যাবে না। এগুলো code review-তে সরাসরি প্রত্যাখ্যাত হবে।
- Untrusted SVG/HTML import যোগ করা যাবে না (v0.1.0 scope-এ নেই)।
- প্রতিলিপিকৃত (copied) কোড বা ডেটা যোগ করার আগে লাইসেন্স যাচাই করে PR-এ উল্লেখ করুন।
- লগ, টেস্ট fixture বা commit message-এ আসল ব্যক্তিগত আর্থিক ডেটা রাখবেন না।
- GitHub token/secret কোনো ফাইলে, README-এ বা workflow-এ hardcode করবেন না; Codespaces
  authentication-ই যথেষ্ট।

## ৫. জানা সীমাবদ্ধতা

- `localStorage` ব্রাউজারের থ্রেড/extension বা ডিভাইসে থাকা কারও কাছে পড়া সম্ভব — অ্যাপ
  এখানে কোনো অতিরিক্ত encryption প্রতিশ্রুতি দেয় না। অত্যন্ত গোপনীয় হিসাবের জন্য সংরক্ষণ
  চালু না রাখাই সঠিক।
- Cross-site scripting-এর ঝুঁকি মূলত শূন্য কারণ কোনো user input কখনো markup হয় না, তবে
  ভবিষ্যতে কোনো feature (যেমন POS tagging বা rich-text সম্পাদনা) যোগ হলে থ্রেট মডেল পুনরায়
  মূল্যায়ন করতে হবে।
