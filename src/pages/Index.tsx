import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useForms } from "@/hooks/useForms";
import { useAuth } from "@/hooks/useAuth";
import { Plus, ArrowRight } from "lucide-react";
import { Loader2 } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: forms, isLoading } = useForms(false); // Apenas formulários ativos

  const activeForm = forms && forms.length > 0 ? forms[0] : null;

  const handleViewForm = () => {
    navigate("/admin");
  };

  const handleCreateMethod = () => {
    if (user) {
      navigate("/analysis-engine/new");
    } else {
      navigate("/auth");
    }
  };

  return (
    <>
      <Helmet>
        <title>IGM | Diagnóstico Estratégico</title>
        <meta
          name="description"
          content="Descubra seu principal gargalo estratégico rumo aos R$100.000/mês em mentorias e consultorias com o IGM."
        />
      </Helmet>

      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        
        <main className="flex-1">
          <div className="w-[80vw] max-w-7xl mx-auto px-4 py-8">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-foreground mb-4">
                IGM
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Diagnóstico Estratégico para identificar seu principal gargalo e acelerar seu crescimento
              </p>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={handleViewForm}>
                  <CardHeader>
                    <CardTitle>Ir para Formulários</CardTitle>
                    <CardDescription>
                      Responda ao diagnóstico estratégico e descubra seu principal gargalo
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full" onClick={(e) => { e.stopPropagation(); handleViewForm(); }}>
                      Ver Formulários
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={handleCreateMethod}>
                  <CardHeader>
                    <CardTitle>Criar Método</CardTitle>
                    <CardDescription>
                      Crie e gerencie novos formulários de diagnóstico
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={(e) => { e.stopPropagation(); handleCreateMethod(); }}
                    >
                      Criar Método
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}

            {!activeForm && !isLoading && (
              <div className="mt-12 text-center">
                <p className="text-muted-foreground mb-4">
                  Nenhum formulário ativo disponível no momento.
                </p>
                {user && (
                  <Button onClick={() => navigate("/admin")}>
                    <Plus className="mr-2 h-4 w-4" />
                    Criar Formulário
                  </Button>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
};

export default Index;
