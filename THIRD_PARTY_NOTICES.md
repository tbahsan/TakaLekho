# THIRD_PARTY_NOTICES

এই প্রকল্পে ব্যবহৃত তৃতীয় পক্ষের উপাদান, তাদের লাইসেন্স ও এখানে কীভাবে ব্যবহৃত হয়েছে।
`LICENSE` (MIT) কেবল এই repository-র নিজস্ব কোড ও ডেটার জন্য; নিচের উপাদানগুলোর লাইসেন্স
আলাদা এবং সেগুলো MIT হিসেবে পুনঃলেবেল করা হয়নি।

## ১. Bundled (repository-তে থাকা) উপাদান

| উপাদান | সংস্করণ/উৎস | লাইসেন্স | এখানে কীভাবে ব্যবহৃত | ফাইল |
|---|---|---|---|---|
| Noto Sans Bengali | Google Fonts / notofonts | SIL Open Font License 1.1 | `public/icons/icon-192.png`, `icon-512.png` — ৳ (U+09F3) গ্লিফের পথ থেকে আঁকা আইকন | `public/icons/*` |
| শব্দ-তালিকা (০–৯৯, শতক, কোটি/লাখ/হাজার, টাকা/পয়সা/মাত্র) | এই repository-তে লেখা | MIT | ইঞ্জিনের শব্দ-উৎস | `src/data/numwords.bn.json` |
| উদাহরণ ও ফিক্সচার | এই repository-তে লেখা | MIT | টেস্ট ও UI টেবিল | `src/data/examples.bn.json`, `tests/fixtures/golden.json` |

**লক্ষ্য করুন:** অ্যাপে web font *ফাইল* bundling করা হয়নি — শুধু CSS `font-family` তালিকা দেওয়া
আছে, যাতে ব্যান্ডউইথ কম থাকে এবং অফলাইন সাইজ ছোট হয়। অর্থাৎ Noto Sans Bengali কেবল আইকন
আঁকতে (build-time) ব্যবহৃত, runtime-এ নয়। কোনো font ফাইল যোগ করলে অর্থবহ পথে OFL-এর
`OFL.txt` ও copyright notice bundle করতে হবে।

অন্য কোনো গ্লিফ বা ফন্ট রিসোর্স আইকনে সাইড-লোড করা হয়নি; অ্যাপ runtime-এ কোনো remote
font, CDN বা third-party script লোড করে না।

## ২. Development dependency (পণ্যে bundled নয়)

`package.json`-এ ব্যবহৃত মূল toolchain, সবই MIT/ISC/Apache-2.0 শ্রেণির এবং build-সময়ে চলে:

| প্যাকেজ | উদ্দেশ্য | লাইসেন্স (যাচাইয়ের সময় নিশ্চিত করুন) |
|---|---|---|
| vite | build/dev server | MIT |
| typescript | টাইপ যাচাই ও compile | Apache-2.0 |
| vitest | unit test | MIT |
| @playwright/test | browser/E2E test | Apache-2.0 |
| @axe-core/playwright / axe-core | অ্যাক্সেসিবিলিটি পরীক্ষা | MPL-2.0 |
| vite-plugin-pwa (Workbox) | service worker precache | MIT |

লাইসেন্সসমূহ (`node_modules/<pkg>/LICENSE`) release-এর আগে হাতে মিলিয়ে দেখা উচিত, কারণ
সংস্করণ বদলালে লাইসেন্স বদলাতে পারে। `npm ls --all` দিয়ে পূর্ণ গাছ দেখা যায়।

## ৩. যা ব্যবহার করা হয়নি (স্পষ্ট ঘোষণা)

- কোনো বাণিজ্যিক অভিধান, ওয়ার্ড-লিস্ট বা মালিকানাধীন corpus থেকে কোনো এন্ট্রি নেওয়া হয়নি।
- কোনো অনুমতিহীন scanned বই, poem, অথবা copyrighted prose bundle করা হয়নি।
- কোনো ব্যাংক/সরকারি নথির ইলেকট্রনিক template বা ওয়ার্ডিং সেট কপি করা হয়নি।
- কোনো analytics, ad, tracker বা remote API শুরু থেকেই নেই (এবং যোগ করা হবে না)।

## ৪. Contribution-এ asset যোগ করার নিয়ম

1. উৎস, সংস্করণ, লাইসেন্স ও bundling-এর কারণ PR-এ লেখা বাধ্যতামূলক।
2. “ফ্রি ডাউনলোড করা যায়” = “পুনর্বিতরণ করা যায়” নয়। ব্যবহারের অনুমতি অবশ্যই documented হতে হবে।
3. ইলাস্ট্রেশন/অডিও/ফন্টের ক্ষেত্রে creator-এর নাম ও license file bundle করুন।
4. এই ফাইল হালনাগাদ না করে কোনো তৃতীয়-পক্ষ asset merge করা হবে না — release checklist-এ
   সেই ধাপ আছে।
