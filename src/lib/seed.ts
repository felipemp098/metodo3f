import { createForm, createQuestion } from "./forms";
import { questions as staticQuestions } from "../data/questions";

/**
 * Migra as perguntas estáticas do arquivo questions.ts para o banco de dados
 * Cria um formulário chamado "Diagnóstico Estratégico 3F" com todas as perguntas
 */
export async function seedDefaultForm() {
  try {
    // Criar o formulário
    const form = await createForm({
      name: "Diagnóstico Estratégico 3F",
      description: "Formulário padrão do IGM - Diagnóstico Estratégico",
      is_active: true,
    });

    // Criar as perguntas
    for (let i = 0; i < staticQuestions.length; i++) {
      const staticQuestion = staticQuestions[i];
      
      await createQuestion({
        form_id: form.id,
        text: staticQuestion.text,
        pillar: staticQuestion.pillar,
        order_index: i,
        options: staticQuestion.options.map((opt, optIndex) => ({
          text: opt.text,
          points: opt.points,
          order_index: optIndex,
        })),
      });
    }

    return form;
  } catch (error) {
    console.error("Erro ao popular formulário padrão:", error);
    throw error;
  }
}
