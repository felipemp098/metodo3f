import { supabase } from "@/integrations/supabase/client";
import type { AnalysisEngine } from "./types";

export interface CreateAnalysisEngineData {
  name: string;
  description?: string;
}

export interface UpdateAnalysisEngineData {
  name?: string;
  description?: string;
}

// Create analysis engine
export async function createAnalysisEngine(
  data: CreateAnalysisEngineData
): Promise<AnalysisEngine> {
  const { data: session } = await supabase.auth.getSession();
  if (!session.session) {
    throw new Error("Usuário não autenticado");
  }

  const { data: engine, error } = await supabase
    .from("analysis_engines")
    .insert({
      name: data.name,
      description: data.description || null,
      user_id: session.session.user.id,
    })
    .select()
    .single();

  if (error) throw error;
  return engine as AnalysisEngine;
}

// Get analysis engines for current user
export async function getAnalysisEngines(): Promise<AnalysisEngine[]> {
  const { data: session } = await supabase.auth.getSession();
  if (!session.session) {
    throw new Error("Usuário não autenticado");
  }

  const { data, error } = await supabase
    .from("analysis_engines")
    .select("*")
    .eq("user_id", session.session.user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []) as AnalysisEngine[];
}

// Get analysis engine by ID
export async function getAnalysisEngineById(
  id: string
): Promise<AnalysisEngine | null> {
  const { data, error } = await supabase
    .from("analysis_engines")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // No rows returned
      return null;
    }
    throw error;
  }
  return data as AnalysisEngine;
}

// Get analysis engine with pillars
export async function getAnalysisEngineWithPillars(
  id: string
): Promise<AnalysisEngine | null> {
  const { data, error } = await supabase
    .from("analysis_engines")
    .select(
      `
      *,
      pillars (
        id,
        name,
        description,
        feedback,
        order_index,
        created_at,
        updated_at
      )
    `
    )
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw error;
  }

  return data as AnalysisEngine;
}

// Update analysis engine
export async function updateAnalysisEngine(
  id: string,
  data: UpdateAnalysisEngineData
): Promise<AnalysisEngine> {
  const updateData: Record<string, unknown> = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description;

  const { data: engine, error } = await supabase
    .from("analysis_engines")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return engine as AnalysisEngine;
}

// Delete analysis engine
export async function deleteAnalysisEngine(id: string): Promise<void> {
  const { error } = await supabase
    .from("analysis_engines")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

