import { useState } from "react";
import { useFormWithQuestions } from "@/hooks/useForms";
import { useCreateQuestion, useUpdateQuestion, useDeleteQuestion } from "@/hooks/useQuestions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { QuestionDialog } from "./QuestionDialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Edit, Trash2, GripVertical, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { pillarLabels } from "@/lib/types";
import type { Question } from "@/lib/types";

interface FormQuestionsDialogProps {
  formId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FormQuestionsDialog({ formId, open, onOpenChange }: FormQuestionsDialogProps) {
  const { data: form, isLoading } = useFormWithQuestions(formId);
  const { toast } = useToast();
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isQuestionDialogOpen, setIsQuestionDialogOpen] = useState(false);
  const [deleteQuestionId, setDeleteQuestionId] = useState<string | null>(null);

  const createQuestion = useCreateQuestion(formId);
  const updateQuestion = useUpdateQuestion(formId);
  const deleteQuestion = useDeleteQuestion(formId);

  const handleDelete = async () => {
    if (!deleteQuestionId) return;

    try {
      await deleteQuestion.mutateAsync(deleteQuestionId);
      toast({
        title: "Pergunta deletada",
        description: "A pergunta foi deletada com sucesso.",
      });
      setDeleteQuestionId(null);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível deletar a pergunta.",
        variant: "destructive",
      });
    }
  };

  const handleSaveQuestion = async (data: {
    text: string;
    pillar?: "posicionamento" | "produto" | "vendas";
    pillar_id?: string;
    order_index: number;
    options: Array<{ text: string; points: number; order_index: number }>;
  }) => {
    try {
      if (editingQuestion) {
        await updateQuestion.mutateAsync({
          questionId: editingQuestion.id,
          data: {
            text: data.text,
            pillar: data.pillar,
            pillar_id: data.pillar_id,
            order_index: data.order_index,
            options: data.options,
          },
        });
        toast({
          title: "Pergunta atualizada",
          description: "A pergunta foi atualizada com sucesso.",
        });
      } else {
        await createQuestion.mutateAsync({
          form_id: formId,
          text: data.text,
          pillar: data.pillar,
          pillar_id: data.pillar_id,
          order_index: data.order_index,
          options: data.options,
        });
        toast({
          title: "Pergunta criada",
          description: "A pergunta foi criada com sucesso.",
        });
      }
      setIsQuestionDialogOpen(false);
      setEditingQuestion(null);
    } catch (error) {
      toast({
        title: "Erro",
        description: editingQuestion
          ? "Não foi possível atualizar a pergunta."
          : "Não foi possível criar a pergunta.",
        variant: "destructive",
      });
    }
  };

  const questionsByPillar = form?.questions?.reduce(
    (acc, question) => {
      if (!acc[question.pillar]) {
        acc[question.pillar] = [];
      }
      acc[question.pillar].push(question);
      return acc;
    },
    {} as Record<string, Question[]>
  ) || {};

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Gerenciar Perguntas</DialogTitle>
            <DialogDescription>
              {form?.name} - Crie e edite perguntas e suas opções de resposta
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="flex justify-end mb-4">
              <Button
                onClick={() => {
                  setEditingQuestion(null);
                  setIsQuestionDialogOpen(true);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova Pergunta
              </Button>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : !form?.questions || form.questions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  Nenhuma pergunta encontrada. Crie a primeira pergunta.
                </p>
              </div>
            ) : (
              <ScrollArea className="flex-1 pr-4">
                <div className="space-y-6">
                  {(["posicionamento", "produto", "vendas"] as const).map((pillar) => {
                    const questions = questionsByPillar[pillar] || [];
                    if (questions.length === 0) return null;

                    return (
                      <Card key={pillar}>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Badge variant="outline">{pillarLabels[pillar]}</Badge>
                            <span className="text-sm text-muted-foreground font-normal">
                              {questions.length} pergunta{questions.length > 1 ? "s" : ""}
                            </span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {questions
                              .sort((a, b) => a.order_index - b.order_index)
                              .map((question) => (
                                <div key={question.id}>
                                  <div className="flex items-start justify-between gap-4 p-4 border rounded-lg hover:bg-accent/5 transition-colors">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-2">
                                        <GripVertical className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-xs text-muted-foreground">
                                          Ordem: {question.order_index + 1}
                                        </span>
                                      </div>
                                      <p className="font-medium text-foreground mb-2">
                                        {question.text}
                                      </p>
                                      <div className="flex flex-wrap gap-2">
                                        {question.options
                                          .sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
                                          .map((option, idx) => (
                                            <Badge
                                              key={option.id || idx}
                                              variant="secondary"
                                              className="text-xs"
                                            >
                                              {option.text} ({option.points} pts)
                                            </Badge>
                                          ))}
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                          setEditingQuestion(question);
                                          setIsQuestionDialogOpen(true);
                                        }}
                                      >
                                        <Edit className="w-4 h-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setDeleteQuestionId(question.id)}
                                      >
                                        <Trash2 className="w-4 h-4 text-destructive" />
                                      </Button>
                                    </div>
                                  </div>
                                  <Separator className="mt-4" />
                                </div>
                              ))}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <QuestionDialog
        open={isQuestionDialogOpen}
        onOpenChange={(open) => {
          setIsQuestionDialogOpen(open);
          if (!open) setEditingQuestion(null);
        }}
        question={editingQuestion}
        formId={formId}
        form={form}
        existingQuestionsCount={form?.questions?.length || 0}
        onSave={handleSaveQuestion}
      />

      <AlertDialog
        open={!!deleteQuestionId}
        onOpenChange={(open) => !open && setDeleteQuestionId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deletar pergunta?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A pergunta e todas as suas opções serão
              permanentemente deletadas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

