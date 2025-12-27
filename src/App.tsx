import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import FormQuestions from "./pages/FormQuestions";
import FormResponses from "./pages/FormResponses";
import FormView from "./pages/FormView";
import Share from "./pages/Share";
import AnalysisEngine from "./pages/AnalysisEngine";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
                    <Route path="/admin" element={<Admin />} />
                    <Route path="/admin/forms/:formId/questions" element={<FormQuestions />} />
                    <Route path="/admin/forms/:formId/responses" element={<FormResponses />} />
                    <Route path="/analysis-engine" element={<AnalysisEngine />} />
                    <Route path="/analysis-engine/new" element={<AnalysisEngine />} />
                    <Route path="/analysis-engine/:engineId" element={<AnalysisEngine />} />
                    <Route path="/form/:formId" element={<FormView />} />
                    <Route path="/share/:token" element={<Share />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
