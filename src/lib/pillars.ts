import { supabase } from "@/integrations/supabase/client";
import type { PillarEntity } from "./types";

export interface CreatePillarData {
  analysis_engine_id: string;
  name: string;
  description?: string;
  feedback: string;
  order_index?: number;
}

export interface UpdatePillarData {
  name?: string;
  description?: string;
  feedback?: string;
  order_index?: number;
}

// Create pillar
export async function createPillar(data: CreatePillarData): Promise<PillarEntity> {
  const { data: pillar, error } = await supabase
    .from("pillars")
    .insert({
      analysis_engine_id: data.analysis_engine_id,
      name: data.name,
      description: data.description || null,
      feedback: data.feedback,
      order_index: data.order_index ?? 0,
    })
    .select()
    .single();

  if (error) throw error;
  return pillar as PillarEntity;
}

// Get pillars by analysis engine ID
export async function getPillarsByEngine(
  analysisEngineId: string
): Promise<PillarEntity[]> {
  const { data, error } = await supabase
    .from("pillars")
    .select("*")
    .eq("analysis_engine_id", analysisEngineId)
    .order("order_index", { ascending: true });

  if (error) throw error;
  return (data || []) as PillarEntity[];
}

// Get pillar by ID
export async function getPillarById(id: string): Promise<PillarEntity | null> {
  const { data, error } = await supabase
    .from("pillars")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw error;
  }
  return data as PillarEntity;
}

// Update pillar
export async function updatePillar(
  id: string,
  data: UpdatePillarData
): Promise<PillarEntity> {
  const updateData: Record<string, unknown> = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.feedback !== undefined) updateData.feedback = data.feedback;
  if (data.order_index !== undefined) updateData.order_index = data.order_index;

  const { data: pillar, error } = await supabase
    .from("pillars")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return pillar as PillarEntity;
}

// Delete pillar
export async function deletePillar(id: string): Promise<void> {
  const { error } = await supabase.from("pillars").delete().eq("id", id);
  if (error) throw error;
}

// Reorder pillars
export async function reorderPillars(
  pillarIds: string[]
): Promise<PillarEntity[]> {
  const updates = pillarIds.map((id, index) => ({
    id,
    order_index: index,
  }));

  // Update each pillar's order_index
  const updatePromises = updates.map(({ id, order_index }) =>
    supabase
      .from("pillars")
      .update({ order_index })
      .eq("id", id)
      .select()
      .single()
  );

  const results = await Promise.all(updatePromises);
  
  // Check for errors
  for (const result of results) {
    if (result.error) throw result.error;
  }

  return results.map((r) => r.data as PillarEntity);
}

