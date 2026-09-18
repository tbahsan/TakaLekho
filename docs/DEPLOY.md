# DEPLOY — GitHub-এ প্রকাশ ও Pages সংযোগ

> **English TL;DR:** Push this folder to a public repo, set **Settings → Pages → Source =
> GitHub Actions**, wait for the *Deploy Pages* workflow, then open
> `https://<user>.github.io/<repo>/`. The workflow derives `PAGES_BASE_PATH` from the
> repository name, so any repo name works. Full checklist: `docs/RELEASE_CHECKLIST.md`.

এই গাইডটি শুরু থেকে শেষ পর্যন্ত: খালি GitHub অ্যাকাউন্ট থেকে লাইভ অ্যাপ।

---

## ১. আগে নিজের কম্পিউটারে যাচাই (২ মিনিট)

আপলোড করার আগে নিশ্চিত হোন যে project ঠিকভাবে চলে:

```bash
cd takalekho
npm ci                 # lockfile থেকে হুবহু একই dependency
npm run validate:data  # dataset/licence/review gate
npm test               # ১৪২টি unit test
npm run build          # dist/ তৈরি
npm run preview        # http://localhost:4173  — ব্রাউজারে খুলে দেখুন
```

`npm run preview`-তে টেবিলের কয়েকটি উদাহরণ মিলিয়ে দেখুন, কপি ও TXT ডাউনলোড চাপুন।
সব ঠিক থাকলে অগ্রসর হোন। **Node.js 20.19+ দরকার** (22 সুপারিশকৃত) — `node -v` দিয়ে দেখুন।

---

## ২. Repository তৈরি

1. GitHub → **New repository**।
2. নাম: `TakaLekho` (URL হবে `https://<user>.github.io/TakaLekho/`)।
   অন্য নাম দিলেও চলবে — base path workflow নিজেই বুঝে নেবে। **নামের বড়-ছোট হাতের অক্ষর URL-এ
   ঠিক সেইভাবেই বসে**, তাই deployed link সব সময় `https://tbahsan.github.io/TakaLekho/` লিখুন —
   ছোট হাতের `takalekho` লিখলে Pages 404 দিতে পারে।
3. Visibility: **Public**। (GitHub Pages-এর জন্য ফ্রি অ্যাকাউন্টে public repo প্রয়োজন।)
4. **Add a README / .gitignore / license — কিছুই টিক দেবেন না।** এই project-এ সব আছে।

---

## ৩. ফাইল আপলোড

### উপায় ক — Git (সুপারিশকৃত)

```bash
cd takalekho          # zip বের করা ফোল্ডার
git init
git add -A
git commit -m "feat: টাকালেখো v0.1.0 — টাকার পরিমাণ বাংলা কথায়"
git branch -M main
git remote add origin https://github.com/<your-username>/takalekho.git
git push -u origin main
```

Codespaces বা VS Code ব্যবহার করলে push করার সময় GitHub-এর নিজের authentication-ই যথেষ্ট;
কোনো token কোডে বা ফাইলে রাখবেন না।

### উপায় খ — GitHub web interface

1. Repository → **Add file → Upload files**।
2. zip থেকে বের করা ফোল্ডারের **ভেতরের সব কিছু** drag করুন (ফোল্ডারটি নয়)।
3. Commit message লিখে commit করুন।

> **সতর্কতা:** ব্রাউজার drag-and-drop মাঝেমধ্যে ডট-ফোল্ডার বাদ দেয়। আপলোডের পরে দেখে নিন
> repository-তে `.github/workflows/pages.yml`, `.github/workflows/ci.yml`,
> `.gitignore` ও `.devcontainer/` আছে কি না। না থাকলে UI থেকে **Add file → Create new file** দিয়ে
> ঠিক ওই path লিখে ফাইল তৈরি করুন (path লিখতে `/` চাপলেই ফোল্ডার তৈরি হয়), অথবা Git পথে যান।

---

## ৪. GitHub Pages চালু

1. Repository → **Settings**।
2. বাঁ দিক থেকে **Pages**।
3. **Build and deployment → Source** = **GitHub Actions**।
   (পুরোনো “Deploy from a branch” নয় — those branches don't exist in this project.)
4. কিছু deploy করতে হবে না; পরের push-এ workflow নিজেই চলবে।

### Workflow কী করে

`.github/workflows/pages.yml` — `main`-এ প্রতিটি push-এ:

```text
checkout → node 22 → npm ci → validate:data → typecheck → test
        → build (PAGES_BASE_PATH=/<repo-name>/)
        → upload artifact → deploy to GitHub Pages
```

`.github/workflows/ci.yml` প্রতিটি pull request ও `main` push-এ আগের ধাপগুলো চালায়,
সঙ্গে Playwright E2E (production build + offline + axe + subpath)।

**প্রথমবার:** Actions ট্যাবে যান → “Deploy Pages” → সবুজ টিক হলে ঠিকানা:

```text
https://tbahsan.github.io/TakaLekho/
```

কোনো ধাপ লাল হলে Actions log-এ দেখুন — সাধারণত `npm ci` ব্যর্থ হয় যখন `package-lock.json`
আপলোড হয়নি।

---

## ৫. প্রকাশের পরে যাচাই (হাতে, ৫ মিনিট)

- [ ] লাইভ URL-এ টেবিলের ডান কলামের সব উদাহরণ সত্যিই চালু ইঞ্জিন থেকে ঠিক আসছে।
- [ ] DevTools → **Network** → Reload: কোনো **404 নেই** (icons, `manifest.webmanifest`, `sw.js`)।
- [ ] হেডারে “অফলাইনের জন্য প্রস্তুত” বার্তা এসেছে (কয়েক সেকেন্ড লাগতে পারে)।
- [ ] DevTools → Network → **Offline** করে reload → অ্যাপ খোলে, `12450` লিখলে
      “বারো হাজার চারশত পঞ্চাশ টাকা মাত্র” আসে।
- [ ] কপি বাটন → পেস্ট করে দেখুন; TXT ডাউনলোডে ফাইল খোলে।
- [ ] ফোনে (Android Chrome / iOS Safari) বাংলা কীবোর্ডে টাইপ করে দেখুন।
- [ ] ভুল ইনপুট (`12.005`) দিলে পুরোনো ফলাফল কপি করা যাচ্ছে **না**।
- [ ] React/নতুন সংস্করণ বদল করার পরে “নতুন সংস্করণ এসেছে” prompt আসে, সংরক্ষিত হিসাব টিকে আছে।
- [ ] README-র live link লাইনটি নিজের username দিয়ে হালনাগাদ করেছেন।

---

## ৬. ঐচ্ছিক সমন্বয়

| পরিস্থিতি | করণীয় |
|---|---|
| Repository-র নাম `TakaLekho` ছাড়া অন্য | কিছুই নয় — workflow base path নিজে বের করে। README-র link বদলান। |
| Custom domain (`example.com`) বা user-site (`<user>.github.io`) | `pages.yml`-এ `PAGES_BASE_PATH: /${{ github.event.repository.name }}/` এর বদলে `PAGES_BASE_PATH: /` দিন। |
| Root-এ Server-এর মতো header দরকার | GitHub Pages কাস্টম HTTP header দেয় না। header-only directive (`frame-ancestors`) meta দিয়ে কাজ করে না — দেখুন `SECURITY.md`। |
| Org account / private repo | Private repo-তে Pages পেতে paid plan দরকার। |
| Deployment ব্যর্থ | Actions log দেখুন; সাধারণ কারণ: lockfile অনুপস্থিত, Node সংস্করণ, অথবা Pages source এখনো “GitHub Actions” করা হয়নি। |

---

## ৭. পরবর্তী আপডেট

```bash
git switch -c feat/my-change
# কাজ করুন
npm run validate:data && npm run typecheck && npm test && npm run build && npm run test:e2e
git add -A && git commit -m "fix: ..."
git push -u origin feat/my-change
```

তারপর Pull Request → CI সবুজ হলে merge → `main`-এ push হলে Pages নিজে থেকে নতুন সংস্করণ
deploy করবে। ব্যবহারকারীর কাছে পুরোনো ক্যাশ থাকলে অ্যাপ “নতুন সংস্করণ এসেছে” দেখাবে এবং
জোর করে reload করবে না।

## ৮. Rollback

লাইভ সংস্করণে গুরুতর ভুল থাকলে:

```bash
git revert <bad-commit-sha>
git push origin main
```

`dist/` হাতে সম্পাদনা করবেন না — Actions আবার build করবে। Rollback-এর পরে service worker
cache version বদলাবে, তাই ব্যবহারকারীরা নতুন করে load পাবেন; সংরক্ষিত হিসাব মুছবে না
(আলাদা IndexedDB/localStorage key)।

## ৯. ট্যাগ ও রিলিজ

```bash
git tag -a v0.1.0 -m "টাকালেখো v0.1.0"
git push origin v0.1.0
```

GitHub Release-এ লিখুন: কী নতুন, কী এখনো বাকি (বিশেষত শব্দ-তালিকার ভাষা-পর্যালোচনা),
এবং কীভাবে ভুল রিপোর্ট করবেন — **আসল টাকার অঙ্ক বা ব্যক্তিগত তথ্য না দিয়ে**।
