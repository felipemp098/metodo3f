import type { Pillar, Question, PillarEntity } from "./types";

// Legacy scores (fixed pillars)
export interface Scores {
  posicionamento: number;
  produto: number;
  vendas: number;
}

// Dynamic scores (any pillars)
export type DynamicScores = Record<string, number>;

// Score result supporting both legacy and dynamic
export interface ScoreResult {
  scores: Scores | DynamicScores;
  maxScores: Scores | DynamicScores;
  percentages: Scores | DynamicScores;
  bottleneck: string; // Pillar enum value or pillar_id UUID
  levels: Record<string, string>;
  pillar_id?: string; // UUID when using dynamic pillars
}

// Calculate max possible score per pillar (legacy - fixed pillars)
export function getMaxScores(questions: Question[]): Scores {
  const maxScores: Scores = { posicionamento: 0, produto: 0, vendas: 0 };
  
  questions.forEach((q) => {
    if (q.pillar) {
      const maxPoints = Math.max(...q.options.map((o) => o.points));
      maxScores[q.pillar] += maxPoints;
    }
  });
  
  return maxScores;
}

// Calculate max possible score per pillar (dynamic - any pillars)
export function getMaxScoresDynamic(
  questions: Question[],
  pillars: PillarEntity[]
): DynamicScores {
  const maxScores: DynamicScores = {};
  
  // Initialize all pillars with 0
  pillars.forEach((pillar) => {
    maxScores[pillar.id] = 0;
  });
  
  questions.forEach((q) => {
    if (q.pillar_id && maxScores.hasOwnProperty(q.pillar_id)) {
      const maxPoints = Math.max(...q.options.map((o) => o.points));
      maxScores[q.pillar_id] += maxPoints;
    }
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

// Get detailed status per pillar (legacy)
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

// Get status level text for dynamic pillars (uses pillar name)
export function getPillarStatusDynamic(pillarName: string, percentage: number): string {
  const level = getLevel(percentage);
  return `${pillarName} - ${level}`;
}

// Identify bottleneck with tiebreaker: vendas > produto > posicionamento (legacy)
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

// Identify bottleneck with dynamic pillars (uses order_index for tiebreaker)
export function identifyBottleneckDynamic(
  percentages: DynamicScores,
  pillars: PillarEntity[]
): string {
  if (pillars.length === 0) {
    throw new Error("Cannot identify bottleneck: no pillars provided");
  }
  
  // Sort pillars by order_index
  const sortedPillars = [...pillars].sort((a, b) => a.order_index - b.order_index);
  
  let minPercentage = 100;
  let bottleneckPillarId: string | null = null;
  
  // Find minimum percentage
  for (const pillar of sortedPillars) {
    const percentage = percentages[pillar.id] || 0;
    if (percentage < minPercentage) {
      minPercentage = percentage;
      bottleneckPillarId = pillar.id;
    }
  }
  
  // Handle tiebreaker - use first pillar with minimum percentage (lowest order_index)
  for (const pillar of sortedPillars) {
    const percentage = percentages[pillar.id] || 0;
    if (percentage === minPercentage) {
      return pillar.id;
    }
  }
  
  return bottleneckPillarId || sortedPillars[0].id;
}

// Get feedback for bottleneck pillar
export function getBottleneckFeedback(
  pillarId: string,
  pillars: PillarEntity[]
): string | null {
  const pillar = pillars.find((p) => p.id === pillarId);
  return pillar?.feedback || null;
}

// Calculate full result from answers (legacy - fixed pillars)
export function calculateResult(answers: Record<string, number>, questions: Question[]): ScoreResult {
  const scores: Scores = { posicionamento: 0, produto: 0, vendas: 0 };
  
  // Sum scores per pillar
  Object.entries(answers).forEach(([questionId, points]) => {
    const question = questions.find((q) => q.id === questionId);
    if (question && question.pillar) {
      scores[question.pillar] += points;
    }
  });
  
  const maxScores = getMaxScores(questions);
  
  // Calculate percentages (handle division by zero)
  const percentages: Scores = {
    posicionamento: maxScores.posicionamento > 0 
      ? Math.round((scores.posicionamento / maxScores.posicionamento) * 100)
      : 0,
    produto: maxScores.produto > 0
      ? Math.round((scores.produto / maxScores.produto) * 100)
      : 0,
    vendas: maxScores.vendas > 0
      ? Math.round((scores.vendas / maxScores.vendas) * 100)
      : 0,
  };
  
  // Get levels for each pillar
  const levels: Record<string, string> = {
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

// Calculate full result from answers (dynamic - any pillars)
export function calculateResultDynamic(
  answers: Record<string, number>,
  questions: Question[],
  pillars: PillarEntity[]
): ScoreResult {
  const scores: DynamicScores = {};
  
  // Initialize all pillars with 0
  pillars.forEach((pillar) => {
    scores[pillar.id] = 0;
  });
  
  // Sum scores per pillar
  Object.entries(answers).forEach(([questionId, points]) => {
    const question = questions.find((q) => q.id === questionId);
    if (question && question.pillar_id && scores.hasOwnProperty(question.pillar_id)) {
      scores[question.pillar_id] += points;
    }
  });
  
  const maxScores = getMaxScoresDynamic(questions, pillars);
  
  // Calculate percentages (handle division by zero)
  const percentages: DynamicScores = {};
  pillars.forEach((pillar) => {
    const maxScore = maxScores[pillar.id] || 0;
    const score = scores[pillar.id] || 0;
    percentages[pillar.id] = maxScore > 0 
      ? Math.round((score / maxScore) * 100)
      : 0;
  });
  
  // Get levels for each pillar
  const levels: Record<string, string> = {};
  pillars.forEach((pillar) => {
    const percentage = percentages[pillar.id] || 0;
    levels[pillar.id] = getPillarStatusDynamic(pillar.name, percentage);
  });
  
  const bottleneckPillarId = identifyBottleneckDynamic(percentages, pillars);
  
  return {
    scores,
    maxScores,
    percentages,
    bottleneck: bottleneckPillarId,
    levels,
    pillar_id: bottleneckPillarId,
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
