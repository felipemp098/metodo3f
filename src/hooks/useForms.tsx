import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getForms,
  getFormById,
  getFormWithQuestions,
  createForm,
  updateForm,
  deleteForm,
  type CreateFormData,
} from "@/lib/forms";

export function useForms(includeInactive = false) {
  return useQuery({
    queryKey: ["forms", includeInactive],
    queryFn: () => getForms(includeInactive),
  });
}

export function useForm(formId: string | null) {
  return useQuery({
    queryKey: ["form", formId],
    queryFn: () => (formId ? getFormById(formId) : null),
    enabled: !!formId,
  });
}

export function useFormWithQuestions(formId: string | null) {
  return useQuery({
    queryKey: ["form-with-questions", formId],
    queryFn: () => (formId ? getFormWithQuestions(formId) : null),
    enabled: !!formId,
  });
}

export function useCreateForm() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateFormData) => createForm(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forms"] });
    },
  });
}

export function useUpdateForm() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateFormData> }) =>
      updateForm(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["forms"] });
      queryClient.invalidateQueries({ queryKey: ["form", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["form-with-questions", variables.id] });
    },
  });
}

export function useDeleteForm() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteForm(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forms"] });
    },
  });
}

