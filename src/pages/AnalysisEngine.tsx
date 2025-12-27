import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Header } from "@/components/layout/Header";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { useAnalysisEngines, useAnalysisEngineWithPillars, useCreateAnalysisEngine, useUpdateAnalysisEngine, useDeleteAnalysisEngine } from "@/hooks/useAnalysisEngines";
import { useCreatePillar, useUpdatePillar, useDeletePillar } from "@/hooks/usePillars";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Trash2, Loader2, GripVertical, Save, Edit, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { PillarEntity } from "@/lib/types";

interface PillarFormData {
  id?: string;
  name: string;
  description: string;
  feedback: string;
}

function AnalysisEngineList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: engines, isLoading } = useAnalysisEngines();
  const deleteEngineMutation = useDeleteAnalysisEngine();
  const [deleteEngineId, setDeleteEngineId] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!deleteEngineId) return;

    try {
      await deleteEngineMutation.mutateAsync(deleteEngineId);
      toast({
        title: "Motor deletado",
        description: "O motor de análise foi deletado com sucesso.",
      });
      setDeleteEngineId(null);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível deletar o motor de análise.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Helmet>
        <title>Motores de Análise | IGM</title>
        <meta name="description" content="Gerencie seus motores de análise" />
      </Helmet>

      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <Breadcrumbs />

        <main className="flex-1">
          <div className="w-[80vw] max-w-7xl mx-auto px-4 py-8">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-foreground">Motores de Análise</h1>
              <p className="text-sm text-muted-foreground">
                Crie e gerencie motores de análise com pilares personalizados
              </p>
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Motores de Análise</CardTitle>
                    <CardDescription>
                      Gerencie seus métodos de análise e seus pilares
                    </CardDescription>
                  </div>
                  <Button onClick={() => navigate("/analysis-engine/new")}>
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Motor
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : !engines || engines.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground mb-4">
                      Nenhum motor de análise encontrado.
                    </p>
                    <Button onClick={() => navigate("/analysis-engine/new")}>
                      <Plus className="w-4 h-4 mr-2" />
                      Criar Primeiro Motor
                    </Button>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-left">Nome</TableHead>
                        <TableHead className="text-center">Descrição</TableHead>
                        <TableHead className="text-center">Criado em</TableHead>
                        <TableHead className="text-center">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {engines.map((engine) => (
                        <TableRow key={engine.id}>
                          <TableCell className="font-medium text-left">{engine.name}</TableCell>
                          <TableCell className="text-muted-foreground text-center">
                            {engine.description || "-"}
                          </TableCell>
                          <TableCell className="text-center">
                            {new Date(engine.created_at).toLocaleDateString("pt-BR")}
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate(`/analysis-engine/${engine.id}`)}
                                title="Editar motor"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeleteEngineId(engine.id)}
                                title="Deletar motor"
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      <AlertDialog
        open={!!deleteEngineId}
        onOpenChange={(open) => !open && setDeleteEngineId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar este motor de análise? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function AnalysisEngineForm() {
  const { engineId } = useParams<{ engineId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditing = !!engineId && engineId !== "new";

  const { data: engine, isLoading } = useAnalysisEngineWithPillars(isEditing ? engineId : null);
  const createEngineMutation = useCreateAnalysisEngine();
  const updateEngineMutation = useUpdateAnalysisEngine();
  const createPillarMutation = useCreatePillar();
  const updatePillarMutation = useUpdatePillar();
  const deletePillarMutation = useDeletePillar();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [pillars, setPillars] = useState<PillarFormData[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Load data when editing
  useEffect(() => {
    if (engine) {
      setName(engine.name);
      setDescription(engine.description || "");
      if (engine.pillars) {
        setPillars(
          engine.pillars.map((p) => ({
            id: p.id,
            name: p.name,
            description: p.description || "",
            feedback: p.feedback,
          }))
        );
      }
    } else if (!isEditing) {
      // Reset form for new engine
      setName("");
      setDescription("");
      setPillars([]);
    }
  }, [engine, isEditing]);

  const handleAddPillar = () => {
    setPillars([
      ...pillars,
      {
        name: "",
        description: "",
        feedback: "",
      },
    ]);
  };

  const handleUpdatePillar = (index: number, field: keyof PillarFormData, value: string) => {
    const updated = [...pillars];
    updated[index] = { ...updated[index], [field]: value };
    setPillars(updated);
  };

  const handleDeletePillar = async (index: number) => {
    const pillar = pillars[index];
    if (pillar.id) {
      // Delete from database
      try {
        await deletePillarMutation.mutateAsync(pillar.id);
        const updated = pillars.filter((_, i) => i !== index);
        setPillars(updated);
        toast({
          title: "Pilar removido",
          description: "O pilar foi removido com sucesso.",
        });
      } catch (error) {
        toast({
          title: "Erro",
          description: "Não foi possível remover o pilar.",
          variant: "destructive",
        });
      }
    } else {
      // Just remove from form (not saved yet)
      const updated = pillars.filter((_, i) => i !== index);
      setPillars(updated);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast({
        title: "Erro",
        description: "O nome do motor é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    if (pillars.length === 0) {
      toast({
        title: "Erro",
        description: "Adicione pelo menos um pilar.",
        variant: "destructive",
      });
      return;
    }

    for (let i = 0; i < pillars.length; i++) {
      const pillar = pillars[i];
      if (!pillar.name.trim()) {
        toast({
          title: "Erro",
          description: `O nome do pilar ${i + 1} é obrigatório.`,
          variant: "destructive",
        });
        return;
      }
      if (!pillar.feedback.trim()) {
        toast({
          title: "Erro",
          description: `A devolutiva do pilar ${i + 1} é obrigatória.`,
          variant: "destructive",
        });
        return;
      }
    }

    setIsSaving(true);

    try {
      let savedEngineId: string;

      // Create or update engine
      if (isEditing && engineId) {
        await updateEngineMutation.mutateAsync({
          id: engineId,
          data: { name, description: description || null },
        });
        savedEngineId = engineId;
      } else {
        const newEngine = await createEngineMutation.mutateAsync({
          name,
          description: description || null,
        });
        savedEngineId = newEngine.id;
      }

      // Create/update/delete pillars
      const existingPillars = engine?.pillars || [];
      const existingPillarIds = existingPillars.map((p) => p.id);

      for (let i = 0; i < pillars.length; i++) {
        const pillar = pillars[i];
        if (pillar.id && existingPillarIds.includes(pillar.id)) {
          // Update existing pillar
          await updatePillarMutation.mutateAsync({
            id: pillar.id,
            data: {
              name: pillar.name,
              description: pillar.description || null,
              feedback: pillar.feedback,
              order_index: i,
            },
          });
        } else {
          // Create new pillar
          await createPillarMutation.mutateAsync({
            analysis_engine_id: savedEngineId,
            name: pillar.name,
            description: pillar.description || null,
            feedback: pillar.feedback,
            order_index: i,
          });
        }
      }

      // Delete removed pillars
      const currentPillarIds = pillars.map((p) => p.id).filter((id): id is string => !!id);
      const toDelete = existingPillarIds.filter((id) => !currentPillarIds.includes(id));
      for (const id of toDelete) {
        await deletePillarMutation.mutateAsync(id);
      }

      toast({
        title: isEditing ? "Motor atualizado" : "Motor criado",
        description: "O motor de análise foi salvo com sucesso.",
      });

      navigate("/analysis-engine");
    } catch (error) {
      console.error("Error saving engine:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o motor de análise.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading && isEditing) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <Breadcrumbs />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>
          {isEditing ? "Editar Motor de Análise" : "Criar Motor de Análise"} | IGM
        </title>
      </Helmet>

      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <Breadcrumbs />

        <main className="flex-1">
          <div className="w-[80vw] max-w-7xl mx-auto px-4 py-8">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-foreground">
                {isEditing ? "Editar Motor de Análise" : "Criar Motor de Análise"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {isEditing
                  ? "Gerencie seu método de análise e seus pilares"
                  : "Crie um novo método de análise com pilares personalizados"}
              </p>
            </div>

            <div className="space-y-6">
              {/* Engine Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Informações do Método</CardTitle>
                  <CardDescription>
                    Defina o nome e a descrição do seu método de análise
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nome do Método *</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ex: IGM"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Descreva seu método de análise..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Pillars */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Pilares</CardTitle>
                      <CardDescription>
                        Defina os pilares do seu método. Cada pilar precisa de nome, descrição e devolutiva.
                      </CardDescription>
                    </div>
                    <Button onClick={handleAddPillar} size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Pilar
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {pillars.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <p>Nenhum pilar adicionado ainda.</p>
                      <p className="text-sm mt-2">Clique em "Adicionar Pilar" para começar.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pillars.map((pillar, index) => (
                        <Card key={index} className="bg-muted/50">
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <GripVertical className="w-5 h-5 text-muted-foreground" />
                                <CardTitle className="text-lg">Pilar {index + 1}</CardTitle>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeletePillar(index)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div>
                              <Label htmlFor={`pillar-name-${index}`}>Nome do Pilar *</Label>
                              <Input
                                id={`pillar-name-${index}`}
                                value={pillar.name}
                                onChange={(e) => handleUpdatePillar(index, "name", e.target.value)}
                                placeholder="Ex: Posicionamento"
                              />
                            </div>
                            <div>
                              <Label htmlFor={`pillar-description-${index}`}>Descrição</Label>
                              <Textarea
                                id={`pillar-description-${index}`}
                                value={pillar.description}
                                onChange={(e) =>
                                  handleUpdatePillar(index, "description", e.target.value)
                                }
                                placeholder="Descreva este pilar..."
                                rows={2}
                              />
                            </div>
                            <div>
                              <Label htmlFor={`pillar-feedback-${index}`}>
                                Devolutiva (quando for o bottleneck) *
                              </Label>
                              <Textarea
                                id={`pillar-feedback-${index}`}
                                value={pillar.feedback}
                                onChange={(e) =>
                                  handleUpdatePillar(index, "feedback", e.target.value)
                                }
                                placeholder="Esta mensagem será exibida quando este pilar for identificado como o principal gargalo..."
                                rows={4}
                              />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Save Button */}
              <div className="flex justify-end gap-4">
                <Button variant="outline" onClick={() => navigate("/analysis-engine")}>
                  Cancelar
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Salvar Motor
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

function AnalysisEngineContent() {
  const { engineId } = useParams<{ engineId: string }>();

  // Show form if engineId is "new" or if it's a specific engineId
  // Show list if no engineId (route is /analysis-engine)
  if (engineId) {
    return <AnalysisEngineForm />;
  }

  return <AnalysisEngineList />;
}

export default function AnalysisEngine() {
  return (
    <ProtectedRoute>
      <AnalysisEngineContent />
    </ProtectedRoute>
  );
}
