import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { DiagnosticFlow } from "@/components/diagnostic/DiagnosticFlow";

export default function FormView() {
  const { formId } = useParams<{ formId: string }>();

  if (!formId) {
    return null;
  }

  return (
    <>
      <Helmet>
        <title>Diagnóstico | IGM</title>
        <meta name="description" content="Responda o diagnóstico estratégico" />
      </Helmet>
      <DiagnosticFlow formId={formId} showHeader={false} />
    </>
  );
}
