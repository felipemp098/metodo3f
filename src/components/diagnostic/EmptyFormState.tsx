import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Settings, AlertCircle } from "lucide-react";

export function EmptyFormState() {
  const { user } = useAuth();

  return (
    <div className="text-center py-12">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
        <AlertCircle className="w-8 h-8 text-muted-foreground" />
      </div>
      <h2 className="text-xl font-semibold mb-2">
        Nenhum formulário ativo encontrado
      </h2>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        Para usar o diagnóstico, é necessário criar e ativar um formulário na área administrativa.
      </p>
      {user ? (
        <Link to="/admin">
          <Button>
            <Settings className="w-4 h-4 mr-2" />
            Ir para Formulários
          </Button>
        </Link>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Faça login para criar formulários
          </p>
          <Link to="/auth">
            <Button>
              Fazer Login
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}

