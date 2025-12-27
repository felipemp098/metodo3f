import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <Breadcrumbs />
      
      <main className="flex-1 flex items-center justify-center">
        <div className="w-[80vw] max-w-7xl mx-auto px-4 py-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-foreground">404</h1>
          <p className="mb-6 text-xl text-muted-foreground">
            Página não encontrada
          </p>
          <p className="mb-8 text-sm text-muted-foreground">
            A página que você está procurando não existe ou foi movida.
          </p>
          <Link to="/">
            <Button>
              Voltar para o início
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default NotFound;
