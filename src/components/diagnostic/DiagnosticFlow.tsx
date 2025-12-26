import { useState, useCallback } from "react";
import { questions } from "@/data/questions";
import { calculateResult, ScoreResult } from "@/lib/scoring";
import { WelcomeScreen } from "./WelcomeScreen";
import { QuestionCard } from "./QuestionCard";
import { NavigationButtons } from "./NavigationButtons";
import { ProgressBar } from "./ProgressBar";
import { ResultsPage } from "./ResultsPage";

type FlowState = "welcome" | "questions" | "results";

export function DiagnosticFlow() {
  const [flowState, setFlowState] = useState<FlowState>("welcome");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<ScoreResult | null>(null);

  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;

  const handleStart = useCallback(() => {
    setFlowState("questions");
    setCurrentQuestionIndex(0);
    setAnswers({});
  }, []);

  const handleSelectOption = useCallback((points: number) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: points,
    }));
  }, [currentQuestion]);

  const handleNext = useCallback(() => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      // Calculate and show results
      const calculatedResult = calculateResult(answers);
      setResult(calculatedResult);
      setFlowState("results");
    }
  }, [currentQuestionIndex, totalQuestions, answers]);

  const handleBack = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  }, [currentQuestionIndex]);

  const handleRestart = useCallback(() => {
    setFlowState("welcome");
    setCurrentQuestionIndex(0);
    setAnswers({});
    setResult(null);
  }, []);

  const selectedOption = currentQuestion ? answers[currentQuestion.id] : null;
  const canGoNext = selectedOption !== undefined && selectedOption !== null;
  const canGoBack = currentQuestionIndex > 0;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">3F</span>
            </div>
            <span className="font-semibold text-foreground">Método 3F</span>
          </div>
          {flowState === "questions" && (
            <span className="text-sm text-muted-foreground">
              Diagnóstico Estratégico
            </span>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <div className="max-w-3xl mx-auto w-full px-4 py-8 md:py-12 flex-1">
          {flowState === "welcome" && (
            <WelcomeScreen onStart={handleStart} />
          )}

          {flowState === "questions" && currentQuestion && (
            <div className="flex flex-col h-full">
              <ProgressBar
                current={currentQuestionIndex + 1}
                total={totalQuestions}
              />

              <div className="flex-1 py-8">
                <QuestionCard
                  key={currentQuestion.id}
                  question={currentQuestion}
                  selectedOption={selectedOption ?? null}
                  onSelect={handleSelectOption}
                />
              </div>

              <NavigationButtons
                onBack={handleBack}
                onNext={handleNext}
                canGoBack={canGoBack}
                canGoNext={canGoNext}
                isLastQuestion={isLastQuestion}
              />
            </div>
          )}

          {flowState === "results" && result && (
            <ResultsPage result={result} onRestart={handleRestart} />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-4">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <p className="text-xs text-muted-foreground">
            Diagnóstico Estratégico Dinâmico — Método 3F • Confidencial
          </p>
        </div>
      </footer>
    </div>
  );
}
