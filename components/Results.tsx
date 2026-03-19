"use client";

import { useState } from "react";
import {
  QuizResults,
  levelBgColors,
  levelTextColors,
  levelLabels,
} from "@/lib/scoring";
import SkillBreakdown from "./SkillBreakdown";

export default function Results({ results, onRestart }: { results: QuizResults; onRestart: () => void }) {
  const [copied, setCopied] = useState(false);

  const shareUrl = typeof window !== "undefined"
    ? `${window.location.origin}?s=${results.display}&l=${results.level}&r=${results.roastIndex}`
    : "";
  const shareText = `I just checked my CS skill decay and scored ${results.display}/10 — ${levelLabels[results.level]}. How deskilled are YOU? → ${shareUrl}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-[720px] mx-auto flex flex-col items-center gap-10 py-12 px-4">
      {/* Score Card */}
      <div className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
        <div className={`h-[3px] w-full ${levelBgColors[results.level]}`} />
        <div className="flex flex-col items-center gap-4 p-8 pt-10">
          <p className="font-[family-name:var(--font-jetbrains)] text-xs uppercase tracking-wider text-[var(--text-dim)]">
            Your Skill Decay Index
          </p>
          <p
            className={`font-[family-name:var(--font-poppins)] text-[56px] leading-none font-extrabold ${levelTextColors[results.level]}`}
            style={{ animation: "scoreReveal 0.6s ease-out both" }}
          >
            {results.display}
          </p>
          <p className={`font-[family-name:var(--font-jetbrains)] text-[13px] uppercase tracking-wider ${levelTextColors[results.level]}`}>
            {results.label}
          </p>
          <p className="text-lg text-center max-w-[520px] mt-2 text-[var(--text)] before:content-[open-quote] after:content-[close-quote]">
            {results.roast}
          </p>
        </div>
      </div>

      {/* Share Buttons */}
      <div className="flex items-center justify-center gap-3 flex-wrap">
        <a
          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-4 py-2 font-[family-name:var(--font-jetbrains)] text-sm text-[var(--text)] hover:bg-[var(--surface)] transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 30 30" fill="currentColor">
            <path d="M26.37,26l-8.795-12.822l0.015,0.012L25.52,4h-2.65l-6.46,7.48L11.28,4H4.33l8.211,11.971L12.54,15.97L3.88,26h2.65 l7.182-8.322L19.42,26H26.37z M10.23,6l12.34,18h-2.1L8.12,6H10.23z" />
          </svg>
          Share on X
        </a>
        <a
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-4 py-2 font-[family-name:var(--font-jetbrains)] text-sm text-[var(--text)] hover:bg-[var(--surface)] transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 448 512" fill="currentColor">
            <path d="M100.3 448H7.4V148.9h92.9zM53.8 108.1C24.1 108.1 0 83.5 0 53.8a53.8 53.8 0 0 1 107.6 0c0 29.7-24.1 54.3-53.8 54.3zM447.9 448h-92.7V302.4c0-34.7-.7-79.2-48.3-79.2-48.3 0-55.7 37.7-55.7 76.7V448h-92.8V148.9h89.1v40.8h1.3c12.4-23.5 42.7-48.3 87.9-48.3 94 0 111.3 61.9 111.3 142.3V448z" />
          </svg>
          Share on LinkedIn
        </a>
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-4 py-2 font-[family-name:var(--font-jetbrains)] text-sm text-[var(--text)] hover:bg-[var(--surface)] transition-colors cursor-pointer"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      {/* Skill Breakdown */}
      <SkillBreakdown breakdown={results.breakdown} />

      {/* Bainbridge Box */}
      <div className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-8">
        <p className="text-[var(--text)] leading-relaxed">
          This diagnostic is inspired by{" "}
          <strong>Bainbridge&apos;s Ironies of Automation</strong> &mdash; the more you automate,
          the worse you get at the exact moments automation fails.
        </p>
        <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <a
            href="https://signoz.io/sre-skill-decay-index/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-[family-name:var(--font-jetbrains)] text-sm text-[var(--terminal-green)] hover:underline"
          >
            Read About the SRE Skill Decay Index &rarr;
          </a>
          <span className="text-[var(--text-dim)] text-sm">Original concept by SigNoz</span>
        </div>
      </div>

      {/* Question Sources */}
      <div className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8">
        <p className="font-[family-name:var(--font-jetbrains)] text-xs uppercase tracking-wider text-[var(--text-dim)] mb-4">
          Scenarios based on real incidents
        </p>
        <ul className="flex flex-col gap-2 text-sm text-[var(--text-dim)]">
          <li>
            Q1: <a href="https://nee.lv/2021/02/28/How-I-cut-GTA-Online-loading-times-by-70/" target="_blank" rel="noopener noreferrer" className="text-[var(--terminal-green)] hover:underline">How I cut GTA Online loading times by 70%</a> — accidentally quadratic parsing
          </li>
          <li>
            Q2: <a href="https://brooker.co.za/blog/2024/05/09/nagle.html" target="_blank" rel="noopener noreferrer" className="text-[var(--terminal-green)] hover:underline">It&apos;s always TCP_NODELAY</a> — Nagle + delayed ACK interaction
          </li>
          <li>
            Q3: <a href="https://blog.cloudflare.com/details-of-the-cloudflare-outage-on-july-2-2019/" target="_blank" rel="noopener noreferrer" className="text-[var(--terminal-green)] hover:underline">Cloudflare outage, July 2 2019</a> — catastrophic regex backtracking
          </li>
          <li>
            Q4: <a href="https://en.wikipedia.org/wiki/Thundering_herd_problem" target="_blank" rel="noopener noreferrer" className="text-[var(--terminal-green)] hover:underline">Thundering herd problem</a> — cache stampede
          </li>
          <li>
            Q5: <a href="https://lwn.net/Articles/474912/" target="_blank" rel="noopener noreferrer" className="text-[var(--terminal-green)] hover:underline">Denial of service via hash collisions</a> — HashDoS attack
          </li>
          <li>
            Q6: <a href="https://dzone.com/articles/never-use-float-and-double-for-monetary-calculatio" target="_blank" rel="noopener noreferrer" className="text-[var(--terminal-green)] hover:underline">Never use float for monetary calculations</a> — IEEE 754 rounding
          </li>
          <li>
            Q7: <a href="https://www.anthropic.com/research/how-ai-is-transforming-work-at-anthropic" target="_blank" rel="noopener noreferrer" className="text-[var(--terminal-green)] hover:underline">How AI is transforming work at Anthropic</a> — AI skill atrophy
          </li>
        </ul>
      </div>

      {/* Restart Button */}
      <button
        onClick={onRestart}
        className="font-[family-name:var(--font-jetbrains)] text-sm text-[var(--text-dim)] underline underline-offset-4 hover:text-[var(--text)] transition-colors cursor-pointer"
      >
        Run diagnostic again
      </button>
    </div>
  );
}
