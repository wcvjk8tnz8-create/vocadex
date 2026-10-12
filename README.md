# Vocadex

**Vocadex** is an English vocabulary and exercise platform built for the students of
**P.L.K. Siu Hon Sum Primary School** (保良局蕭漢森小學 · `plkshs.edu.hk`).

It looks and plays a little like Duolingo: short, cheerful exercises, chunky buttons,
streaks of encouragement — but every question is generated from the Hong Kong
primary English curriculum.

---

## Highlights

| | |
|---|---|
| **Stack** | Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 |
| **Look** | Frosted-glass panels (`backdrop-filter: blur()`), warm accent colours — **no blue-violet gradients** |
| **Type** | English: `Momo Trust Sans` → `Comic Sans MS`. Chinese: 楷體 (KaiTi) → 宋體 (SimSun) |
| **Curriculum** | P1–P6 × Term 1 / Term 2 × 4 units = **48 units**, each with vocabulary, sentence patterns, a passage and reading questions |
| **Levels** | easy · medium · hard · extremely hard · impossible |
| **Energy** | Max 100 · −2 per question · **+50 every 12 hours** |
| **Rewards** | Score **90%+** in a Unit Exercise → level up + a **real mystery gift**, and the teacher is notified automatically |

---

## Screens

### Sidebar
`Home` · `Energies` · `Exercises` · `Settings`, with **Log Out** pinned at the bottom
and the copyright line **© PLKSHS / 版權歸 PLKSHS 所屬** beneath it.

### Home
- Left: account name + school email
- Right: **Choose Exercises** → `Daily Exercises` and `Daily New Words`
- Before starting, pick **grade (P1–P6)**, **term (上學期 / 下學期)** and **difficulty**
- Words are generated randomly from the selected unit

### Energies
A progress ring showing energy out of 100, a live countdown to the next refill,
and the recent practice history.

### Exercises
| Exercise | 中文 |
|---|---|
| Daily Exercises | 每日練習 |
| Daily New Words | 每日新詞 |
| Guess The Words | 看圖猜詞語 |
| Reorganize Sentences | 重組句子 |
| Link The Words | 中英文配對 |
| Read To Answer | 閱讀理解 |
| Fill In The Blank | 填空題 |
| Unit Exercises | 單元評估 |

`Unit Exercises` mixes **all** skills into one test. Reaching **90%** promotes the
student to the next unit (a completely different topic) and unlocks the mystery gift.

### Settings
- **11 hand-drawn avatars** (chicken, cow, dog, cat, sheep, boy, girl, heroine, hero,
  moon, snowman) — pure SVG, no emoji fonts
- Display name auto-derived from the email: `saratan@plkshs.edu.hk → Sara Tan`,
  `211B0000@plkshs.edu.hk → 211B0000`
- **Theme colours**: Beige 米色 · Brown 棕色 · Light Purple 淺紫色 · Sky Blue 天空藍
- **Backgrounds**: the two school photos plus a plain paper option

### Teacher dashboard — `/teacher`
When a student earns a gift, the request is uploaded to the server. The teacher
opens `/teacher`, enters the teacher key and sees everyone who is waiting for a gift,
then marks each one **given**. The list can be exported as CSV.

---

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
```

```bash
npm run build && npm start   # production
```

Sign in with any `@plkshs.edu.hk` address — for example
`saratan@plkshs.edu.hk` or `211B0000@plkshs.edu.hk`.

---

## Deploy to Vercel

1. Push this repository to GitHub (already done), then
   **vercel.com → Add New → Project → Import** `wcvjk8tnz8-create/vocadex`.
2. Framework preset is detected automatically (**Next.js**) — keep every default.
3. Add the environment variables (Project → Settings → Environment Variables):

   | Name | Value |
   |---|---|
   | `TEACHER_KEY` | the password teachers type on `/teacher` (e.g. `plkshs`) |
   | `UPSTASH_REDIS_REST_URL` | from console.upstash.com |
   | `UPSTASH_REDIS_REST_TOKEN` | from console.upstash.com |

4. **Deploy.** Vercel builds with `npm run build` and serves the App Router routes
   together with the `/api/gifts` and `/api/progress` serverless functions.

> **Important:** Vercel's file system is read-only. Without Upstash, gift requests
> are kept in the memory of whichever instance happens to serve the request, so they
> can disappear between requests. The free Upstash tier is more than enough for a
> whole school — connect it before going live.

### Going live checklist

- [ ] Set a real `TEACHER_KEY` and share it with the English panel only
- [ ] Connect Upstash Redis
- [ ] Visit `/teacher`, enter the key and confirm the dashboard loads
- [ ] Try a unit test at 90%+ on a student account and confirm the request appears

---

## Cloud back-end (mystery-gift notifications)

Students and teachers share the same Next.js server, so no extra service is needed.

| Route | Who | What |
|---|---|---|
| `POST /api/gifts` | student | uploads a gift request when a unit test scores 90%+ |
| `GET /api/gifts?key=…` | teacher | lists all requests + student snapshots |
| `PATCH /api/gifts` | teacher | marks a gift `given` / back to `pending` |
| `POST /api/progress` | student | syncs profile, energy and unit records |
| `GET /api/progress?email=…` | student | syncs back down on another device |

Storage (`src/lib/server/db.ts`) picks one of two back-ends automatically:

1. **Upstash Redis REST** — set `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`.
   Free tier is plenty, and it works on Vercel / Netlify / any serverless host.
2. **Local JSON file** — `.data/vocadex.json`, for any ordinary Node server.

```bash
# .env.local
TEACHER_KEY=plkshs
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

Without any environment variables the app still works fully offline: progress is kept
in `localStorage` and gift requests queue locally, then upload as soon as the server
is reachable.

Students also **sync down on sign-in**: `/api/progress?email=…` returns their saved
profile, energy and unit records, so signing in on a school computer or at home keeps
the same unit level and the same energy — a fresh device never gets a free refill.

---

## Curriculum data

Words live in two plain data files, so teachers can edit them directly:

- `src/lib/data/lower-primary.ts` — P1–P3
- `src/lib/data/upper-primary.ts` — P4–P6

Each unit follows the EDB *English Language Education Key Learning Area Curriculum
Guide (Primary 1–6)* and the themes used by mainstream textbooks
(Longman Elect / Oxford New Magic / PLPR-W), for example:

| Grade | Term | Unit 1 | Unit 2 | Unit 3 | Unit 4 |
|---|---|---|---|---|---|
| P1 | T1 | Me and My Family | My Body | Colours and Shapes | My School Things |
| P2 | T1 | Places at School | Please Be Good! | My Day | Clothes We Wear |
| P3 | T1 | Using My Five Senses | Let's Go Shopping | Fun with Cooking | Weather and Seasons |
| P4 | T1 | Healthy Habits | Amazing Animals | Wonderful Hong Kong | Art Around Us |
| P5 | T1 | The Magic of Nature | Outdoor Fun and Safety | Light, Sound and Inventions | Helping Others |
| P6 | T1 | Environmental Protection | News and Events | Technology and the Future | Jobs and Dreams |

Replace these with the school's own textbook word lists at any time — the exercise
generators read whatever is in these files, so no other code needs to change.

---

## Project layout

```
src/
  app/
    page.tsx                     login (email → display name)
    (app)/layout.tsx             sidebar + glass shell
    (app)/home/                  account + Choose Exercises
    (app)/energies/              energy ring, refill countdown
    (app)/exercises/             all eight exercise types
    (app)/play/[kind]/           the exercise player
    (app)/settings/              avatar, theme, background, level
    teacher/                     teacher dashboard
    api/gifts/                   gift requests (student → teacher)
    api/progress/                student snapshot sync
  components/
    Avatar.tsx                   11 hand-drawn SVG characters
    WordArt.tsx                  hand-drawn pictures for Guess The Words
    Sidebar.tsx  PracticeSetup.tsx  ThemeStyle.tsx
  lib/
    curriculum.ts  exercises.ts  store.tsx  types.ts
    data/lower-primary.ts  data/upper-primary.ts
    server/db.ts                 storage adapter (Redis / JSON file)
public/backgrounds/              school photos used as backgrounds
```

---

---

## Logo

`public/logo.png` is the Vocadex mark (blue "V" with the orange book/page accent).
It is used as the browser favicon (`src/app/icon.png`), the sidebar badge, and the
sign-in screen. Replace that single file to rebrand the whole app.

---

Copyright © PLKSHS · 版權歸保良局蕭漢森小學（PLKSHS）所屬
