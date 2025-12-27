import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createQuestion,
  updateQuestion,
  deleteQuestion,
  type CreateQuestionData,
  type UpdateQuestionData,
} from "@/lib/forms";

export function useCreateQuestion(formId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<CreateQuestionData, "form_id">) =>
      createQuestion({ ...data, form_id: formId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["form-with-questions", formId] });
    },
  });
}

export function useUpdateQuestion(formId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ questionId, data }: { questionId: string; data: UpdateQuestionData }) =>
      updateQuestion(questionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["form-with-questions", formId] });
    },
  });
}

export function useDeleteQuestion(formId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (questionId: string) => deleteQuestion(questionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["form-with-questions", formId] });
    },
  });
}

