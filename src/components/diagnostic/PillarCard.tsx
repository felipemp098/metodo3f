import type { Pillar } from "@/lib/types";
import { pillarLabels, pillarDescriptions } from "@/lib/types";
import { Target, Package, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface PillarCardProps {
  pillar: Pillar;
  status: string;
  percentage: number;
  isBottleneck?: boolean;
}

const pillarIcons: Record<Pillar, React.ReactNode> = {
  posicionamento: <Target className="w-5 h-5" />,
  produto: <Package className="w-5 h-5" />,
  vendas: <TrendingUp className="w-5 h-5" />,
};

export function PillarCard({ pillar, status, percentage, isBottleneck }: PillarCardProps) {
  const getStatusColor = (pct: number) => {
    if (pct < 35) return "text-destructive";
    if (pct < 55) return "text-warning";
    if (pct < 75) return "text-info";
    return "text-success";
  };

  return (
    <div
      className={cn(
        "pillar-card relative",
        isBottleneck && "ring-2 ring-secondary/50"
      )}
    >
      {isBottleneck && (
        <span className="absolute -top-2 -right-2 px-2 py-0.5 text-xs font-medium rounded bg-secondary text-secondary-foreground">
          Gargalo
        </span>
      )}
      
      <div className="flex items-start justify-between mb-4">
        <div className={cn("p-2 rounded-lg", `bg-${pillar}/10`)}>
          <span className={`text-${pillar}`}>{pillarIcons[pillar]}</span>
        </div>
        <span className={cn("text-2xl font-bold", getStatusColor(percentage))}>
          {percentage}%
        </span>
      </div>

      <h3 className="text-lg font-semibold mb-1">
        {pillarLabels[pillar]}
      </h3>
      
      <p className="text-sm font-medium mb-2">{status}</p>
      
      <p className="text-xs text-muted-foreground">
        {pillarDescriptions[pillar]}
      </p>

      <div className="mt-4 h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-700", {
            "bg-posicionamento": pillar === "posicionamento",
            "bg-produto": pillar === "produto",
            "bg-vendas": pillar === "vendas",
          })}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
