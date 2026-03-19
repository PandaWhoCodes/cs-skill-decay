"use client";

import { useState, useEffect } from "react";
import { CategoryBreakdown, levelBgColors } from "@/lib/scoring";

export default function SkillBreakdown({ breakdown }: { breakdown: CategoryBreakdown[] }) {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full">
      <p className="font-[family-name:var(--font-jetbrains)] uppercase text-[var(--text-dim)] text-xs tracking-wider mb-6">
        Skill Atrophy Breakdown
      </p>
      <div className="flex flex-col gap-4">
        {breakdown.map((item) => (
          <div key={item.category}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-[family-name:var(--font-jetbrains)] text-[13px] text-[var(--text)]">
                {item.label}
              </span>
              <span className="font-[family-name:var(--font-jetbrains)] text-[13px] text-[var(--text-dim)]">
                {item.score.toFixed(1)}/10
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-[var(--surface-2)]">
              <div
                className={`h-full rounded-full ${levelBgColors[item.level]}`}
                style={{
                  width: animate ? `${item.percent}%` : "0%",
                  transition: "width 1.5s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
