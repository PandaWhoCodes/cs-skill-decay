# CS Skill Decay Index — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Next.js quiz app that measures CS skill decay from AI dependency, with Turso storage and social sharing via dynamic OG images.

**Architecture:** Single Next.js App Router app. One page with 3 client-side views (hero/quiz/results). 3 API routes (stats, submit, og). Turso for persistence. Dynamic OG images via `next/og` for social sharing.

**Tech Stack:** Next.js 15 (App Router), Tailwind CSS v4, `@libsql/client`, `next/og`, `next/font/google` (JetBrains Mono, Syne, Outfit)

**Git:** Use SSH remote via `git@github.com:pandawhocodes/<repo>.git`

**Spec:** `docs/superpowers/specs/2026-03-19-cs-skill-decay-index-design.md`
**Questions:** `/Users/ashish/Documents/PERSONAL/cs-skill-decay-questions.md`

---

## File Structure

```
cs-skill-decay/
├── app/
│   ├── layout.tsx            — root layout: fonts, metadata, dark theme, dynamic OG tags
│   ├── page.tsx              — main page: reads ?s=&l=&r= query params, renders DecayIndex
│   ├── globals.css           — CSS variables, animations (blink, fadeUp, pulse, dot-pattern, ollyFloat)
│   └── api/
│       ├── stats/route.ts    — GET: read stats from Turso
│       ├── submit/route.ts   — POST: insert submission + update stats in Turso
│       └── og/route.tsx      — GET: generate 1200x630 OG image via ImageResponse
├── components/
│   ├── DecayIndex.tsx        — state machine: hero → quiz → results
│   ├── Hero.tsx              — landing page with animated counters
│   ├── Quiz.tsx              — question display + option selection
│   ├── Results.tsx           — score, roast, breakdown, share buttons
│   └── SkillBreakdown.tsx    — animated category bar chart
├── lib/
│   ├── db.ts                 — Turso client singleton
│   ├── questions.ts          — all question data, options, categories, scores
│   └── scoring.ts            — scoring logic, levels, colors, roasts, labels
├── .env.local                — TURSO_URL, TURSO_AUTH_TOKEN
├── .gitignore
├── package.json
├── tsconfig.json
├── next.config.ts
└── tailwind.config.ts (if needed, otherwise use v4 CSS-only config)
```

---

### Task 1: Project Scaffold & Dependencies

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `.gitignore`, `.env.local`, `app/layout.tsx`, `app/page.tsx`, `app/globals.css`

- [ ] **Step 1: Initialize Next.js project**

```bash
cd /Users/ashish/Documents/PERSONAL/cs-skill-decay
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*" --turbopack --yes
```

- [ ] **Step 2: Install dependencies**

```bash
cd /Users/ashish/Documents/PERSONAL/cs-skill-decay
npm install @libsql/client
```

- [ ] **Step 3: Create `.env.local`**

```env
TURSO_DATABASE_URL=libsql://skilldecay-pandawhocodes.aws-ap-south-1.turso.io
TURSO_AUTH_TOKEN=eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzM4OTkwMzIsImlkIjoiMDE5ZDA0OWUtZmUwMS03YThkLWI5ZWItZTEwNGU1ZTkwNmJkIiwicmlkIjoiOWE5MGZmZWMtODZhYy00ZWExLTg0NjItZmIwYWQ1N2M1ZGE4In0.MBfDQum0fAFqUD7cPzRynBqffZNTHxkdVWPfU5HsvjFYZcazAInXB9eKA_CSFbRf63NXytY1WIiv-nPL-c_YAA
```

- [ ] **Step 4: Verify dev server starts**

```bash
cd /Users/ashish/Documents/PERSONAL/cs-skill-decay
npm run dev
```

Expected: Server starts on http://localhost:3000

- [ ] **Step 5: Init git and commit**

```bash
cd /Users/ashish/Documents/PERSONAL/cs-skill-decay
git init
echo ".env.local" >> .gitignore
git add .
git commit -m "feat: scaffold Next.js project with Tailwind and Turso"
```

---

### Task 2: Data Layer — Questions, Scoring, DB

**Files:**
- Create: `lib/questions.ts`, `lib/scoring.ts`, `lib/db.ts`

- [ ] **Step 1: Create `lib/db.ts` — Turso client**

```typescript
import { createClient } from "@libsql/client";

export const db = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});
```

- [ ] **Step 2: Create `lib/scoring.ts` — scoring logic, levels, roasts, colors**

All constants and pure functions for scoring:

```typescript
export type Level = "low" | "mid" | "high" | "critical";

export type CategoryId = "algorithms" | "systems" | "debugging" | "architecture" | "meta";

export const categoryLabels: Record<CategoryId, string> = {
  algorithms: "Algorithmic Thinking",
  systems: "Systems Intuition",
  debugging: "Debugging Instinct",
  architecture: "Architecture & Design",
  meta: "Self-Awareness",
};

export const levelColors: Record<Level, string> = {
  low: "#00ff9d",
  mid: "#ffb020",
  high: "#ff3d3d",
  critical: "#ff3d3d",
};

export const levelLabels: Record<Level, string> = {
  low: "Minimal Decay — Fundamentals Intact",
  mid: "Moderate Decay — The Rust Is Showing",
  high: "Significant Decay — AI-Dependent",
  critical: "Critical Decay — Full Abstraction Collapse",
};

export const roasts: Record<Level, string[]> = {
  low: [
    "You still think in algorithms, not autocomplete suggestions. Dijkstra would be proud.",
    "Your CS fundamentals are intact. The AI is your tool, not your brain.",
  ],
  mid: [
    "You're in the uncanny valley of deskilling — fast enough to feel competent, rusty enough to panic when Copilot goes down.",
    "You remember that Big O exists, but you'd need a minute to tell O(n log n) from O(n²) without autocomplete.",
  ],
  high: [
    "You've traded deep understanding for autocomplete confidence. When the AI hallucinates a subtle bug, you won't even notice.",
    "Your AI assistant has become your load-bearing wall. Remove it and the whole building comes down.",
  ],
  critical: [
    "You've achieved full abstraction collapse — you depend on a tool that depends on the knowledge you've stopped maintaining.",
    "You don't use AI as a tool. AI uses you as a rubber stamp.",
  ],
};

export const sampleDiagnostics = [
  { role: "Backend Dev, 6 YOE", score: 7.2, roast: "Knows how to npm install but forgot how require works." },
  { role: "Full-stack Eng, 4 YOE", score: 5.8, roast: "Still writes SQL joins by hand. Respect." },
  { role: "Tech Lead, 8 YOE", score: 8.4, roast: "Architects the architecture. Can't implement either." },
  { role: "Junior Dev, 1 YOE", score: 9.1, roast: "Never coded without Copilot. Never-skilled." },
  { role: "Systems Programmer, 5 YOE", score: 3.4, roast: "Still reads man pages at 3 AM. Unbreakable." },
  { role: "Frontend Dev, 3 YOE", score: 6.7, roast: "The Stack Overflow bookmark folder is the only thing between you and chaos." },
];

export function getLevel(score: number): Level {
  if (score <= 2.5) return "low";
  if (score <= 5) return "mid";
  if (score <= 7.5) return "high";
  return "critical";
}

export interface CategoryBreakdown {
  category: CategoryId;
  label: string;
  score: number;
  level: Level;
  percent: number;
}

export interface QuizResults {
  display: string;
  score: number;
  level: Level;
  label: string;
  roast: string;
  roastIndex: number;
  breakdown: CategoryBreakdown[];
}

export function computeResults(answers: { score: number; category: CategoryId }[]): QuizResults {
  const totalScore = answers.reduce((sum, a) => sum + a.score, 0);
  const finalScore = (totalScore / (3 * answers.length)) * 10;
  const level = getLevel(finalScore);

  const byCategory: Record<string, { total: number; count: number }> = {};
  answers.forEach((a) => {
    if (!byCategory[a.category]) byCategory[a.category] = { total: 0, count: 0 };
    byCategory[a.category].total += a.score;
    byCategory[a.category].count += 1;
  });

  const breakdown: CategoryBreakdown[] = Object.entries(byCategory).map(([cat, data]) => {
    const avg = (data.total / (3 * data.count)) * 10;
    return {
      category: cat as CategoryId,
      label: categoryLabels[cat as CategoryId],
      score: avg,
      level: getLevel(avg),
      percent: Math.round(avg * 10),
    };
  });

  const levelRoasts = roasts[level];
  const roastIndex = Math.floor(Math.random() * levelRoasts.length);

  return {
    display: finalScore.toFixed(1),
    score: finalScore,
    level,
    label: levelLabels[level],
    roast: levelRoasts[roastIndex],
    roastIndex,
    breakdown,
  };
}
```

- [ ] **Step 3: Create `lib/questions.ts` — all 7 questions with options**

Contains the full question data array. Each question has: `scenario`, `question`, `category`, and `options[]` with `text` and `score`.

Reference `/Users/ashish/Documents/PERSONAL/cs-skill-decay-questions.md` for exact content. Structure:

```typescript
import { CategoryId } from "./scoring";

export interface QuestionOption {
  text: string;
  score: number;
}

export interface Question {
  scenario: string;
  question: string;
  category: CategoryId;
  options: QuestionOption[];
}

export const questions: Question[] = [
  // Q1: GTA Online — algorithms
  {
    scenario: "BUG REPORT: Your service parses a JSON config file at startup. For years it loaded in 2 seconds. The config has grown from 5,000 entries to 63,000 entries — a 12x increase. But startup now takes 6 minutes — a 180x increase. CPU is pegged on a single core during the entire load. No other changes.",
    question: "A 12x data increase caused a 180x slowdown. What's happening?",
    category: "algorithms",
    options: [
      { text: "There's an accidentally quadratic algorithm — likely parsing each entry with a function that's secretly O(n) itself (like strlen on every read of a growing buffer), or checking for duplicates by scanning the full list on each insert. 12x data with O(n²) behavior gives ~144x slowdown — that matches. Find the nested loop hiding inside a \"simple\" parse.", score: 0 },
      { text: "The JSON file is too large for the parser's memory buffer, so it's doing excessive disk I/O — swapping parts of the file in and out. Switch to a streaming JSON parser to fix it.", score: 2 },
      { text: "The startup is I/O bound — 63,000 entries means more disk reads. Use an SSD or load the config from a faster storage backend like Redis.", score: 3 },
      { text: "The JSON parser has O(n log n) behavior because it's building a sorted index internally. The superlinear growth is expected for this data size — optimize by splitting the config into smaller files.", score: 1 },
    ],
  },
  // Q2: 200ms Mystery — systems
  {
    scenario: "BUG REPORT: Every RPC call between your two services takes exactly 200ms longer than expected. Not approximately — exactly 200ms, every single time. Network ping is 0.5ms. The payload is tiny (< 100 bytes). The server processes the request in < 1ms. Both services are on the same data center rack.",
    question: "Sub-millisecond network, sub-millisecond processing, but an exact 200ms penalty on every call. What's causing it?",
    category: "systems",
    options: [
      { text: "Nagle's algorithm is buffering the small write, waiting for an ACK before sending. Meanwhile, TCP delayed ACK on the other side is holding the ACK for up to 200ms hoping to piggyback it on a response. Neither side yields — it's a deadlock that resolves on a timer. Set TCP_NODELAY on the socket to disable Nagle's algorithm.", score: 0 },
      { text: "There's a 200ms connection pool timeout — when no idle connection is available, the client waits 200ms before creating a new one. The pool is undersized for the request rate. Increase the pool size.", score: 1 },
      { text: "The RPC framework has a built-in retry delay — the first attempt silently fails due to a serialization mismatch, and the 200ms is the retry backoff interval. Check the framework's retry configuration.", score: 2 },
      { text: "It's a DNS resolution delay — each RPC call is resolving the service hostname, and the DNS TTL or lookup is adding 200ms. Cache the DNS resolution or use IP addresses directly.", score: 3 },
    ],
  },
  // Q3: Regex Catastrophe — debugging
  {
    scenario: "INCIDENT: You deploy a new regex-based input validation rule to your web application firewall. Within 60 seconds, every server's CPU spikes to 100% and stays there. The regex looks simple enough: .*(?:.*=.*). Rollback takes 10 minutes because the servers are too overloaded to accept deploy commands.",
    question: "A \"simple\" regex is consuming infinite CPU. What property of this pattern makes it catastrophic?",
    category: "debugging",
    options: [
      { text: "It's catastrophic backtracking — the nested .* quantifiers create exponentially many ways to match the same input. When the regex engine fails to match, it backtracks through all possible combinations of where each .* could have consumed characters. For an n-character string, this is O(2ⁿ) in the worst case. The fix: use atomic groups, possessive quantifiers, or rewrite to avoid nested wildcards entirely.", score: 0 },
      { text: "The regex is matching against every incoming request's full body, and the sheer volume of text being scanned across millions of requests per second is overwhelming the CPU — switch to matching only the URL and headers.", score: 2 },
      { text: "The regex engine is compiled at runtime for each request instead of being pre-compiled. The compilation cost multiplied by millions of requests is the bottleneck — pre-compile the regex at startup.", score: 1 },
      { text: "The WAF is running in synchronous mode, blocking each request until the regex completes. Put the regex evaluation behind an async queue with a timeout so it doesn't block the main request thread.", score: 3 },
    ],
  },
  // Q4: Cache Stampede — architecture
  {
    scenario: "INCIDENT: At exactly 3:00 AM, your database CPU spikes from 15% to 100% and stays pegged. The app returns 504s. Nothing was deployed. There are no cron jobs at 3 AM. Your cache layer (Redis) is healthy, but cache hit rate dropped from 99.2% to 0.1% at exactly 3:00 AM. All cache keys were written at 2:00 AM with a 1-hour TTL.",
    question: "The cache is healthy but empty. The database is drowning. What happened and what's the fix?",
    category: "architecture",
    options: [
      { text: "Cache stampede — all keys expired simultaneously because they share the same TTL. Thousands of concurrent requests all see a cache miss at once and each independently queries the database. The database can't handle the sudden thundering herd. Fix: add random jitter to TTLs (e.g., 55–65 min instead of exactly 60), implement lock-based recomputation (only one request recomputes while others wait), or use stale-while-revalidate to serve expired data while refreshing in the background.", score: 0 },
      { text: "Redis hit a memory limit at 3:00 AM and evicted all keys using its eviction policy. The database spike is from all the cache misses after eviction. Increase Redis memory limits.", score: 1 },
      { text: "The cache warming job that runs at 2:00 AM failed today, so the data was never cached. Add monitoring and alerts on the cache warming pipeline so you catch failures before they cascade.", score: 2 },
      { text: "Scale up the database to handle the load — if the database can't handle direct traffic, that's the real problem. The cache is masking an undersized database.", score: 3 },
    ],
  },
  // Q5: HashDoS — algorithms
  {
    scenario: "INCIDENT: A single HTTP POST request — just 2MB in size — pins your server's CPU at 100% for 30 minutes. The request body contains 100,000 form parameters. Memory usage is normal. No other requests can be processed. This isn't a flood attack — it's a single request from a single IP.",
    question: "One 2MB request takes down your entire server for 30 minutes. How?",
    category: "algorithms",
    options: [
      { text: "Hash collision attack — the attacker crafted 100K parameter names that all hash to the same bucket. Your language's hash table degenerates from O(1) to O(n) per lookup, making insertion of n keys O(n²). With 100K keys, that's 10 billion operations from a single request. Fix: use a randomized hash function (SipHash), limit the number of POST parameters, or set a request processing timeout.", score: 0 },
      { text: "The server is trying to parse 100K parameters into a deeply nested object structure, and the recursive parsing is blowing the call stack, causing repeated stack overflow recoveries that consume CPU. Limit request body depth.", score: 2 },
      { text: "The form parameters are being validated against a database, and 100K individual queries are overwhelming the connection pool. Add batch validation or rate-limit the number of parameters per request.", score: 3 },
      { text: "The server's parameter parsing has O(n log n) sorting overhead — it alphabetizes form parameters for canonical representation. With 100K parameters, the sort is expensive. Disable parameter sorting.", score: 1 },
    ],
  },
  // Q6: Floating Point Money — systems
  {
    scenario: "BUG REPORT: Your fintech app processes 2 million transactions per day. Auditors found that the ledger is off by $0.01 on approximately 3% of transactions. The discrepancy always favors or disfavors the user by exactly one cent — never more. The math in code looks correct: price * quantity * taxRate. All values are stored as doubles. The tests all pass.",
    question: "The code looks right, the tests pass, but real money is disappearing. What's wrong?",
    category: "systems",
    options: [
      { text: "IEEE 754 floating-point can't represent most decimal fractions exactly — 0.1 + 0.2 = 0.30000000000000004 in every language. Multiplying prices by quantities by tax rates compounds tiny representation errors, and rounding to cents pushes them across the $0.01 boundary. Fix: use integer arithmetic in cents (or smallest currency unit), or a decimal type with exact representation. The tests pass because they compare with insufficient precision or use round numbers.", score: 0 },
      { text: "There's a race condition in the transaction pipeline — two concurrent transactions occasionally read the same balance, and the last write wins, causing a one-cent discrepancy. Add database-level locking on balance updates.", score: 2 },
      { text: "The tax rate calculation is using a stale rate — when tax rates update, some in-flight transactions use the old rate, creating a rounding difference. Ensure atomic tax rate updates across all workers.", score: 1 },
      { text: "The database is truncating values on storage — doubles in the application have more precision than the DECIMAL(10,2) column in the database, so values are being rounded during writes. Match the precision between application and database.", score: 3 },
    ],
  },
  // Q7: The Mirror — meta
  {
    scenario: "REFLECTION: You shipped a feature last week using AI assistance. Today, a critical bug is filed against it. You open the file — 400 lines of code you supposedly wrote. You don't recognize any of it. You can't trace the data flow. You're not even sure what half the functions do. Your AI assistant is down for maintenance.",
    question: "Be honest. What happens next?",
    category: "meta",
    options: [
      { text: "You start from the entry point — find where the request comes in, trace the data flow function by function with a debugger or print statements, rebuild the mental model manually. You've read code you didn't write before (open source, coworkers' code, legacy systems). This is the same skill. The AI was a speed boost for writing — reading and reasoning is still yours.", score: 0 },
      { text: "You write a failing test that reproduces the bug first, then use that as a guardrail while you read through the code. You may not understand the whole file, but you only need to understand the path the bug takes. Narrow the scope, trace the failure.", score: 1 },
      { text: "You search git blame and PR comments to understand the intent behind each function, then check if the AI-generated code matches common patterns from the framework docs. Reconstruct the \"why\" from external context rather than reading the code directly.", score: 2 },
      { text: "You wait for the AI to come back online — have it explain the code to you, then have it suggest the fix. Use the downtime to document the bug and gather reproduction steps. The AI wrote it; the AI should debug it.", score: 3 },
    ],
  },
];

export const optionLabels = ["A", "B", "C", "D"];
```

- [ ] **Step 4: Commit data layer**

```bash
cd /Users/ashish/Documents/PERSONAL/cs-skill-decay
git add lib/
git commit -m "feat: add questions, scoring logic, and Turso client"
```

---

### Task 3: Database Setup — Create Tables in Turso

**Files:**
- Modify: none (runs SQL against remote Turso)

- [ ] **Step 1: Create a seed script and run it**

Create a temporary script `scripts/seed.ts` (or run via a one-off node command):

```bash
cd /Users/ashish/Documents/PERSONAL/cs-skill-decay
node -e "
const { createClient } = require('@libsql/client');
const db = createClient({
  url: 'libsql://skilldecay-pandawhocodes.aws-ap-south-1.turso.io',
  authToken: process.env.TURSO_AUTH_TOKEN || '$(grep TURSO_AUTH_TOKEN .env.local | cut -d= -f2)',
});
async function seed() {
  await db.execute('CREATE TABLE IF NOT EXISTS submissions (id INTEGER PRIMARY KEY AUTOINCREMENT, score REAL NOT NULL, level TEXT NOT NULL, breakdown TEXT NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)');
  await db.execute('CREATE TABLE IF NOT EXISTS stats (id INTEGER PRIMARY KEY CHECK (id = 1), total_assessed INTEGER DEFAULT 0, total_score REAL DEFAULT 0, decay_count INTEGER DEFAULT 0)');
  await db.execute('INSERT OR IGNORE INTO stats (id, total_assessed, total_score, decay_count) VALUES (1, 0, 0, 0)');
  console.log('Tables created and seeded.');
}
seed().catch(console.error);
"
```

Note: If `require` doesn't work with ESM, use a `.mjs` file or `tsx`. Adapt as needed based on the project's module system.

- [ ] **Step 2: Verify tables exist**

```bash
cd /Users/ashish/Documents/PERSONAL/cs-skill-decay
node -e "
const { createClient } = require('@libsql/client');
const db = createClient({
  url: 'libsql://skilldecay-pandawhocodes.aws-ap-south-1.turso.io',
  authToken: '$(grep TURSO_AUTH_TOKEN .env.local | cut -d= -f2)',
});
db.execute('SELECT * FROM stats').then(r => console.log(r.rows));
"
```

Expected: `[ { id: 1, total_assessed: 0, total_score: 0, decay_count: 0 } ]`

---

### Task 4: API Routes

**Files:**
- Create: `app/api/stats/route.ts`, `app/api/submit/route.ts`

- [ ] **Step 1: Create `app/api/stats/route.ts`**

```typescript
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const result = await db.execute("SELECT total_assessed, total_score, decay_count FROM stats WHERE id = 1");
  const row = result.rows[0];

  if (!row || Number(row.total_assessed) === 0) {
    return NextResponse.json({
      totalAssessed: 0,
      decayPercentage: 68,
      avgSeverity: 4.2,
    });
  }

  const totalAssessed = Number(row.total_assessed);
  const totalScore = Number(row.total_score);
  const decayCount = Number(row.decay_count);

  return NextResponse.json({
    totalAssessed,
    decayPercentage: Math.round((decayCount / totalAssessed) * 100),
    avgSeverity: Number((totalScore / totalAssessed).toFixed(1)),
  });
}
```

- [ ] **Step 2: Create `app/api/submit/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { score, level, breakdown } = body;

  if (typeof score !== "number" || typeof level !== "string" || !Array.isArray(breakdown)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  await db.batch([
    {
      sql: "INSERT INTO submissions (score, level, breakdown) VALUES (?, ?, ?)",
      args: [score, level, JSON.stringify(breakdown)],
    },
    {
      sql: "UPDATE stats SET total_assessed = total_assessed + 1, total_score = total_score + ?, decay_count = decay_count + CASE WHEN ? > 2.5 THEN 1 ELSE 0 END WHERE id = 1",
      args: [score, score],
    },
  ]);

  return NextResponse.json({ success: true });
}
```

- [ ] **Step 3: Test API routes manually**

```bash
# Test stats
curl http://localhost:3000/api/stats

# Test submit
curl -X POST http://localhost:3000/api/submit \
  -H "Content-Type: application/json" \
  -d '{"score":6.7,"level":"high","breakdown":[{"category":"algorithms","score":5.0}]}'

# Verify stats updated
curl http://localhost:3000/api/stats
```

- [ ] **Step 4: Commit API routes**

```bash
cd /Users/ashish/Documents/PERSONAL/cs-skill-decay
git add app/api/
git commit -m "feat: add stats and submit API routes with Turso"
```

---

### Task 5: Global Styles & Layout

**Files:**
- Modify: `app/globals.css`, `app/layout.tsx`

- [ ] **Step 1: Replace `app/globals.css`**

CSS variables for the dark terminal theme, animations (blink cursor, fadeUp, fadeDown, pulse, scoreReveal, cardIn, ollyFloat, scrollBounce), and the dot-pattern background. Key variables:

```css
:root {
  --bg: #0a0a0a;
  --surface: #141414;
  --surface-2: #1a1a1a;
  --border: #262626;
  --text: #f5f5f5;
  --text-dim: #737373;
  --accent: #ff3d3d;
  --terminal-green: #00ff9d;
}
```

Animations: `fadeUp`, `fadeDown`, `cardIn`, `scoreReveal`, `blink`, `pulse`, `scrollBounce`. Dot-pattern via radial-gradient background.

- [ ] **Step 2: Update `app/layout.tsx`**

Configure fonts (JetBrains Mono, Syne, Outfit via `next/font/google`), set metadata (title, description), apply dark theme. Use `searchParams` to set dynamic `og:image` when `?s=` is present.

Since `layout.tsx` can't access searchParams, the dynamic OG meta will be handled in `page.tsx` via `generateMetadata`.

```typescript
import type { Metadata } from "next";
import { JetBrains_Mono, Outfit, Syne } from "next/font/google";
import "./globals.css";

const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });
const syne = Syne({ subsets: ["latin"], variable: "--font-syne" });

export const metadata: Metadata = {
  title: "CS Skill Decay Index",
  description: "7 real-world CS scenarios. Zero AI assistance. Find out how much muscle memory you've lost since you started letting copilots think for you.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${jetbrains.variable} ${outfit.variable} ${syne.variable} dark`} style={{ colorScheme: "dark" }}>
      <body className="bg-[var(--bg)] text-[var(--text)] antialiased">
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Update `app/page.tsx` with `generateMetadata`**

```typescript
import { Metadata } from "next";
import DecayIndex from "@/components/DecayIndex";

interface Props {
  searchParams: Promise<{ s?: string; l?: string; r?: string }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  if (params.s && params.l) {
    const ogUrl = `/api/og?score=${params.s}&level=${params.l}${params.r ? `&r=${params.r}` : ""}`;
    return {
      openGraph: {
        images: [{ url: ogUrl, width: 1200, height: 630 }],
      },
      twitter: {
        card: "summary_large_image",
        images: [ogUrl],
      },
    };
  }
  return {};
}

export default function Home() {
  return <DecayIndex />;
}
```

- [ ] **Step 4: Commit**

```bash
cd /Users/ashish/Documents/PERSONAL/cs-skill-decay
git add app/globals.css app/layout.tsx app/page.tsx
git commit -m "feat: add dark terminal theme, fonts, and dynamic OG metadata"
```

---

### Task 6: Hero Component

**Files:**
- Create: `components/Hero.tsx`

- [ ] **Step 1: Build Hero component**

Landing page with:
- Pill badge: "From the engineers who still whiteboard"
- Headline with "Deskilled" in red accent
- Subheadline
- "Run Diagnostic →" button (calls `onStart` prop)
- 3 animated counters fetched from `/api/stats` on mount (count-up animation using `useEffect` + `setInterval`)
- Scroll indicator at bottom

Props: `onStart: () => void`

Uses `useEffect` to fetch `/api/stats` and animate counter from 0 to fetched value.

- [ ] **Step 2: Verify it renders**

Visit http://localhost:3000, confirm the hero renders with counters and CTA.

- [ ] **Step 3: Commit**

```bash
cd /Users/ashish/Documents/PERSONAL/cs-skill-decay
git add components/Hero.tsx
git commit -m "feat: add Hero landing component with animated stats counters"
```

---

### Task 7: Quiz Component

**Files:**
- Create: `components/Quiz.tsx`

- [ ] **Step 1: Build Quiz component**

Props:
```typescript
interface QuizProps {
  currentQuestion: number;
  totalQuestions: number;
  question: Question;
  onAnswer: (score: number, category: CategoryId) => void;
}
```

Renders:
- Fixed top bar with progress bar (width = `currentQuestion / totalQuestions * 100%`) and "N / 7" counter
- Terminal-style scenario box (dark bg, green monospace text, blinking `>` cursor)
- Bold question text
- 4 option buttons with A/B/C/D labels
  - Hover: translate-x-1 + red left border
  - onClick: calls `onAnswer(option.score, question.category)`

Key animation: `cardIn` on question change (key by `currentQuestion`).

- [ ] **Step 2: Verify quiz flow**

Click through all 7 questions, ensure progress bar advances and options are clickable.

- [ ] **Step 3: Commit**

```bash
cd /Users/ashish/Documents/PERSONAL/cs-skill-decay
git add components/Quiz.tsx
git commit -m "feat: add Quiz component with terminal-style scenario display"
```

---

### Task 8: SkillBreakdown + Results Components

**Files:**
- Create: `components/SkillBreakdown.tsx`, `components/Results.tsx`

- [ ] **Step 1: Build SkillBreakdown component**

Props: `{ breakdown: CategoryBreakdown[] }`

Renders a list of category bars with:
- Label + score (e.g., "Algorithmic Thinking — 5.0/10")
- Animated horizontal bar (width animates from 0% to `percent%` over 1.5s on mount)
- Bar color by level (green/amber/red)

Uses `useState` + `useEffect` with 300ms delay to trigger the fill animation.

- [ ] **Step 2: Build Results component**

Props:
```typescript
interface ResultsProps {
  results: QuizResults;
  onRestart: () => void;
}
```

Renders:
- Big score number (colored by level, with `scoreReveal` animation)
- Level label (e.g., "Significant Decay — AI-Dependent")
- Roast quote in blockquote
- Share buttons section:
  - "Share on X" — opens `twitter.com/intent/tweet` with pre-filled text + URL with `?s=&l=&r=` params
  - "Share on LinkedIn" — opens `linkedin.com/sharing/share-offsite` with URL
  - "Copy" — copies share text to clipboard
- `<SkillBreakdown />` component
- Bainbridge quote + SigNoz credit link
- Sample diagnostics grid (static data from `sampleDiagnostics`)
- "Run diagnostic again" button (calls `onRestart`)

Share URL format: `${window.location.origin}?s=${results.display}&l=${results.level}&r=${results.roastIndex}`

- [ ] **Step 3: Verify results render**

Complete the quiz and confirm results page shows score, breakdown bars animate, share buttons work.

- [ ] **Step 4: Commit**

```bash
cd /Users/ashish/Documents/PERSONAL/cs-skill-decay
git add components/SkillBreakdown.tsx components/Results.tsx
git commit -m "feat: add Results and SkillBreakdown components with share buttons"
```

---

### Task 9: DecayIndex State Machine

**Files:**
- Create: `components/DecayIndex.tsx`

- [ ] **Step 1: Build DecayIndex component**

Client component (`"use client"`) that manages the full app state:

```typescript
type View = "hero" | "quiz" | "results";

const [view, setView] = useState<View>("hero");
const [currentQuestion, setCurrentQuestion] = useState(0);
const [answers, setAnswers] = useState<{ score: number; category: CategoryId }[]>([]);
const [results, setResults] = useState<QuizResults | null>(null);
```

Callbacks:
- `handleStart` — sets view to "quiz", resets state, scrolls to top
- `handleAnswer(score, category)` — pushes answer, advances question or computes results + POSTs to `/api/submit` + sets view to "results"
- `handleRestart` — resets all state to hero

Renders the appropriate component based on `view`.

- [ ] **Step 2: Test full flow end-to-end**

1. Land on hero → click "Run Diagnostic"
2. Answer all 7 questions
3. See results with score, breakdown, share buttons
4. Click "Run diagnostic again" → back to hero
5. Check Turso has the submission (via `/api/stats`)

- [ ] **Step 3: Commit**

```bash
cd /Users/ashish/Documents/PERSONAL/cs-skill-decay
git add components/DecayIndex.tsx
git commit -m "feat: add DecayIndex state machine wiring hero/quiz/results flow"
```

---

### Task 10: OG Image Route

**Files:**
- Create: `app/api/og/route.tsx`

- [ ] **Step 1: Build OG image route**

Uses `next/og` `ImageResponse` to generate a 1200×630 PNG:

```typescript
import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { levelColors, levelLabels, roasts, getLevel, Level } from "@/lib/scoring";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const score = searchParams.get("score") || "5.0";
  const level = (searchParams.get("level") || getLevel(parseFloat(score))) as Level;
  const roastIndex = parseInt(searchParams.get("r") || "0", 10);
  const roastText = roasts[level]?.[roastIndex] || roasts[level]?.[0] || "";
  const color = levelColors[level];

  return new ImageResponse(
    (
      <div style={{
        width: "100%", height: "100%", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        backgroundColor: "#0a0a0a", color: "#f5f5f5",
        fontFamily: "monospace", padding: "60px",
      }}>
        <div style={{ fontSize: 20, letterSpacing: 4, color: "#737373", textTransform: "uppercase", marginBottom: 30 }}>
          CS Skill Decay Index
        </div>
        <div style={{ fontSize: 120, fontWeight: 800, color, lineHeight: 1 }}>
          {score}
        </div>
        <div style={{ fontSize: 24, color, marginTop: 16, fontWeight: 600, textTransform: "uppercase", letterSpacing: 2 }}>
          {levelLabels[level]}
        </div>
        <div style={{ fontSize: 22, color: "#a3a3a3", marginTop: 30, textAlign: "center", maxWidth: 800, fontStyle: "italic", lineHeight: 1.5 }}>
          "{roastText}"
        </div>
        <div style={{ fontSize: 18, color: "#525252", marginTop: 40 }}>
          How deskilled are YOU? → Take the quiz
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
```

- [ ] **Step 2: Test OG image**

Visit: `http://localhost:3000/api/og?score=6.7&level=high&r=0`

Expected: A 1200×630 PNG image with the score, level, and roast text.

- [ ] **Step 3: Commit**

```bash
cd /Users/ashish/Documents/PERSONAL/cs-skill-decay
git add app/api/og/
git commit -m "feat: add dynamic OG image generation for social sharing"
```

---

### Task 11: Polish & Final Testing

**Files:**
- Modify: various components for animation polish

- [ ] **Step 1: Add all CSS animations to `globals.css`**

Ensure these keyframes exist: `fadeUp`, `fadeDown`, `cardIn`, `scoreReveal`, `blink`, `pulse`, `scrollBounce`. Add the dot-pattern class.

- [ ] **Step 2: Full end-to-end test**

1. `npm run dev` → visit localhost:3000
2. Verify hero loads with stats counters
3. Complete quiz — all 7 questions
4. Results page: score, bars animate, share buttons work
5. Click "Share on X" — verify tweet intent opens with correct URL
6. Open the shared URL — verify OG image meta tags are present
7. Visit `/api/og?score=6.7&level=high&r=0` — verify image renders
8. Click "Run diagnostic again" — verify reset works
9. Check `/api/stats` — verify count incremented

- [ ] **Step 3: Build check**

```bash
cd /Users/ashish/Documents/PERSONAL/cs-skill-decay
npm run build
```

Expected: Build succeeds with no errors.

- [ ] **Step 4: Final commit**

```bash
cd /Users/ashish/Documents/PERSONAL/cs-skill-decay
git add -A
git commit -m "feat: polish animations and complete CS Skill Decay Index"
```

---

### Task 12: GitHub Push

- [ ] **Step 1: Create GitHub repo and push**

```bash
cd /Users/ashish/Documents/PERSONAL/cs-skill-decay
gh repo create cs-skill-decay --public --source=. --push
```

Or if using SSH directly:
```bash
git remote add origin git@github.com:pandawhocodes/cs-skill-decay.git
git push -u origin main
```
