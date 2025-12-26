export type Pillar = "posicionamento" | "produto" | "vendas";

export interface QuestionOption {
  text: string;
  points: number;
}

export interface Question {
  id: string;
  text: string;
  pillar: Pillar;
  options: QuestionOption[];
}

export const questions: Question[] = [
  // POSICIONAMENTO (5 perguntas)
  {
    id: "pos-1",
    text: "Como você descreveria a clareza da sua proposta de valor hoje?",
    pillar: "posicionamento",
    options: [
      { text: "Ainda não tenho uma proposta de valor clara", points: 1 },
      { text: "Tenho uma ideia, mas mudo frequentemente", points: 2 },
      { text: "Tenho uma proposta definida, mas preciso refinar", points: 3 },
      { text: "Minha proposta é clara, diferenciada e reconhecida pelo mercado", points: 4 },
    ],
  },
  {
    id: "pos-2",
    text: "Qual é o nível de reconhecimento da sua autoridade no seu nicho?",
    pillar: "posicionamento",
    options: [
      { text: "Poucas pessoas me conhecem no mercado", points: 1 },
      { text: "Sou conhecido por alguns, mas sem destaque", points: 2 },
      { text: "Tenho reconhecimento moderado e indicações recorrentes", points: 3 },
      { text: "Sou referência e frequentemente procurado por autoridades", points: 4 },
    ],
  },
  {
    id: "pos-3",
    text: "Como está a definição do seu público-alvo ideal?",
    pillar: "posicionamento",
    options: [
      { text: "Atendo qualquer pessoa que apareça", points: 1 },
      { text: "Tenho uma ideia geral, mas aceito clientes variados", points: 2 },
      { text: "Tenho um perfil definido, mas ainda faço exceções", points: 3 },
      { text: "Tenho clareza total e recuso clientes fora do perfil", points: 4 },
    ],
  },
  {
    id: "pos-4",
    text: "Como você se diferencia dos concorrentes?",
    pillar: "posicionamento",
    options: [
      { text: "Não sei exatamente como me diferencio", points: 1 },
      { text: "Me diferencio pelo preço ou disponibilidade", points: 2 },
      { text: "Tenho diferenciais técnicos ou metodológicos", points: 3 },
      { text: "Tenho uma marca pessoal forte e posicionamento único", points: 4 },
    ],
  },
  {
    id: "pos-5",
    text: "Como está sua presença digital e comunicação de marca?",
    pillar: "posicionamento",
    options: [
      { text: "Praticamente inexistente ou desatualizada", points: 1 },
      { text: "Tenho presença básica, mas sem estratégia", points: 2 },
      { text: "Tenho presença consistente com conteúdo regular", points: 3 },
      { text: "Tenho ecossistema integrado e autoridade digital consolidada", points: 4 },
    ],
  },

  // PRODUTO (5 perguntas)
  {
    id: "prod-1",
    text: "Como está a estruturação do seu produto ou serviço principal?",
    pillar: "produto",
    options: [
      { text: "Vendo meu tempo/hora de forma genérica", points: 1 },
      { text: "Tenho serviços, mas sem estrutura clara de entrega", points: 2 },
      { text: "Tenho produto estruturado com metodologia própria", points: 3 },
      { text: "Tenho esteira completa com produtos escaláveis", points: 4 },
    ],
  },
  {
    id: "prod-2",
    text: "Qual é o ticket médio do seu produto/serviço principal?",
    pillar: "produto",
    options: [
      { text: "Abaixo de R$1.000", points: 1 },
      { text: "Entre R$1.000 e R$5.000", points: 2 },
      { text: "Entre R$5.000 e R$15.000", points: 3 },
      { text: "Acima de R$15.000", points: 4 },
    ],
  },
  {
    id: "prod-3",
    text: "Você tem metodologia ou framework proprietário documentado?",
    pillar: "produto",
    options: [
      { text: "Não, trabalho de forma intuitiva", points: 1 },
      { text: "Tenho alguns processos, mas não documentados", points: 2 },
      { text: "Tenho metodologia documentada parcialmente", points: 3 },
      { text: "Tenho framework completo, documentado e replicável", points: 4 },
    ],
  },
  {
    id: "prod-4",
    text: "Como está sua capacidade de entrega sem depender 100% de você?",
    pillar: "produto",
    options: [
      { text: "Tudo depende de mim pessoalmente", points: 1 },
      { text: "Tenho alguma ajuda pontual, mas centralizo tudo", points: 2 },
      { text: "Tenho equipe ou sistemas que executam parte", points: 3 },
      { text: "Tenho estrutura que opera com mínima dependência", points: 4 },
    ],
  },
  {
    id: "prod-5",
    text: "Seus clientes têm resultados documentados e mensuráveis?",
    pillar: "produto",
    options: [
      { text: "Não acompanho resultados de forma sistemática", points: 1 },
      { text: "Tenho feedbacks informais positivos", points: 2 },
      { text: "Tenho cases documentados com métricas", points: 3 },
      { text: "Tenho portfólio robusto com resultados comprovados", points: 4 },
    ],
  },

  // VENDAS (5 perguntas)
  {
    id: "vend-1",
    text: "Como você gera novos clientes atualmente?",
    pillar: "vendas",
    options: [
      { text: "Dependo de indicações espontâneas", points: 1 },
      { text: "Faço prospecção ativa, mas sem processo definido", points: 2 },
      { text: "Tenho funil estruturado com algumas fontes de leads", points: 3 },
      { text: "Tenho múltiplos canais gerando leads qualificados previsíveis", points: 4 },
    ],
  },
  {
    id: "vend-2",
    text: "Qual é sua taxa de conversão em reuniões de vendas?",
    pillar: "vendas",
    options: [
      { text: "Não sei ou abaixo de 20%", points: 1 },
      { text: "Entre 20% e 40%", points: 2 },
      { text: "Entre 40% e 60%", points: 3 },
      { text: "Acima de 60%", points: 4 },
    ],
  },
  {
    id: "vend-3",
    text: "Você tem processo de qualificação antes da reunião comercial?",
    pillar: "vendas",
    options: [
      { text: "Não, aceito reunião com qualquer interessado", points: 1 },
      { text: "Faço perguntas básicas por mensagem", points: 2 },
      { text: "Tenho formulário ou etapa de qualificação", points: 3 },
      { text: "Tenho processo rigoroso que filtra até 70% dos leads", points: 4 },
    ],
  },
  {
    id: "vend-4",
    text: "Como está sua previsibilidade de faturamento mensal?",
    pillar: "vendas",
    options: [
      { text: "Completamente imprevisível, varia muito", points: 1 },
      { text: "Tenho alguma noção, mas oscila bastante", points: 2 },
      { text: "Consigo prever com margem de 30%", points: 3 },
      { text: "Tenho previsibilidade alta com recorrência", points: 4 },
    ],
  },
  {
    id: "vend-5",
    text: "Você tem script ou roteiro de vendas estruturado?",
    pillar: "vendas",
    options: [
      { text: "Não, cada conversa é diferente", points: 1 },
      { text: "Tenho tópicos mentais que sigo", points: 2 },
      { text: "Tenho roteiro documentado que uso como guia", points: 3 },
      { text: "Tenho script validado com métricas de performance", points: 4 },
    ],
  },
];

export const pillarLabels: Record<Pillar, string> = {
  posicionamento: "Posicionamento",
  produto: "Produto",
  vendas: "Vendas",
};

export const pillarDescriptions: Record<Pillar, string> = {
  posicionamento: "Clareza de proposta de valor, autoridade e diferenciação no mercado",
  produto: "Estruturação, metodologia e escalabilidade da sua oferta",
  vendas: "Processo comercial, conversão e previsibilidade de receita",
};
