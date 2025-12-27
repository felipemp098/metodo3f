import { useState, useEffect } from "react";
import { ScoreResult, getBottleneckRecommendation } from "@/lib/scoring";
import { pillarLabels } from "@/lib/types";
import { PillarCard } from "./PillarCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, AlertCircle, Compass, RotateCcw, Copy, Check } from "lucide-react";

interface ResultsPageProps {
  result: ScoreResult;
  onRestart: () => void;
  shareToken?: string | null;
  logoUrl?: string | null;
}

export function ResultsPage({ result, onRestart, shareToken, logoUrl }: ResultsPageProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const { percentages, levels, bottleneck } = result;
  const recommendation = getBottleneckRecommendation(bottleneck);
  
  const shareUrl = shareToken ? `${window.location.origin}/share/${shareToken}` : null;

  const handleCopyLink = async () => {
    if (!shareUrl) return;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: "Link copiado!",
        description: "O link foi copiado para a área de transferência.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível copiar o link.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Logo no canto superior esquerdo */}
      {logoUrl && (
        <div className="mb-6">
          <img 
            src={logoUrl} 
            alt="Logo" 
            className="h-12 w-auto object-contain" 
          />
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-2xl md:text-3xl font-bold mb-3">
          Diagnóstico Estratégico
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Análise completa do seu momento atual nos três pilares fundamentais do IGM
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
      <div className="card-executive mb-8 border-l-4 border-l-secondary">
        <div className="flex items-start gap-4">
          <div className="p-2 rounded-lg bg-secondary/10">
            <AlertCircle className="w-5 h-5 text-secondary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-2">
              Seu Principal Gargalo Estratégico
            </h2>
            <p className="text-muted-foreground mb-4">
              O fator que hoje mais limita sua evolução rumo aos R$100.000/mês é o pilar{" "}
              <span className="font-semibold">
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
          <div className="p-2 rounded-lg bg-secondary/10">
            <Compass className="w-5 h-5 text-secondary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-2">
              Caminho Lógico — IGM
            </h2>
            <p className="text-sm text-muted-foreground">
              O IGM estabelece que Posicionamento, Produto e Vendas devem evoluir de forma integrada. Atacar apenas um pilar sem ajustar os demais gera desequilíbrio e limita seu crescimento.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="p-4 rounded-lg bg-secondary/50">
            <p className="text-xs text-muted-foreground mb-1">Posicionamento</p>
            <p className="text-sm font-medium">{levels.posicionamento}</p>
          </div>
          <div className="p-4 rounded-lg bg-secondary/50">
            <p className="text-xs text-muted-foreground mb-1">Produto</p>
            <p className="text-sm font-medium">{levels.produto}</p>
          </div>
          <div className="p-4 rounded-lg bg-secondary/50">
            <p className="text-xs text-muted-foreground mb-1">Vendas</p>
            <p className="text-sm font-medium">{levels.vendas}</p>
          </div>
        </div>
      </div>

      {/* Share Section */}
      {shareUrl && (
        <div className="card-executive mb-8">
          <div className="flex items-start gap-4 mb-4">
            <div className="p-2 rounded-lg bg-secondary/10">
              <Copy className="w-5 h-5 text-secondary" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold mb-2">
                Compartilhar Resultados
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Compartilhe este link para que outras pessoas possam ver seus resultados do diagnóstico.
              </p>
              <div className="flex gap-2">
                <Input
                  value={shareUrl}
                  readOnly
                  className="flex-1 bg-background"
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                />
                <Button onClick={handleCopyLink} variant="outline">
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copiar
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CTA Section */}
      <div className="text-center py-8 border-t border-border">
        <h3 className="text-lg font-semibold mb-3">
          Pronto para estruturar seu IGM?
        </h3>
        <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
          Reunião estratégica de 40 minutos • Sujeita à análise de perfil
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            size="lg"
            className="bg-secondary hover:bg-secondary/90 text-secondary-foreground px-8"
          >
            Quero estruturar meu IGM
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
