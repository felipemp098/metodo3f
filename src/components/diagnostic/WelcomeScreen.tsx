import { Button } from "@/components/ui/button";
import { ArrowRight, Target, Package, TrendingUp, Clock } from "lucide-react";

interface WelcomeScreenProps {
  onStart: () => void;
}

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  return (
    <div className="animate-fade-in">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground text-sm mb-6">
          <Clock className="w-3.5 h-3.5" />
          <span>Tempo estimado: 5 minutos</span>
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4 tracking-tight">
          Diagnóstico Estratégico
        </h1>
        <p className="text-lg text-primary font-medium mb-4">
          Método 3F
        </p>
        <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed">
          Descubra qual é o principal gargalo que limita seu crescimento rumo aos R$100.000/mês em mentorias e consultorias.
        </p>
      </div>

      {/* Pillars Preview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
        <div className="pillar-card text-center">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-posicionamento/10 mb-4">
            <Target className="w-5 h-5 text-posicionamento" />
          </div>
          <h3 className="font-semibold text-foreground mb-2">Posicionamento</h3>
          <p className="text-sm text-muted-foreground">
            Clareza da proposta de valor e reconhecimento de autoridade
          </p>
        </div>

        <div className="pillar-card text-center">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-produto/10 mb-4">
            <Package className="w-5 h-5 text-produto" />
          </div>
          <h3 className="font-semibold text-foreground mb-2">Produto</h3>
          <p className="text-sm text-muted-foreground">
            Estruturação da oferta e capacidade de escala
          </p>
        </div>

        <div className="pillar-card text-center">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-vendas/10 mb-4">
            <TrendingUp className="w-5 h-5 text-vendas" />
          </div>
          <h3 className="font-semibold text-foreground mb-2">Vendas</h3>
          <p className="text-sm text-muted-foreground">
            Processo comercial e previsibilidade de receita
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center">
        <Button
          size="lg"
          onClick={onStart}
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-8"
        >
          Iniciar Diagnóstico
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
        <p className="text-xs text-muted-foreground mt-4">
          Suas respostas são confidenciais e serão usadas apenas para gerar seu diagnóstico.
        </p>
      </div>
    </div>
  );
}
