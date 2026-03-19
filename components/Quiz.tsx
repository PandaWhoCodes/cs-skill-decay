"use client";

import { Question, optionLabels } from "@/lib/questions";
import { CategoryId } from "@/lib/scoring";

interface QuizProps {
  currentQuestion: number;
  totalQuestions: number;
  question: Question;
  onAnswer: (score: number, category: CategoryId) => void;
}

export default function Quiz({
  currentQuestion,
  totalQuestions,
  question,
  onAnswer,
}: QuizProps) {
  const progressPercent = (currentQuestion / totalQuestions) * 100;

  return (
    <>
      {/* Fixed top bar */}
      <div className="fixed top-0 left-0 right-0 z-100">
        <div className="flex items-center justify-between px-6 py-3">
          <span className="font-[family-name:var(--font-jetbrains)] text-xs text-[var(--text-dim)]">
            CS Skill Decay Index
          </span>
          <span className="font-[family-name:var(--font-jetbrains)] text-xs text-[var(--text-dim)]">
            {currentQuestion} / {totalQuestions}
          </span>
        </div>
        <div className="h-[2px] w-full bg-[var(--border)]">
          <div
            className="h-full bg-[var(--accent)]"
            style={{
              width: `${progressPercent}%`,
              transition: "width 0.5s cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          />
        </div>
      </div>

      {/* Question area */}
      <div className="mx-auto max-w-[720px] px-6 pt-20 pb-[120px]">
        <div
          key={currentQuestion}
          style={{ animation: "cardIn 0.5s ease" }}
        >
          {/* Question label */}
          <p className="font-[family-name:var(--font-jetbrains)] text-xs uppercase tracking-widest text-[var(--text-dim)] mb-4">
            Question {currentQuestion}
          </p>

          {/* Terminal scenario box */}
          <div className="relative rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 mb-6">
            <span
              className="absolute left-5 font-[family-name:var(--font-jetbrains)] text-xs text-[var(--terminal-green)]"
              style={{ animation: "blink 1s step-end infinite" }}
            >
              &gt;
            </span>
            <p className="pl-4 font-[family-name:var(--font-jetbrains)] text-xs leading-[1.7] text-[var(--terminal-green)]">
              {question.scenario}
            </p>
          </div>

          {/* Question text */}
          <h2 className="font-[family-name:var(--font-syne)] text-[22px] font-bold mb-9">
            {question.question}
          </h2>

          {/* Option buttons */}
          <div className="flex flex-col gap-3">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => onAnswer(option.score, question.category)}
                className="group flex flex-row items-start gap-4 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-left transition-all duration-200 hover:translate-x-1 hover:border-[var(--accent)] hover:bg-[var(--surface-2)] cursor-pointer"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded border border-[var(--border)] font-[family-name:var(--font-jetbrains)] text-xs text-[var(--text-dim)] transition-all duration-200 group-hover:border-[var(--accent)] group-hover:bg-[var(--accent)] group-hover:text-white">
                  {optionLabels[index]}
                </span>
                <span className="text-[15px] text-[var(--text)]">
                  {option.text}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
