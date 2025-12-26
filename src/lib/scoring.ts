import { Pillar, questions } from "@/data/questions";

export interface Scores {
  posicionamento: number;
  produto: number;
  vendas: number;
}

export interface ScoreResult {
  scores: Scores;
  maxScores: Scores;
  percentages: Scores;
  bottleneck: Pillar;
  levels: Record<Pillar, string>;
}

// Calculate max possible score per pillar
export function getMaxScores(): Scores {
  const maxScores: Scores = { posicionamento: 0, produto: 0, vendas: 0 };
  
  questions.forEach((q) => {
    const maxPoints = Math.max(...q.options.map((o) => o.points));
    maxScores[q.pillar] += maxPoints;
  });
  
  return maxScores;
}

// Get status level based on percentage
export function getLevel(percentage: number): string {
  if (percentage < 35) return "Inicial";
  if (percentage < 55) return "Em Desenvolvimento";
  if (percentage < 75) return "Estruturado";
  return "Avançado";
}

// Get detailed status per pillar
export function getPillarStatus(pillar: Pillar, percentage: number): string {
  const statuses: Record<Pillar, Record<string, string>> = {
    posicionamento: {
      Inicial: "Posicionamento Difuso",
      "Em Desenvolvimento": "Posicionamento Técnico",
      Estruturado: "Posicionamento Estratégico",
      Avançado: "Posicionamento de Autoridade",
    },
    produto: {
      Inicial: "Produto Implícito",
      "Em Desenvolvimento": "Produto Estruturável",
      Estruturado: "Produto Validado",
      Avançado: "Produto Escalável Premium",
    },
    vendas: {
      Inicial: "Vendas Reativas",
      "Em Desenvolvimento": "Vendas Inconsistentes",
      Estruturado: "Vendas Estruturadas",
      Avançado: "Vendas Escaláveis",
    },
  };

  const level = getLevel(percentage);
  return statuses[pillar][level];
}

// Identify bottleneck with tiebreaker: vendas > produto > posicionamento
export function identifyBottleneck(percentages: Scores): Pillar {
  const ordered: Pillar[] = ["vendas", "produto", "posicionamento"];
  
  let minPercentage = 100;
  let bottleneck: Pillar = "vendas";
  
  // Find minimum percentage
  for (const pillar of ordered) {
    if (percentages[pillar] < minPercentage) {
      minPercentage = percentages[pillar];
      bottleneck = pillar;
    }
  }
  
  // Handle tiebreaker
  for (const pillar of ordered) {
    if (percentages[pillar] === minPercentage) {
      bottleneck = pillar;
      break;
    }
  }
  
  return bottleneck;
}

// Calculate full result from answers
export function calculateResult(answers: Record<string, number>): ScoreResult {
  const scores: Scores = { posicionamento: 0, produto: 0, vendas: 0 };
  
  // Sum scores per pillar
  Object.entries(answers).forEach(([questionId, points]) => {
    const question = questions.find((q) => q.id === questionId);
    if (question) {
      scores[question.pillar] += points;
    }
  });
  
  const maxScores = getMaxScores();
  
  // Calculate percentages
  const percentages: Scores = {
    posicionamento: Math.round((scores.posicionamento / maxScores.posicionamento) * 100),
    produto: Math.round((scores.produto / maxScores.produto) * 100),
    vendas: Math.round((scores.vendas / maxScores.vendas) * 100),
  };
  
  // Get levels for each pillar
  const levels: Record<Pillar, string> = {
    posicionamento: getPillarStatus("posicionamento", percentages.posicionamento),
    produto: getPillarStatus("produto", percentages.produto),
    vendas: getPillarStatus("vendas", percentages.vendas),
  };
  
  const bottleneck = identifyBottleneck(percentages);
  
  return {
    scores,
    maxScores,
    percentages,
    bottleneck,
    levels,
  };
}

// Get recommendation based on bottleneck
export function getBottleneckRecommendation(bottleneck: Pillar): string {
  const recommendations: Record<Pillar, string> = {
    posicionamento: "Sem clareza de posicionamento, você compete por preço e depende de indicações. O mercado não sabe por que deveria escolher você. Antes de escalar vendas ou sofisticar seu produto, é preciso definir para quem você é a melhor opção e por quê.",
    produto: "Seu posicionamento pode estar claro, mas sua oferta não está estruturada para gerar percepção de valor alto. Sem um produto com metodologia, entregáveis claros e resultados documentados, você limita seu ticket e sua capacidade de escala.",
    vendas: "Você tem posicionamento e produto, mas não tem previsibilidade comercial. Cada mês é uma nova batalha. Sem processo de vendas estruturado, você depende de sorte, timing e esforço manual constante.",
  };
  
  return recommendations[bottleneck];
}
