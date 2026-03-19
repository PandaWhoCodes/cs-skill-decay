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

export const levelBgColors: Record<Level, string> = {
  low: "bg-[#00ff9d]",
  mid: "bg-[#ffb020]",
  high: "bg-[#ff3d3d]",
  critical: "bg-[#ff3d3d]",
};

export const levelTextColors: Record<Level, string> = {
  low: "text-[#00ff9d]",
  mid: "text-[#ffb020]",
  high: "text-[#ff3d3d]",
  critical: "text-[#ff3d3d]",
};

export const roasts: Record<Level, string[]> = {
  low: [
    "You still think in algorithms, not autocomplete suggestions. Dijkstra would be proud.",
    "Your CS fundamentals are intact. The AI is your tool, not your brain.",
  ],
  mid: [
    "You\u2019re in the uncanny valley of deskilling \u2014 fast enough to feel competent, rusty enough to panic when Copilot goes down.",
    "You remember that Big O exists, but you\u2019d need a minute to tell O(n log n) from O(n\u00b2) without autocomplete.",
  ],
  high: [
    "You\u2019ve traded deep understanding for autocomplete confidence. When the AI hallucinates a subtle bug, you won\u2019t even notice.",
    "Your AI assistant has become your load-bearing wall. Remove it and the whole building comes down.",
  ],
  critical: [
    "You\u2019ve achieved full abstraction collapse \u2014 you depend on a tool that depends on the knowledge you\u2019ve stopped maintaining.",
    "You don\u2019t use AI as a tool. AI uses you as a rubber stamp.",
  ],
};

export const sampleDiagnostics = [
  { role: "Backend Dev, 6 YOE", score: 7.2, roast: "Knows how to npm install but forgot how require works." },
  { role: "Full-stack Eng, 4 YOE", score: 5.8, roast: "Still writes SQL joins by hand. Respect." },
  { role: "Tech Lead, 8 YOE", score: 8.4, roast: "Architects the architecture. Can\u2019t implement either." },
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
