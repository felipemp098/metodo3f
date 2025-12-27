import { useMutation, useQueryClient } from "@tanstack/react-query";
import { seedDefaultForm } from "@/lib/seed";

export function useSeedForm() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => seedDefaultForm(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forms"] });
      queryClient.invalidateQueries({ queryKey: ["active-form"] });
    },
  });
}

