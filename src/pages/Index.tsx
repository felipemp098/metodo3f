import { DiagnosticFlow } from "@/components/diagnostic/DiagnosticFlow";
import { Helmet } from "react-helmet-async";

const Index = () => {
  return (
    <>
      <Helmet>
        <title>Diagnóstico Estratégico | Método 3F</title>
        <meta
          name="description"
          content="Descubra seu principal gargalo estratégico rumo aos R$100.000/mês em mentorias e consultorias com o Diagnóstico 3F."
        />
      </Helmet>
      <DiagnosticFlow />
    </>
  );
};

export default Index;
