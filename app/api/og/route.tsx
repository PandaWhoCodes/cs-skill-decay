import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

const levelColors: Record<string, string> = {
  low: "#00ff9d",
  mid: "#ffb020",
  high: "#ff3d3d",
  critical: "#ff3d3d",
};

const levelLabels: Record<string, string> = {
  low: "Minimal Decay — Fundamentals Intact",
  mid: "Moderate Decay — The Rust Is Showing",
  high: "Significant Decay — AI-Dependent",
  critical: "Critical Decay — Full Abstraction Collapse",
};

const roasts: Record<string, string[]> = {
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

function getLevel(score: number): string {
  if (score <= 2.5) return "low";
  if (score <= 5) return "mid";
  if (score <= 7.5) return "high";
  return "critical";
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const score = searchParams.get("score") || "5.0";
  const level = searchParams.get("level") || getLevel(parseFloat(score));
  const roastIndex = parseInt(searchParams.get("r") || "0", 10);
  const roastText = roasts[level]?.[roastIndex] || roasts[level]?.[0] || "";
  const color = levelColors[level] || "#ff3d3d";
  const label = levelLabels[level] || "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0a0a0a",
          color: "#f5f5f5",
          fontFamily: "monospace",
          padding: "60px",
        }}
      >
        <div
          style={{
            fontSize: 20,
            letterSpacing: 4,
            color: "#737373",
            textTransform: "uppercase" as const,
            marginBottom: 30,
          }}
        >
          CS Skill Decay Index
        </div>
        <div
          style={{
            fontSize: 120,
            fontWeight: 800,
            color,
            lineHeight: 1,
          }}
        >
          {score}
        </div>
        <div
          style={{
            fontSize: 24,
            color,
            marginTop: 16,
            fontWeight: 600,
            textTransform: "uppercase" as const,
            letterSpacing: 2,
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontSize: 22,
            color: "#a3a3a3",
            marginTop: 30,
            textAlign: "center" as const,
            maxWidth: 800,
            fontStyle: "italic",
            lineHeight: 1.5,
          }}
        >
          &ldquo;{roastText}&rdquo;
        </div>
        <div
          style={{
            fontSize: 18,
            color: "#525252",
            marginTop: 40,
          }}
        >
          How deskilled are YOU? → Take the quiz
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
