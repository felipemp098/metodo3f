import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useResponseByShareToken } from "@/hooks/useResponses";
import { ResultsPage } from "@/components/diagnostic/ResultsPage";
import { Loader2 } from "lucide-react";
import type { ScoreResult } from "@/lib/scoring";

export default function Share() {
  const { token } = useParams<{ token: string }>();
  const { data, isLoading, error } = useResponseByShareToken(token || null);

  if (isLoading) {
    return (
      <>
        <Helmet>
          <title>Carregando... | IGM</title>
        </Helmet>
        <div className="min-h-screen flex flex-col bg-background">
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Carregando resultados...</p>
            </div>
          </main>
        </div>
      </>
    );
  }

  if (error || !data || !data.diagnostic) {
    return (
      <>
        <Helmet>
          <title>Resultado não encontrado | IGM</title>
        </Helmet>
        <div className="min-h-screen flex flex-col bg-background">
          <main className="flex-1 flex items-center justify-center">
            <div className="w-[80vw] max-w-7xl mx-auto px-4 py-12 text-center">
              <h1 className="text-2xl font-bold text-foreground mb-4">
                Resultado não encontrado
              </h1>
              <p className="text-muted-foreground mb-6">
                O link compartilhado não existe ou foi removido.
              </p>
            </div>
          </main>
        </div>
      </>
    );
  }

  const { diagnostic } = data;

  // Convert diagnostic data to ScoreResult format
  const result: ScoreResult = {
    scores: diagnostic.scores as ScoreResult["scores"],
    maxScores: diagnostic.max_scores as ScoreResult["maxScores"],
    percentages: diagnostic.percentages as ScoreResult["percentages"],
    bottleneck: diagnostic.bottleneck as ScoreResult["bottleneck"],
    levels: diagnostic.levels as ScoreResult["levels"],
  };

  return (
    <>
      <Helmet>
        <title>Resultados do Diagnóstico | IGM</title>
        <meta
          name="description"
          content="Visualize os resultados do diagnóstico estratégico IGM"
        />
      </Helmet>
      <div className="min-h-screen flex flex-col bg-background">
        <main className="flex-1 flex flex-col">
          <div className="w-[80vw] max-w-7xl mx-auto w-full px-4 py-8 md:py-12 flex-1">
            <ResultsPage
              result={result}
              onRestart={() => {
                window.location.href = "/";
              }}
              shareToken={token || null}
            />
          </div>
        </main>
      </div>
    </>
  );
}

