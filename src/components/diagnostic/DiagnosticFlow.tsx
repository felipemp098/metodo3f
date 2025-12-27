import React, { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { getActiveFormWithQuestions, getFormWithQuestions } from "@/lib/forms";
import { calculateResult, ScoreResult } from "@/lib/scoring";
import { useSaveResponse } from "@/hooks/useResponses";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/layout/Header";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { WelcomeScreen } from "./WelcomeScreen";
import { QuestionCard } from "./QuestionCard";
import { NavigationButtons } from "./NavigationButtons";
import { ProgressBar } from "./ProgressBar";
import { ResultsPage } from "./ResultsPage";
import { EmptyFormState } from "./EmptyFormState";
import { Loader2 } from "lucide-react";

type FlowState = "welcome" | "questions" | "results" | "error";

interface DiagnosticFlowProps {
  formId?: string;
  showHeader?: boolean;
}

export function DiagnosticFlow({ formId, showHeader = true }: DiagnosticFlowProps = {}) {
  const [flowState, setFlowState] = useState<FlowState>("welcome");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [shareToken, setShareToken] = useState<string | null>(null);

  const { toast } = useToast();
  const saveResponseMutation = useSaveResponse();
  const { data: form, isLoading, error } = useQuery({
    queryKey: formId ? ["form-with-questions", formId] : ["active-form"],
    queryFn: () => formId 
      ? getFormWithQuestions(formId)
      : getActiveFormWithQuestions(),
  });

  const questions = form?.questions || [];
  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const customization = form?.customization_settings;

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

  const handleNext = useCallback(async () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      // Calculate and show results
      if (questions.length > 0 && form) {
        const calculatedResult = calculateResult(answers, questions);
        setResult(calculatedResult);
        setFlowState("results");

        // Save response to database
        try {
          const saved = await saveResponseMutation.mutateAsync({
            form_id: form.id,
            answers,
            result: calculatedResult,
          });
          setShareToken(saved.shareToken);
        } catch (error) {
          console.error("Failed to save response:", error);
          toast({
            title: "Aviso",
            description: "Não foi possível salvar suas respostas, mas você ainda pode visualizar os resultados.",
            variant: "destructive",
          });
        }
      }
    }
  }, [currentQuestionIndex, totalQuestions, answers, questions, form, saveResponseMutation, toast]);

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
    setShareToken(null);
  }, []);

  const selectedOption = currentQuestion ? answers[currentQuestion.id] : null;
  const canGoNext = selectedOption !== undefined && selectedOption !== null;
  const canGoBack = currentQuestionIndex > 0;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;

  // Helper function to convert hex to HSL format for Tailwind
  const hexToHsl = (hex: string): string | null => {
    if (!hex) return null;
    // Remove # if present
    const cleanHex = hex.replace('#', '');
    
    // Parse RGB
    const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
    const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
    const b = parseInt(cleanHex.substring(4, 6), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r:
          h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
          break;
        case g:
          h = ((b - r) / d + 2) / 6;
          break;
        case b:
          h = ((r - g) / d + 4) / 6;
          break;
      }
    }

    h = Math.round(h * 360);
    s = Math.round(s * 100);
    const lightness = Math.round(l * 100);

    return `${h} ${s}% ${lightness}%`;
  };

  // Helper function to calculate foreground color (white or black based on luminance)
  const getForegroundColor = (hex: string): string => {
    if (!hex) return '0 0% 100%';
    const cleanHex = hex.replace('#', '');
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    
    // Calculate relative luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // Return white for dark colors, black for light colors
    return luminance > 0.5 ? '220 15% 20%' : '0 0% 100%';
  };

  // Build inline style with CSS variables and background
  // Only override customized colors, let other theme variables (card, muted, border, etc.) 
  // respect dark/light mode from the global theme
  const inlineStyle: React.CSSProperties = {};
  
  // Background image or color
  if (customization?.background_image_url) {
    inlineStyle.backgroundImage = `url(${customization.background_image_url})`;
    inlineStyle.backgroundSize = 'cover';
    inlineStyle.backgroundPosition = 'center';
    inlineStyle.backgroundRepeat = 'no-repeat';
  } else if (customization?.primary_color) {
    // Only use custom primary color as background if explicitly set
    inlineStyle.backgroundColor = customization.primary_color;
  }
  // If no background customization, let bg-background class handle it (respects dark/light mode)
  
  // CSS variables for Tailwind - only set if customized
  // This allows other variables (--card, --muted, --border, etc.) to respect dark/light mode
  if (customization?.primary_color) {
    const primaryHsl = hexToHsl(customization.primary_color);
    if (primaryHsl) {
      inlineStyle['--primary' as any] = primaryHsl;
    }
  }
  if (customization?.secondary_color) {
    const secondaryHsl = hexToHsl(customization.secondary_color);
    if (secondaryHsl) {
      inlineStyle['--secondary' as any] = secondaryHsl;
      inlineStyle['--secondary-foreground' as any] = getForegroundColor(customization.secondary_color);
    }
  }
  if (customization?.text_color) {
    inlineStyle['--custom-text-color' as any] = customization.text_color;
  }

  return (
    <>
      {(customization?.text_color || customization?.secondary_color) && (
        <style>
          {`${customization?.text_color ? `
            .custom-text-color,
            .custom-text-color h1,
            .custom-text-color h2,
            .custom-text-color h3,
            .custom-text-color h4,
            .custom-text-color h5,
            .custom-text-color h6,
            .custom-text-color p,
            .custom-text-color span:not(.text-muted-foreground):not(.text-secondary-foreground):not(.text-accent-foreground):not(.text-destructive):not(.text-warning):not(.text-info):not(.text-success) {
              color: var(--custom-text-color) !important;
            }
          ` : ''}
          ${customization?.secondary_color ? `
            .custom-text-color .pillar-card {
              border-color: hsl(var(--secondary)) !important;
              background-color: hsl(var(--secondary) / 0.05) !important;
            }
            .custom-text-color button.bg-card,
            .custom-text-color button[class*="bg-card"]:not([class*="bg-secondary"]) {
              background-color: hsl(var(--secondary) / 0.05) !important;
            }
            .custom-text-color button.bg-card:hover,
            .custom-text-color button[class*="bg-card"]:not([class*="bg-secondary"]):hover {
              background-color: hsl(var(--secondary) / 0.1) !important;
            }
            .custom-text-color button.border-border,
            .custom-text-color button[class*="border-border"]:not([class*="border-secondary"]) {
              border-color: hsl(var(--secondary) / 0.2) !important;
            }
            .custom-text-color button.border-border:hover,
            .custom-text-color button[class*="border-border"]:not([class*="border-secondary"]):hover {
              border-color: hsl(var(--secondary) / 0.4) !important;
            }
            .custom-text-color button.text-muted-foreground:hover,
            .custom-text-color button[class*="text-muted-foreground"]:hover {
              color: hsl(var(--secondary)) !important;
            }
            .custom-text-color button[class*="hover:bg-accent"]:hover {
              background-color: hsl(var(--secondary) / 0.1) !important;
            }
            .custom-text-color button[class*="hover:text-accent"]:hover {
              color: hsl(var(--secondary)) !important;
            }
            .custom-text-color button[class*="hover:text-secondary"]:hover {
              color: hsl(var(--secondary)) !important;
            }
            .custom-text-color button[class*="hover:bg-secondary"]:hover {
              background-color: hsl(var(--secondary) / 0.1) !important;
            }
            .custom-text-color button[class*="hover:border-muted"]:hover {
              border-color: hsl(var(--secondary) / 0.4) !important;
            }
          ` : ''}`}
        </style>
      )}
      <div 
        className={`min-h-screen flex flex-col custom-text-color ${!customization?.background_image_url && !customization?.primary_color ? 'bg-background' : ''}`}
        style={inlineStyle}
      >
        {showHeader && (
          <>
            <Header />
            <Breadcrumbs />
          </>
        )}

        {/* Main Content */}
        <main className="flex-1 flex flex-col custom-text-color">
          <div className="w-[80vw] max-w-7xl mx-auto w-full px-4 py-8 md:py-12 flex-1 custom-text-color">
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-secondary" />
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <p className="text-destructive mb-4">Erro ao carregar formulário.</p>
              <p className="text-sm text-muted-foreground">
                Certifique-se de que existe um formulário ativo no sistema.
              </p>
            </div>
          )}

          {!isLoading && !error && questions.length === 0 && (
            <EmptyFormState />
          )}

          {!isLoading && !error && questions.length > 0 && flowState === "welcome" && (
            <WelcomeScreen onStart={handleStart} logoUrl={customization?.logo_url} />
          )}

          {!isLoading && !error && questions.length > 0 && flowState === "questions" && currentQuestion && (
            <div className="flex flex-col h-full">
              {/* Logo no canto superior esquerdo */}
              {customization?.logo_url && (
                <div className="mb-4">
                  <img 
                    src={customization.logo_url} 
                    alt="Logo" 
                    className="h-12 w-auto object-contain" 
                  />
                </div>
              )}
              
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

          {!isLoading && !error && questions.length > 0 && flowState === "results" && result && (
            <ResultsPage 
              result={result} 
              onRestart={handleRestart} 
              shareToken={shareToken}
              logoUrl={customization?.logo_url}
            />
          )}
        </div>
      </main>
      </div>
    </>
  );
}
