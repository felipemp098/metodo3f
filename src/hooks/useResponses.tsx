import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  saveFormResponse,
  getResponseByShareToken,
  getUserResponses,
  getFormResponses,
  type SaveResponseData,
} from "@/lib/responses";
import { useAuth } from "./useAuth";

export function useSaveResponse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SaveResponseData) => {
      return await saveFormResponse(data.form_id, data.answers, data.result);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-responses"] });
    },
  });
}

export function useResponseByShareToken(shareToken: string | null) {
  return useQuery({
    queryKey: ["response", shareToken],
    queryFn: () => {
      if (!shareToken) return null;
      return getResponseByShareToken(shareToken);
    },
    enabled: !!shareToken,
  });
}

export function useUserResponses() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["user-responses", user?.id],
    queryFn: () => {
      if (!user?.id) return [];
      return getUserResponses(user.id);
    },
    enabled: !!user?.id,
  });
}

export function useFormResponses(formId: string | null) {
  return useQuery({
    queryKey: ["form-responses", formId],
    queryFn: () => {
      if (!formId) return [];
      return getFormResponses(formId);
    },
    enabled: !!formId,
  });
}

