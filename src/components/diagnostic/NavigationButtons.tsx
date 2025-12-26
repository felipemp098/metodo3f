import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface NavigationButtonsProps {
  onBack: () => void;
  onNext: () => void;
  canGoBack: boolean;
  canGoNext: boolean;
  isLastQuestion: boolean;
}

export function NavigationButtons({
  onBack,
  onNext,
  canGoBack,
  canGoNext,
  isLastQuestion,
}: NavigationButtonsProps) {
  return (
    <div className="flex justify-between items-center pt-8">
      <Button
        variant="ghost"
        onClick={onBack}
        disabled={!canGoBack}
        className="text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Voltar
      </Button>

      <Button
        onClick={onNext}
        disabled={!canGoNext}
        className="bg-primary hover:bg-primary/90 text-primary-foreground"
      >
        {isLastQuestion ? "Ver Resultado" : "Próximo"}
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  );
}
