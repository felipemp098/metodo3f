import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { pillarLabels } from "@/lib/types";
import { Loader2, Plus, Trash2, GripVertical } from "lucide-react";
import type { Question, Form, PillarEntity } from "@/lib/types";
import { useAnalysisEngineWithPillars } from "@/hooks/useAnalysisEngines";

// Schema that supports both legacy pillar enum and new pillar_id
const questionSchema = z.object({
  text: z.string().min(1, "Texto da pergunta é obrigatório"),
  pillar: z.enum(["posicionamento", "produto", "vendas"]).optional(),
  pillar_id: z.string().uuid().optional(),
  order_index: z.number().min(0),
  options: z
    .array(
      z.object({
        text: z.string().min(1, "Texto da opção é obrigatório"),
        points: z.number().min(0).max(10),
        order_index: z.number().min(0),
      })
    )
    .min(2, "Adicione pelo menos 2 opções"),
}).refine(
  (data) => data.pillar || data.pillar_id,
  {
    message: "Selecione um pilar",
    path: ["pillar"],
  }
);

type QuestionFormValues = z.infer<typeof questionSchema>;

interface QuestionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  question: Question | null;
  formId: string;
  form?: Form | null; // Pass form to access analysis_engine_id
  existingQuestionsCount: number;
  onSave: (data: QuestionFormValues) => Promise<void>;
}

export function QuestionDialog({
  open,
  onOpenChange,
  question,
  formId,
  form,
  existingQuestionsCount,
  onSave,
}: QuestionDialogProps) {
  const [isSaving, setIsSaving] = useState(false);
  
  // Get analysis engine with pillars if form has one
  const analysisEngineId = form?.analysis_engine_id || null;
  const { data: analysisEngine } = useAnalysisEngineWithPillars(analysisEngineId);
  const pillars = analysisEngine?.pillars || [];

  // Determine if we're using dynamic pillars (from analysis engine) or legacy enum
  const useDynamicPillars = !!analysisEngineId && pillars.length > 0;

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<QuestionFormValues>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      text: "",
      pillar: useDynamicPillars ? undefined : "posicionamento",
      pillar_id: useDynamicPillars ? pillars[0]?.id : undefined,
      order_index: existingQuestionsCount,
      options: [
        { text: "", points: 1, order_index: 0 },
        { text: "", points: 2, order_index: 1 },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "options",
  });

  useEffect(() => {
    if (question) {
      reset({
        text: question.text,
        pillar: question.pillar || undefined,
        pillar_id: question.pillar_id || undefined,
        order_index: question.order_index,
        options: question.options
          .sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
          .map((opt, idx) => ({
            text: opt.text,
            points: opt.points,
            order_index: opt.order_index || idx,
          })),
      });
    } else {
      reset({
        text: "",
        pillar: useDynamicPillars ? undefined : "posicionamento",
        pillar_id: useDynamicPillars ? pillars[0]?.id : undefined,
        order_index: existingQuestionsCount,
        options: [
          { text: "", points: 1, order_index: 0 },
          { text: "", points: 2, order_index: 1 },
        ],
      });
    }
  }, [question, reset, existingQuestionsCount, open, useDynamicPillars, pillars]);

  const onSubmit = async (data: QuestionFormValues) => {
    setIsSaving(true);
    try {
      await onSave(data);
    } finally {
      setIsSaving(false);
    }
  };

  const addOption = () => {
    const nextIndex = fields.length;
    append({ text: "", points: nextIndex + 1, order_index: nextIndex });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{question ? "Editar Pergunta" : "Nova Pergunta"}</SheetTitle>
          <SheetDescription>
            {question
              ? "Atualize os detalhes da pergunta e suas opções."
              : "Crie uma nova pergunta com suas opções de resposta."}
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-6">
          <div className="space-y-2">
            <Label htmlFor="text">Texto da Pergunta *</Label>
            <Textarea
              id="text"
              {...register("text")}
              placeholder="Ex: Como você descreveria a clareza da sua proposta de valor hoje?"
              rows={3}
            />
            {errors.text && (
              <p className="text-sm text-destructive">{errors.text.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pillar">Pilar *</Label>
              {useDynamicPillars ? (
                <Select
                  value={watch("pillar_id") || ""}
                  onValueChange={(value) => {
                    setValue("pillar_id", value);
                    setValue("pillar", undefined); // Clear legacy pillar
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um pilar" />
                  </SelectTrigger>
                  <SelectContent>
                    {pillars.map((pillar) => (
                      <SelectItem key={pillar.id} value={pillar.id}>
                        {pillar.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Select
                  value={watch("pillar") || ""}
                  onValueChange={(value) => {
                    setValue("pillar", value as "posicionamento" | "produto" | "vendas");
                    setValue("pillar_id", undefined); // Clear pillar_id
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="posicionamento">
                      {pillarLabels.posicionamento}
                    </SelectItem>
                    <SelectItem value="produto">{pillarLabels.produto}</SelectItem>
                    <SelectItem value="vendas">{pillarLabels.vendas}</SelectItem>
                  </SelectContent>
                </Select>
              )}
              {errors.pillar && (
                <p className="text-sm text-destructive">{errors.pillar.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="order_index">Ordem *</Label>
              <Input
                id="order_index"
                type="number"
                {...register("order_index", { valueAsNumber: true })}
                min={0}
              />
              {errors.order_index && (
                <p className="text-sm text-destructive">{errors.order_index.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Opções de Resposta *</Label>
              <Button type="button" variant="outline" size="sm" onClick={addOption}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Opção
              </Button>
            </div>

            {fields.map((field, index) => (
              <div key={field.id} className="flex items-start gap-3 p-4 border rounded-lg">
                <GripVertical className="w-4 h-4 mt-8 text-muted-foreground" />
                <div className="flex-1 grid grid-cols-[1fr_100px] gap-3">
                  <div className="space-y-2">
                    <Label>Texto da Opção {index + 1}</Label>
                    <Input
                      {...register(`options.${index}.text`)}
                      placeholder="Ex: Ainda não tenho uma proposta de valor clara"
                    />
                    {errors.options?.[index]?.text && (
                      <p className="text-sm text-destructive">
                        {errors.options[index]?.text?.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Pontos</Label>
                    <Input
                      type="number"
                      {...register(`options.${index}.points`, { valueAsNumber: true })}
                      min={0}
                      max={10}
                    />
                    {errors.options?.[index]?.points && (
                      <p className="text-sm text-destructive">
                        {errors.options[index]?.points?.message}
                      </p>
                    )}
                  </div>
                </div>
                <Input
                  type="hidden"
                  {...register(`options.${index}.order_index`, { valueAsNumber: true })}
                  value={index}
                />
                {fields.length > 2 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(index)}
                    className="mt-8"
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                )}
              </div>
            ))}

            {errors.options && typeof errors.options.message === "string" && (
              <p className="text-sm text-destructive">{errors.options.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {question ? "Atualizar" : "Criar"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
