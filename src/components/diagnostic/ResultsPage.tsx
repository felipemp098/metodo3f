import { ScoreResult, getBottleneckRecommendation } from "@/lib/scoring";
import { pillarLabels } from "@/data/questions";
import { PillarCard } from "./PillarCard";
import { Button } from "@/components/ui/button";
import { ArrowRight, AlertCircle, Compass, RotateCcw } from "lucide-react";

interface ResultsPageProps {
  result: ScoreResult;
  onRestart: () => void;
}

export function ResultsPage({ result, onRestart }: ResultsPageProps) {
  const { percentages, levels, bottleneck } = result;
  const recommendation = getBottleneckRecommendation(bottleneck);

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
          Diagnóstico Estratégico
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Análise completa do seu momento atual nos três pilares fundamentais do Método 3F
        </p>
      </div>

      {/* Pillar Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <PillarCard
          pillar="posicionamento"
          status={levels.posicionamento}
          percentage={percentages.posicionamento}
          isBottleneck={bottleneck === "posicionamento"}
        />
        <PillarCard
          pillar="produto"
          status={levels.produto}
          percentage={percentages.produto}
          isBottleneck={bottleneck === "produto"}
        />
        <PillarCard
          pillar="vendas"
          status={levels.vendas}
          percentage={percentages.vendas}
          isBottleneck={bottleneck === "vendas"}
        />
      </div>

      {/* Bottleneck Section */}
      <div className="card-executive mb-8 border-l-4 border-l-accent">
        <div className="flex items-start gap-4">
          <div className="p-2 rounded-lg bg-accent/10">
            <AlertCircle className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">
              Seu Principal Gargalo Estratégico
            </h2>
            <p className="text-muted-foreground mb-4">
              O fator que hoje mais limita sua evolução rumo aos R$100.000/mês é o pilar{" "}
              <span className="font-semibold text-foreground">
                {pillarLabels[bottleneck]}
              </span>.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {recommendation}
            </p>
          </div>
        </div>
      </div>

      {/* Method 3F Section */}
      <div className="card-executive mb-10">
        <div className="flex items-start gap-4 mb-6">
          <div className="p-2 rounded-lg bg-primary/10">
            <Compass className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">
              Caminho Lógico — Método 3F
            </h2>
            <p className="text-sm text-muted-foreground">
              O Método 3F estabelece que Posicionamento, Produto e Vendas devem evoluir de forma integrada. Atacar apenas um pilar sem ajustar os demais gera desequilíbrio e limita seu crescimento.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="p-4 rounded-lg bg-secondary/50">
            <p className="text-xs text-muted-foreground mb-1">Posicionamento</p>
            <p className="text-sm font-medium text-foreground">{levels.posicionamento}</p>
          </div>
          <div className="p-4 rounded-lg bg-secondary/50">
            <p className="text-xs text-muted-foreground mb-1">Produto</p>
            <p className="text-sm font-medium text-foreground">{levels.produto}</p>
          </div>
          <div className="p-4 rounded-lg bg-secondary/50">
            <p className="text-xs text-muted-foreground mb-1">Vendas</p>
            <p className="text-sm font-medium text-foreground">{levels.vendas}</p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="text-center py-8 border-t border-border">
        <h3 className="text-lg font-semibold text-foreground mb-3">
          Pronto para estruturar seu Método 3F?
        </h3>
        <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
          Reunião estratégica de 40 minutos • Sujeita à análise de perfil
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            size="lg"
            className="bg-accent hover:bg-accent/90 text-accent-foreground px-8"
          >
            Quero estruturar meu Método 3F
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          
          <Button
            variant="ghost"
            onClick={onRestart}
            className="text-muted-foreground"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Refazer Diagnóstico
          </Button>
        </div>
      </div>
    </div>
  );
}
