import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Header } from "@/components/layout/Header";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { useForm, useFormWithQuestions } from "@/hooks/useForms";
import { useFormResponses } from "@/hooks/useResponses";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, ExternalLink, Loader2, Copy, Check, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getShareUrl } from "@/lib/responses";
import { useState } from "react";
import * as React from "react";
import { pillarLabels } from "@/lib/types";

function FormResponsesContent() {
  const { formId } = useParams<{ formId: string }>();
  const { toast } = useToast();
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [expandedResponse, setExpandedResponse] = useState<string | null>(null);

  const { data: form, isLoading: isLoadingForm } = useForm(formId || null);
  const { data: formWithQuestions } = useFormWithQuestions(formId || null);
  const { data: responses, isLoading: isLoadingResponses } = useFormResponses(formId || null);

  const handleCopyShareToken = async (shareToken: string) => {
    const shareUrl = getShareUrl(shareToken);
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedToken(shareToken);
      toast({
        title: "Link copiado!",
        description: "O link de compartilhamento foi copiado para a área de transferência.",
      });
      setTimeout(() => setCopiedToken(null), 2000);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível copiar o link.",
        variant: "destructive",
      });
    }
  };

  const handleViewResponse = (shareToken: string) => {
    window.open(getShareUrl(shareToken), "_blank");
  };

  if (!formId) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <Breadcrumbs />
        <main className="flex-1 flex items-center justify-center">
          <div className="w-[80vw] max-w-7xl mx-auto px-4 py-12 text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">
              Formulário não encontrado
            </h1>
            <Link to="/admin">
              <Button>Voltar para Formulários</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const isLoading = isLoadingForm || isLoadingResponses;

  // Helper function to get selected option text for a question
  const getSelectedOptionText = (questionId: string, selectedPoints: number): string | null => {
    if (!formWithQuestions?.questions) return null;
    const question = formWithQuestions.questions.find((q) => q.id === questionId);
    if (!question) return null;
    const option = question.options.find((opt) => opt.points === selectedPoints);
    return option?.text || null;
  };

  return (
    <>
      <Helmet>
        <title>Respostas do Formulário | IGM</title>
        <meta name="description" content={`Visualizar respostas do formulário ${form?.name}`} />
      </Helmet>

      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <Breadcrumbs />

        <main className="flex-1">
          <div className="w-[80vw] max-w-7xl mx-auto px-4 py-8">
            <div className="mb-6">
              <div className="flex items-center gap-4 mb-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2"
                  asChild
                >
                  <Link to="/admin">
                    <ArrowLeft className="w-4 h-4" />
                    Voltar
                  </Link>
                </Button>
              </div>
              <h1 className="text-2xl font-bold text-foreground">Respostas do Formulário</h1>
              <p className="text-sm text-muted-foreground">
                {form?.name} - Visualize todas as respostas recebidas
              </p>
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Respostas Recebidas</CardTitle>
                    <CardDescription>
                      Total de {responses?.length || 0} resposta{responses?.length !== 1 ? "s" : ""}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : !responses || responses.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground mb-4">
                      Nenhuma resposta encontrada para este formulário.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      As respostas aparecerão aqui quando o formulário for preenchido.
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-left">Data de Criação</TableHead>
                        <TableHead className="text-center">Usuário</TableHead>
                        <TableHead className="text-center">Diagnóstico</TableHead>
                        <TableHead className="text-center">Bottleneck</TableHead>
                        <TableHead className="text-center">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {responses.map(({ response, diagnostic }) => {
                        const isExpanded = expandedResponse === response.id;
                        const answers = response.answers || {};
                        
                        return (
                          <React.Fragment key={response.id}>
                            <TableRow>
                                <TableCell className="text-left">
                                  {new Date(response.created_at).toLocaleString("pt-BR", {
                                    dateStyle: "short",
                                    timeStyle: "short",
                                  })}
                                </TableCell>
                                <TableCell className="text-center">
                                  {response.user_id ? (
                                    <Badge variant="secondary">Autenticado</Badge>
                                  ) : (
                                    <Badge variant="outline">Anônimo</Badge>
                                  )}
                                </TableCell>
                                <TableCell className="text-center">
                                  {diagnostic ? (
                                    <Badge variant="default">Disponível</Badge>
                                  ) : (
                                    <Badge variant="secondary">Pendente</Badge>
                                  )}
                                </TableCell>
                                <TableCell className="text-center">
                                  {diagnostic?.bottleneck ? (
                                    <Badge variant="outline">{diagnostic.bottleneck}</Badge>
                                  ) : (
                                    <span className="text-muted-foreground">-</span>
                                  )}
                                </TableCell>
                                <TableCell className="text-center">
                                  <div className="flex items-center justify-center gap-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => setExpandedResponse(isExpanded ? null : response.id)}
                                      title="Expandir detalhes"
                                    >
                                      <ChevronDown
                                        className={`w-4 h-4 transition-transform ${
                                          isExpanded ? "rotate-180" : ""
                                        }`}
                                      />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleCopyShareToken(response.share_token)}
                                      title="Copiar link de compartilhamento"
                                    >
                                      {copiedToken === response.share_token ? (
                                        <Check className="w-4 h-4 text-green-600" />
                                      ) : (
                                        <Copy className="w-4 h-4" />
                                      )}
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleViewResponse(response.share_token)}
                                      title="Visualizar resposta"
                                    >
                                      <ExternalLink className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                              {isExpanded && (
                                <TableRow>
                                  <TableCell colSpan={5} className="p-4 bg-muted/50 border-0">
                                    <h4 className="font-semibold mb-4">Respostas Detalhadas</h4>
                                    {formWithQuestions?.questions ? (
                                      <div className="space-y-4">
                                        {formWithQuestions.questions
                                          .sort((a, b) => a.order_index - b.order_index)
                                          .map((question) => {
                                            const selectedPoints = answers[question.id];
                                            const selectedOptionText = selectedPoints
                                              ? getSelectedOptionText(question.id, selectedPoints)
                                              : null;

                                            return (
                                              <div key={question.id} className="space-y-2">
                                                <div className="flex items-start gap-3">
                                                  <Badge variant="outline" className="mt-0.5">
                                                    {pillarLabels[question.pillar]}
                                                  </Badge>
                                                  <div className="flex-1">
                                                    <p className="font-medium text-sm">
                                                      {question.text}
                                                    </p>
                                                    {selectedOptionText ? (
                                                      <div className="mt-2 p-3 bg-background border rounded-md">
                                                        <p className="text-sm text-muted-foreground">
                                                          Resposta selecionada:
                                                        </p>
                                                        <p className="text-sm font-medium mt-1">
                                                          {selectedOptionText}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                          Pontos: {selectedPoints}
                                                        </p>
                                                      </div>
                                                    ) : (
                                                      <p className="text-sm text-muted-foreground italic mt-2">
                                                        Nenhuma resposta registrada
                                                      </p>
                                                    )}
                                                  </div>
                                                </div>
                                                <Separator />
                                              </div>
                                            );
                                          })}
                                      </div>
                                    ) : (
                                      <p className="text-sm text-muted-foreground">
                                        Carregando perguntas...
                                      </p>
                                    )}
                                  </TableCell>
                                </TableRow>
                              )}
                            </React.Fragment>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </>
  );
}

export default function FormResponses() {
  return (
    <ProtectedRoute>
      <FormResponsesContent />
    </ProtectedRoute>
  );
}

