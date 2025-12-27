import { useState } from "react";
import type { Question } from "@/lib/types";
import { pillarLabels } from "@/lib/types";
import { cn } from "@/lib/utils";

interface QuestionCardProps {
  question: Question;
  selectedOption: number | null;
  onSelect: (points: number) => void;
}

export function QuestionCard({ question, selectedOption, onSelect }: QuestionCardProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className="animate-fade-in">
      <div className="mb-2">
        <span className="inline-block px-2.5 py-1 text-xs font-medium rounded-md bg-secondary text-secondary-foreground">
          {pillarLabels[question.pillar]}
        </span>
      </div>
      
      <h2 className="text-xl md:text-2xl font-semibold mb-8 leading-relaxed">
        {question.text}
      </h2>

      <div className="space-y-3">
        {question.options
          .sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
          .map((option, index) => {
          const isSelected = selectedOption === option.points;
          const isHovered = hoveredIndex === index;

          return (
            <button
              key={option.id || index}
              onClick={() => onSelect(option.points)}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className={cn(
                "w-full text-left p-4 rounded-lg border transition-all duration-200",
                "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                isSelected
                  ? "border-secondary bg-secondary/10"
                  : isHovered
                  ? "border-muted-foreground/30 bg-secondary/50"
                  : "border-border bg-card hover:border-muted-foreground/20"
              )}
            >
              <div className="flex items-start gap-4">
                <div
                  className={cn(
                    "flex-shrink-0 w-5 h-5 rounded-full border-2 mt-0.5 transition-all duration-200",
                    "flex items-center justify-center",
                    isSelected
                      ? "border-secondary bg-secondary"
                      : "border-muted-foreground/40"
                  )}
                >
                  {isSelected && (
                    <div className="w-2 h-2 rounded-full bg-secondary-foreground" />
                  )}
                </div>
                <span className="text-sm md:text-base leading-relaxed">
                  {option.text}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
