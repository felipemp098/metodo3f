import type { Database } from "@/integrations/supabase/types";

// Legacy pillar type (enum)
export type Pillar = Database["public"]["Enums"]["pillar_type"];

// New pillar entity (dynamic pillars)
export interface PillarEntity {
  id: string;
  analysis_engine_id: string;
  name: string;
  description: string | null;
  feedback: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

// Analysis Engine (Motor de Análise)
export interface AnalysisEngine {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  pillars?: PillarEntity[]; // Optional for queries with relationships
}

export interface QuestionOption {
  id?: string;
  text: string;
  points: number;
  order_index?: number;
}

export interface Question {
  id: string;
  text: string;
  pillar?: Pillar; // Legacy enum (for backward compatibility)
  pillar_id?: string; // New UUID reference to PillarEntity
  order_index: number;
  options: QuestionOption[];
}

export interface FormCustomization {
  background_image_url?: string | null;
  primary_color?: string;
  secondary_color?: string;
  text_color?: string;
  logo_url?: string | null;
}

export interface Form {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  analysis_engine_id?: string | null; // Reference to AnalysisEngine
  questions?: Question[];
  customization_settings?: FormCustomization | null;
  analysis_engine?: AnalysisEngine | null; // Full analysis engine with pillars (when loaded)
}

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

