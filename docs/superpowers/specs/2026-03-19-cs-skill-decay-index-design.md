# CS Skill Decay Index — Design Spec

## Overview

A Next.js quiz app that measures how much AI has eroded a CS engineer's foundational skills. 7 scenario-based questions, terminal-aesthetic UI, scores stored in Turso. Clone of [SigNoz SRE Skill Decay Index](https://signoz.io/sre-skill-decay-index/), adapted for computer science engineers.

## Architecture

Single Next.js app with API routes. One page, three client-side views toggled by state.

```
User lands → Hero (live stats from GET /api/stats)
          → Clicks "Run Diagnostic"
          → Quiz (7 questions, all client-side)
          → Score computed client-side
          → POST /api/submit → Turso
          → Results page
```

### Tech Stack

- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS
- **Fonts:** JetBrains Mono (monospace/labels), Syne (headlines), Outfit (body) — via `next/font/google`
- **Database:** Turso (libSQL) — `libsql://skilldecay-pandawhocodes.aws-ap-south-1.turso.io`
- **Deployment:** Vercel

## Pages & Routes

### Single Page: `/`

Three views managed by `useState`:

1. **Hero** — landing with animated counters, CTA
2. **Quiz** — 7 sequential questions
3. **Results** — score, breakdown, sharing

### API Routes

**`GET /api/stats`**
- Returns `{ totalAssessed, decayPercentage, avgSeverity }`
- Reads from single-row `stats` table

**`POST /api/submit`**
- Receives `{ score, level, breakdown }`
- Inserts into `submissions` table
- Atomically updates `stats` row
- Returns `{ success: true }`

**`GET /api/og`**
- Query params: `?score=6.7&level=high&roast=Your+AI+assistant+has+become+your+load-bearing+wall.`
- Returns a dynamically generated PNG image (1200×630) using `next/og` (`ImageResponse`)
- Used as the `og:image` meta tag when sharing results
- Dark terminal aesthetic matching the app's design

## Database Schema (Turso)

```sql
CREATE TABLE submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    score REAL NOT NULL,
    level TEXT NOT NULL,
    breakdown TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE stats (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    total_assessed INTEGER DEFAULT 0,
    total_score REAL DEFAULT 0,
    decay_count INTEGER DEFAULT 0
);

INSERT INTO stats (id, total_assessed, total_score, decay_count) VALUES (1, 0, 0, 0);
```

## UI Design

### Visual Style

- Dark background (`#0a0a0a` range)
- Dot grid pattern overlay
- Terminal-style scenario boxes (dark surface, green monospace text, blinking `>` cursor)
- Red accent color (`#ff3d3d`) for CTAs, progress bar, score highlights
- Three font families: JetBrains Mono, Syne, Outfit

### Hero View

- Pill badge: "From the engineers who still whiteboard"
- Headline: "How much has AI **Deskilled** You?"
- Subheadline: "7 real-world CS scenarios. Zero AI assistance. Find out how much muscle memory you've lost since you started letting copilots think for you."
- Red CTA: "Run Diagnostic →"
- 3 animated counters (fetched from `/api/stats`):
  - Engineers assessed (count-up animation)
  - Show decay % (computed: `decay_count / total_assessed * 100`)
  - Avg severity (computed: `total_score / total_assessed`)

### Quiz View

- Fixed top bar: progress bar (red, animated width) + "3 / 7" counter
- Terminal box with scenario text (green monospace, blinking `>`)
- Bold question below scenario
- 4 option buttons with A/B/C/D labels
  - Hover: slide right + red left border
  - Click: immediately advance to next question

### Results View

- Big score number, colored by level
- Severity label (e.g., "Significant Decay — AI-Dependent")
- Random roast quote
- Skill Atrophy Breakdown: 5 horizontal bars, animated fill, colored by level
- Share buttons: X (Twitter), LinkedIn, Copy text
  - Each generates a shareable URL: `yoursite.com?s=6.7&l=high&r=0` (score, level, roast index)
  - The URL has `og:image` pointing to `/api/og?score=6.7&level=high&roast=...`
  - When shared on X/LinkedIn/Slack/WhatsApp, a rich preview card renders:
    - Score, level label, roast quote, "How deskilled are YOU? → Take the quiz"
  - Pre-filled share text: "I just took the CS Skill Decay Index and scored X/10 — [level]. How deskilled are YOU?"
- Bainbridge quote + credit link to SigNoz
- "Run diagnostic again" link

## Social Sharing / OG Image

### Share Flow
1. User finishes quiz → sees results
2. Clicks "Share on X" → opens Twitter intent with pre-filled text + shareable URL
3. Shareable URL encodes score in query params: `?s=6.7&l=high&r=0`
4. Page reads query params → if present, sets `og:image` to `/api/og?score=6.7&level=high&roast=...`
5. Social platforms auto-render the card image in previews → creates social pull

### OG Image Design (1200×630 PNG, generated via `next/og`)
```
┌─────────────────────────────────────────┐
│  CS SKILL DECAY INDEX                   │
│                                         │
│              6.7                         │
│    ─── Significant Decay ───            │
│                                         │
│  "Your AI assistant has become          │
│   your load-bearing wall."              │
│                                         │
│  How deskilled are YOU? → Take the quiz │
└─────────────────────────────────────────┘
```
- Dark bg matching the app
- Score number in large bold, colored by level (green/amber/red)
- Level label below score
- Roast quote in italics
- CTA at the bottom

### Shareable URL Handling
- When page loads with `?s=X&l=Y` query params:
  - Set dynamic `og:image` meta tag for that specific score (for social crawlers)
  - Still show the hero/landing page for human visitors (they take their own quiz)
- This means the OG image is personalized per share, but the destination is always the quiz start

## Scoring Logic (Client-Side)

### Questions

7 questions, each with 4 options scored 0–3:
- 0 = Expert (first-principles thinking)
- 1 = Solid (reasonable but missing depth)
- 2 = Surface-level (treats symptoms)
- 3 = AI-dependent

### Categories

| Category | Questions | Display Label |
|----------|-----------|---------------|
| `algorithms` | Q1, Q5 | Algorithmic Thinking |
| `systems` | Q2, Q6 | Systems Intuition |
| `debugging` | Q3 | Debugging Instinct |
| `architecture` | Q4 | Architecture & Design |
| `meta` | Q7 | Self-Awareness |

### Score Computation

- **Final score:** `(sum of all scores) / (3 * 7) * 10` → 0 to 10
- **Per-category:** `(sum of category scores) / (3 * count) * 10` → 0 to 10
- **Level thresholds:** `≤2.5` low, `≤5` mid, `≤7.5` high, `>7.5` critical

### Colors by Level

| Level | Color | Usage |
|-------|-------|-------|
| Low | `#00ff9d` | Score, bars |
| Mid | `#ffb020` | Score, bars |
| High | `#ff3d3d` | Score, bars |
| Critical | `#ff3d3d` + glow | Score, bars, extra shadow |

### Roast Messages

**Low:** "You still think in algorithms, not autocomplete suggestions. Dijkstra would be proud." / "Your CS fundamentals are intact. The AI is your tool, not your brain."

**Mid:** "You're in the uncanny valley of deskilling — fast enough to feel competent, rusty enough to struggle without a copilot." / "You remember that Big O exists, but you'd need a minute to tell O(n log n) from O(n²)."

**High:** "You've traded deep understanding for autocomplete confidence. When the AI hallucinates, you won't even notice." / "Your AI assistant has become your load-bearing wall. Remove it and the whole building comes down."

**Critical:** "You've achieved full abstraction collapse — you depend on a tool that depends on the knowledge you've stopped maintaining." / "You don't use AI as a tool. AI uses you as a rubber stamp."

### Sample Recent Diagnostics (Static)

| Role | Roast | Score |
|------|-------|-------|
| Backend Dev, 6 YOE | "Knows how to `npm install` but forgot how `require` works." | 7.2 |
| Full-stack Eng, 4 YOE | "Still writes SQL by hand. Respect." | 5.8 |
| Tech Lead, 8 YOE | "Architects the architecture. Can't implement either." | 8.4 |
| Junior Dev, 1 YOE | "Never coded without Copilot. Never-skilled." | 9.1 |
| Systems Programmer, 5 YOE | "Still reads man pages at 3 AM. Unbreakable." | 3.4 |
| Frontend Dev, 3 YOE | "The Stack Overflow bookmark folder is the only thing between you and chaos." | 6.7 |

## Submit Payload

```json
{
  "score": 6.7,
  "level": "high",
  "breakdown": [
    { "category": "algorithms", "score": 5.0 },
    { "category": "systems", "score": 8.3 },
    { "category": "debugging", "score": 5.0 },
    { "category": "architecture", "score": 0.0 },
    { "category": "meta", "score": 10.0 }
  ]
}
```

## Stats Update (Atomic)

On each submission:
```sql
UPDATE stats SET
    total_assessed = total_assessed + 1,
    total_score = total_score + :score,
    decay_count = decay_count + CASE WHEN :score > 2.5 THEN 1 ELSE 0 END
WHERE id = 1;
```

## Component Structure

```
app/
  page.tsx              — main page, state machine (hero/quiz/results)
  layout.tsx            — fonts, metadata, global styles
  globals.css           — CSS variables, animations, dot pattern
  api/
    stats/route.ts      — GET aggregate stats
    submit/route.ts     — POST quiz results
    og/route.tsx        — dynamic OG image generation (next/og ImageResponse)
lib/
  db.ts                 — Turso client setup
  questions.ts          — question data, categories, roasts, scoring constants
components/
  Hero.tsx              — landing view
  Quiz.tsx              — quiz view
  Results.tsx           — results view
  SkillBreakdown.tsx    — category bar chart
```

## Credits

Footer on results page:
> This diagnostic is inspired by **Bainbridge's Ironies of Automation** — the more you automate, the worse you get at the exact moments automation fails.
>
> Original concept: [SRE Skill Decay Index by SigNoz](https://signoz.io/sre-skill-decay-index/)
