import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getPillarsByEngine,
  getPillarById,
  createPillar,
  updatePillar,
  deletePillar,
  reorderPillars,
  type CreatePillarData,
  type UpdatePillarData,
} from "@/lib/pillars";
import type { PillarEntity } from "@/lib/types";

// Get pillars by analysis engine ID
export function usePillars(engineId: string | null) {
  return useQuery<PillarEntity[]>({
    queryKey: ["pillars", engineId],
    queryFn: () => {
      if (!engineId) return [];
      return getPillarsByEngine(engineId);
    },
    enabled: !!engineId,
  });
}

// Get pillar by ID
export function usePillar(pillarId: string | null) {
  return useQuery<PillarEntity | null>({
    queryKey: ["pillar", pillarId],
    queryFn: () => {
      if (!pillarId) return null;
      return getPillarById(pillarId);
    },
    enabled: !!pillarId,
  });
}

// Create pillar
export function useCreatePillar() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePillarData) => createPillar(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["pillars", variables.analysis_engine_id] });
      queryClient.invalidateQueries({ queryKey: ["analysis-engine-with-pillars"] });
    },
  });
}

// Update pillar
export function useUpdatePillar() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePillarData }) =>
      updatePillar(id, data),
    onSuccess: async (pillar) => {
      queryClient.invalidateQueries({ queryKey: ["pillars", pillar.analysis_engine_id] });
      queryClient.invalidateQueries({ queryKey: ["pillar", pillar.id] });
      queryClient.invalidateQueries({ queryKey: ["analysis-engine-with-pillars"] });
    },
  });
}

// Delete pillar
export function useDeletePillar() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletePillar(id),
    onSuccess: () => {
      // Invalidate all pillar queries - we'll refetch with the correct engineId
      queryClient.invalidateQueries({ queryKey: ["pillars"] });
      queryClient.invalidateQueries({ queryKey: ["analysis-engine-with-pillars"] });
    },
  });
}

// Reorder pillars
export function useReorderPillars() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (pillarIds: string[]) => reorderPillars(pillarIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pillars"] });
      queryClient.invalidateQueries({ queryKey: ["analysis-engine-with-pillars"] });
    },
  });
}

