import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAnalysisEngines,
  getAnalysisEngineById,
  getAnalysisEngineWithPillars,
  createAnalysisEngine,
  updateAnalysisEngine,
  deleteAnalysisEngine,
  type CreateAnalysisEngineData,
  type UpdateAnalysisEngineData,
} from "@/lib/analysisEngines";
import type { AnalysisEngine } from "@/lib/types";

// Get all analysis engines for current user
export function useAnalysisEngines() {
  return useQuery<AnalysisEngine[]>({
    queryKey: ["analysis-engines"],
    queryFn: () => getAnalysisEngines(),
  });
}

// Get analysis engine by ID
export function useAnalysisEngine(engineId: string | null) {
  return useQuery<AnalysisEngine | null>({
    queryKey: ["analysis-engine", engineId],
    queryFn: () => {
      if (!engineId) return null;
      return getAnalysisEngineById(engineId);
    },
    enabled: !!engineId,
  });
}

// Get analysis engine with pillars
export function useAnalysisEngineWithPillars(engineId: string | null) {
  return useQuery<AnalysisEngine | null>({
    queryKey: ["analysis-engine-with-pillars", engineId],
    queryFn: () => {
      if (!engineId) return null;
      return getAnalysisEngineWithPillars(engineId);
    },
    enabled: !!engineId,
  });
}

// Create analysis engine
export function useCreateAnalysisEngine() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAnalysisEngineData) => createAnalysisEngine(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["analysis-engines"] });
    },
  });
}

// Update analysis engine
export function useUpdateAnalysisEngine() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAnalysisEngineData }) =>
      updateAnalysisEngine(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["analysis-engines"] });
      queryClient.invalidateQueries({ queryKey: ["analysis-engine", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["analysis-engine-with-pillars", variables.id] });
    },
  });
}

// Delete analysis engine
export function useDeleteAnalysisEngine() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAnalysisEngine(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["analysis-engines"] });
    },
  });
}

