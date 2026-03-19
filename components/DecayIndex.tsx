"use client";

import { useState, useCallback } from "react";
import { questions } from "@/lib/questions";
import { computeResults, QuizResults, CategoryId } from "@/lib/scoring";
import Hero from "./Hero";
import Quiz from "./Quiz";
import Results from "./Results";

type View = "hero" | "quiz" | "results";

export default function DecayIndex() {
  const [view, setView] = useState<View>("hero");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ score: number; category: CategoryId }[]>([]);
  const [results, setResults] = useState<QuizResults | null>(null);

  const handleStart = useCallback(() => {
    setView("quiz");
    setCurrentQuestion(0);
    setAnswers([]);
    setResults(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleAnswer = useCallback(
    (score: number, category: CategoryId) => {
      const newAnswers = [...answers, { score, category }];
      setAnswers(newAnswers);

      if (currentQuestion + 1 < questions.length) {
        setCurrentQuestion((q) => q + 1);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        const computed = computeResults(newAnswers);
        setResults(computed);

        // Submit to API (fire and forget)
        fetch("/api/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            score: computed.score,
            level: computed.level,
            breakdown: computed.breakdown.map((b) => ({
              category: b.category,
              score: b.score,
            })),
          }),
        }).catch(() => {});

        setTimeout(() => {
          setView("results");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }, 400);
      }
    },
    [answers, currentQuestion]
  );

  const handleRestart = useCallback(() => {
    setView("hero");
    setCurrentQuestion(0);
    setAnswers([]);
    setResults(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="decay-page">
      <div className="relative z-[60]">
        {view === "hero" && <Hero onStart={handleStart} />}
        {view === "quiz" && (
          <Quiz
            currentQuestion={currentQuestion}
            totalQuestions={questions.length}
            question={questions[currentQuestion]}
            onAnswer={handleAnswer}
          />
        )}
        {view === "results" && results && (
          <Results results={results} onRestart={handleRestart} />
        )}
      </div>
    </div>
  );
}
