'use client';

import { useEffect, useRef, useState } from 'react';

interface Stats {
  totalAssessed: number;
  decayPercentage: number;
  avgSeverity: number;
}

function useCountUp(target: number, duration: number = 1200) {
  const [value, setValue] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (target <= 0 || started.current) return;
    started.current = true;

    const step = Math.ceil(target / 30);
    let current = 0;

    const id = setInterval(() => {
      current += step;
      if (current >= target) {
        current = target;
        clearInterval(id);
      }
      setValue(current);
    }, 40);

    return () => clearInterval(id);
  }, [target, duration]);

  return value;
}

export default function Hero({ onStart }: { onStart: () => void }) {
  const [stats, setStats] = useState<Stats>({
    totalAssessed: 0,
    decayPercentage: 0,
    avgSeverity: 0,
  });

  useEffect(() => {
    fetch('/api/stats')
      .then((res) => res.json())
      .then((data: Stats) => setStats(data))
      .catch(() => {});
  }, []);

  const assessed = useCountUp(stats.totalAssessed);
  const decay = useCountUp(stats.decayPercentage);
  const severity = useCountUp(stats.avgSeverity * 10);

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 py-20 overflow-hidden">
      <div className="bg-dot-pattern masked-dots pointer-events-none absolute inset-0" />

      {/* Pill badge */}
      <div
        className="relative z-10 inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-4 py-1.5 mb-8"
        style={{ animation: 'fadeDown 0.8s ease' }}
      >
        <span
          className="h-2 w-2 rounded-full bg-[var(--terminal-green)]"
          style={{ animation: 'pulse 2s ease-in-out infinite' }}
        />
        <span className="font-[family-name:var(--font-jetbrains)] text-xs uppercase tracking-wider text-[var(--text-dim)]">
          From the engineers who still whiteboard
        </span>
      </div>

      {/* Headline */}
      <h1
        className="relative z-10 text-center font-[family-name:var(--font-syne)] font-extrabold leading-[1.1] mb-6"
        style={{
          fontSize: 'clamp(42px, 8vw, 80px)',
          animation: 'fadeUp 0.8s ease 0.1s both',
        }}
      >
        <span className="block text-sm font-[family-name:var(--font-jetbrains)] uppercase tracking-[0.25em] text-[var(--text-dim)] mb-4 font-normal">
          How much has AI
        </span>
        <span className="relative inline-block">
          <span className="text-[var(--accent)]">Deskilled</span>
          <span
            className="absolute bottom-0 left-0 w-full h-[6px] bg-[var(--accent)] rounded-full"
            style={{ opacity: 0.3 }}
          />
        </span>{' '}
        You?
      </h1>

      {/* Subheadline */}
      <p
        className="relative z-10 text-center font-[family-name:var(--font-outfit)] text-lg text-[var(--text-dim)] max-w-xl mb-10 leading-relaxed"
        style={{ animation: 'fadeUp 0.8s ease 0.25s both' }}
      >
        7 real-world CS scenarios. Zero AI assistance.
        <br />
        Find out how much{' '}
        <span className="font-bold text-[var(--text)]">
          muscle memory you&apos;ve lost
        </span>{' '}
        since you started letting copilots think for you.
      </p>

      {/* CTA button */}
      <button
        onClick={onStart}
        className="group relative z-10 overflow-hidden rounded-lg bg-[var(--accent)] px-8 py-3.5 font-[family-name:var(--font-jetbrains)] text-sm font-semibold uppercase tracking-wider text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_30px_rgba(255,61,61,0.4)] cursor-pointer mb-14"
        style={{ animation: 'fadeUp 0.8s ease 0.4s both' }}
      >
        <span className="relative z-10">Run Diagnostic →</span>
        {/* Shimmer overlay */}
        <span className="absolute inset-0 z-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
      </button>

      {/* Stat counters */}
      <div
        className="relative z-10 flex items-center gap-10"
        style={{ animation: 'fadeUp 0.8s ease 0.5s both' }}
      >
        <div className="flex flex-col items-center">
          <span className="font-[family-name:var(--font-jetbrains)] text-2xl font-bold text-[var(--accent)]">
            {assessed.toLocaleString()}
          </span>
          <span className="font-[family-name:var(--font-jetbrains)] text-xs uppercase tracking-wider text-[var(--text-dim)] mt-1">
            Assessed
          </span>
        </div>
        <div className="h-8 w-px bg-[var(--border)]" />
        <div className="flex flex-col items-center">
          <span className="font-[family-name:var(--font-jetbrains)] text-2xl font-bold text-[var(--accent)]">
            {decay}%
          </span>
          <span className="font-[family-name:var(--font-jetbrains)] text-xs uppercase tracking-wider text-[var(--text-dim)] mt-1">
            Show decay
          </span>
        </div>
        <div className="h-8 w-px bg-[var(--border)]" />
        <div className="flex flex-col items-center">
          <span className="font-[family-name:var(--font-jetbrains)] text-2xl font-bold text-[var(--accent)]">
            {(severity / 10).toFixed(1)}
          </span>
          <span className="font-[family-name:var(--font-jetbrains)] text-xs uppercase tracking-wider text-[var(--text-dim)] mt-1">
            Avg severity
          </span>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <span className="font-[family-name:var(--font-jetbrains)] text-[10px] uppercase tracking-widest text-[var(--text-dim)]">
          Scroll
        </span>
        <span
          className="block w-px h-6 bg-[var(--text-dim)] opacity-50"
          style={{ animation: 'scrollBounce 2s ease-in-out infinite' }}
        />
      </div>
    </section>
  );
}
