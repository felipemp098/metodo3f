import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Header } from "@/components/layout/Header";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { useForms, useDeleteForm } from "@/hooks/useForms";
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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Edit, Trash2, Eye, EyeOff, Loader2, Copy, Check, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { FormDialog } from "@/components/admin/FormDialog";
import { useSeedForm } from "@/hooks/useSeed";

function AdminContent() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [deleteFormId, setDeleteFormId] = useState<string | null>(null);
  const [editFormId, setEditFormId] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [copiedFormId, setCopiedFormId] = useState<string | null>(null);

  const { data: forms, isLoading } = useForms(true);
  const deleteFormMutation = useDeleteForm();
  const seedFormMutation = useSeedForm();

  const handleDelete = async () => {
    if (!deleteFormId) return;

    try {
      await deleteFormMutation.mutateAsync(deleteFormId);
      toast({
        title: "Formulário deletado",
        description: "O formulário foi deletado com sucesso.",
      });
      setDeleteFormId(null);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível deletar o formulário.",
        variant: "destructive",
      });
    }
  };

  const handleCopyFormLink = async (formId: string) => {
    const formLink = `${window.location.origin}/form/${formId}`;
    
    try {
      await navigator.clipboard.writeText(formLink);
      setCopiedFormId(formId);
      toast({
        title: "Link copiado!",
        description: "O link do formulário foi copiado para a área de transferência.",
      });
      setTimeout(() => setCopiedFormId(null), 2000);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível copiar o link.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Helmet>
        <title>Formulários | IGM</title>
        <meta name="description" content="Gerenciar formulários e perguntas" />
      </Helmet>

      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <Breadcrumbs />

        <main className="flex-1">
          <div className="w-[80vw] max-w-7xl mx-auto px-4 py-8">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-foreground">Formulários</h1>
              <p className="text-sm text-muted-foreground">Gerenciar formulários e perguntas</p>
            </div>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Formulários</CardTitle>
                  <CardDescription>
                    Crie e gerencie formulários de diagnóstico estratégico
                  </CardDescription>
                </div>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Formulário
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : !forms || forms.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">
                    Nenhum formulário encontrado.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Button
                      onClick={() => seedFormMutation.mutate()}
                      disabled={seedFormMutation.isPending}
                    >
                      {seedFormMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Criando...
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-2" />
                          Criar Formulário Padrão
                        </>
                      )}
                    </Button>
                    <span className="text-sm text-muted-foreground">ou</span>
                    <Button
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(true)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Criar Formulário Personalizado
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-4 max-w-md mx-auto">
                    O formulário padrão cria automaticamente todas as perguntas do IGM.
                    Ou você pode criar um formulário personalizado do zero.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-left">Nome</TableHead>
                      <TableHead className="text-center">Descrição</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-center">Criado em</TableHead>
                      <TableHead className="text-center">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {forms.map((form) => (
                      <TableRow key={form.id}>
                        <TableCell className="font-medium text-left">{form.name}</TableCell>
                        <TableCell className="text-muted-foreground text-center">
                          {form.description || "-"}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={form.is_active ? "default" : "secondary"}>
                            {form.is_active ? (
                              <>
                                <Eye className="w-3 h-3 mr-1" />
                                Ativo
                              </>
                            ) : (
                              <>
                                <EyeOff className="w-3 h-3 mr-1" />
                                Inativo
                              </>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-center">
                          {new Date(form.created_at).toLocaleDateString("pt-BR")}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopyFormLink(form.id)}
                              title="Copiar link do formulário"
                            >
                              {copiedFormId === form.id ? (
                                <Check className="w-4 h-4 text-green-600" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/admin/forms/${form.id}/responses`)}
                              title="Visualizar respostas"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/admin/forms/${form.id}/questions`)}
                              title="Gerenciar perguntas"
                            >
                              <FileText className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditFormId(form.id)}
                              title="Editar formulário"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteFormId(form.id)}
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

        <FormDialog
          open={isCreateDialogOpen || !!editFormId}
          onOpenChange={(open) => {
            if (!open) {
              setIsCreateDialogOpen(false);
              setEditFormId(null);
            }
          }}
          formId={editFormId}
        />

        <AlertDialog open={!!deleteFormId} onOpenChange={(open) => !open && setDeleteFormId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Deletar formulário?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita. O formulário e todas as suas perguntas serão
                permanentemente deletados.
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
      </div>
    </>
  );
}

export default function Admin() {
  return (
    <ProtectedRoute>
      <AdminContent />
    </ProtectedRoute>
  );
}

