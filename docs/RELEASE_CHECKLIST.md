# RELEASE CHECKLIST — টাকালেখো

প্রতিটি release tag করার আগে এই তালিকা ধাপে ধাপে মিলিয়ে দেখুন। যেকোনো বাক্স খালি থাকলে
release নয় — অন্তত CHANGELOG-এ কারণ ও সীমা লিখুন।

## ০. প্রস্তুতি (একবার)

প্রথমবার প্রকাশের পূর্ণ ধাপ ও কমান্ড: [`DEPLOY.md`](DEPLOY.md)।

- [ ] Repository owner `tbahsan` নিশ্চিত; `LICENSE`-এর copyright holder নাম বসানো।
- [ ] README-র লাইভ লিংক `https://tbahsan.github.io/TakaLekho/` ঠিক আছে।
- [ ] GitHub → Settings → Pages → Source = **GitHub Actions**।
- [ ] Repository-টি public; branch protection-এ CI pass বাধ্যতামূলক।

## ১. ডেটা ও ভাষা

- [ ] `npm run validate:data` pass (manifest, licence, review field, Unicode, shape)।
- [ ] `docs/TABLE.md` ও `docs/TABLE.csv` নতুন করে তৈরি (`node scripts/build-table.mjs`)।
- [ ] **স্বাধীন বাংলা ভাষা-পর্যালোচনা** — সম্পন্ন হলে `reviewStatus: "reviewed"`,
      `reviewer`, `reviewedAt` বসানো; না হলে UI/README-তে সীমাটি স্পষ্ট লেখা আছে কি না যাচাই।
- [ ] নতুন কোনো শব্দ/রীতি যোগ হলে `CHANGELOG.md`-এর `amount-changing` এন্ট্রি আছে।

## ২. কোড ও পরীক্ষা (সবগুলো CI-তেও চলে)

- [ ] `npm ci`
- [ ] `npm run validate:data`
- [ ] `npm run typecheck`
- [ ] `npm test` (১৪২টি unit test)
- [ ] `npm run build`
- [ ] `npm run test:e2e` (২২টি E2E — UI, ক্লিপবোর্ড, ডাউনলোড, axe, offline)
- [ ] `PAGES_BASE_PATH=/takalekho/ npm run test:e2e` (subpath-এ একই suite)
- [ ] প্রত্যাশিত output-এর কোনো পরিবর্তন নেই, অথবা CHANGELOG-এ লেখা আছে।

## ৩. প্রকৃত Pages deployment-এর পরে smoke test

- [ ] `https://tbahsan.github.io/takalekho/` খোলে; DevTools Network-এ **কোনো 404 নেই**
      (font, icon, manifest, sw.js)।
- [ ] প্রথম load শেষে “অফলাইনের জন্য প্রস্তুত” বার্তা আসে (দ্রুত হলে DevTools → Application → Service Workers দেখুন)।
- [ ] Network → Offline করে reload → অ্যাপ খোলে ও রূপান্তর করে।
- [ ] নতুন release-এর পরে পুরোনো ক্যাশ থেকে “নতুন সংস্করণ এসেছে” prompt আসে; সংরক্ষিত হিসাব টিকে থাকে।
- [ ] মোবাইলে (Android Chrome, iOS Safari) বাংলা কীবোর্ড দিয়ে টাইপ, কপি, TXT ডাউনলোড পরীক্ষা।
- [ ] স্ক্রিন-রিডারে (NVDA/TalkBack) ইনপুট, ত্রুটি ও ফলাফল পড়া যায়।
- [ ] “সংরক্ষিত সব মুছুন” চাপার পরে `localStorage` সত্যিই খালি (DevTools → Application → Storage)।

## ৪. নিরাপত্তা ও গোপনীয়তা

- [ ] `git log -p`-এ কোনো আসল টাকার অঙ্ক, token বা ব্যক্তিগত ডেটা নেই।
- [ ] `dist/` বা `node_modules/` commit হয়নি; `.gitignore` ঠিক আছে।
- [ ] `THIRD_PARTY_NOTICES.md` হালনাগাদ (কাল্পনিক কিছু নেই)।
- [ ] `SECURITY.md` পড়ে দেখা হয়েছে; জানা দুর্বলতা নেই।
- [ ] Dependency audit: `npm audit --omit=dev` — ফলাফল CHANGELOG-এ লেখা।
- [ ] Meta CSP-তে এমন কোনো directive নেই যা Worker/Blob/audio/font ভেঙে দেয় (ব্রাউজারে হাতে যাচাই)।

## ৫. Documentation

- [ ] README-তে উদাহরণ, সীমাবদ্ধতা, গোপনীয়তা ও রেসিপি ঠিক আছে।
- [ ] `docs/SCOPE.md` কোডের আচরণের সঙ্গে মেলে (বিশেষত ত্রুটি-তালিকা)।
- [ ] `docs/EVALUATION.md`-এ মাপা সংখ্যা হালনাগাদ।
- [ ] `CHANGELOG.md`-এ সংস্করণ, তারিখ, পরিবর্তন ও `amount-changing` চিহ্ন।
- [ ] Screenshot হালনাগাদ (যদি UI বদলে থাকে)।

## ৬. Tag ও rollback

- [ ] `package.json` version = tag name; table version আলাদা রাখা হয়েছে।
- [ ] Tag: `git tag -a v0.1.0 -m "v0.1.0"` → push tag।
- [ ] GitHub Release-এ: কী নতুন, কী এখনো বাকি, পর্যালোচনার অবস্থা।
- [ ] Rollback পরিকল্পনা: শেষ ভালো commit-এ `git revert` (কখনো `dist/` হাতে সম্পাদনা নয়),
      তারপর redeploy; service worker cache version-এর আচরণ পুনরায় যাচাই।
- [ ] Issue ট্র্যাকিং চালু; ব্যবহারকারীকে বলা হয়েছে **আসল টাকার অঙ্ক বা ব্যক্তিগত আর্থিক তথ্য
      issue-তে লিখবেন না**।
