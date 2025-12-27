import { supabase } from "@/integrations/supabase/client";
import type { Form, Question, AnalysisEngine } from "./types";
import type { TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

import type { FormCustomization } from "./types";

export interface CreateFormData {
  name: string;
  description?: string;
  is_active?: boolean;
  customization_settings?: FormCustomization | null;
  analysis_engine_id?: string | null;
}

export interface CreateQuestionData {
  form_id: string;
  text: string;
  pillar?: "posicionamento" | "produto" | "vendas"; // Legacy enum
  pillar_id?: string; // New UUID reference
  order_index: number;
  options: Array<{ text: string; points: number; order_index: number }>;
}

export interface UpdateQuestionData {
  text?: string;
  pillar?: "posicionamento" | "produto" | "vendas"; // Legacy enum
  pillar_id?: string; // New UUID reference
  order_index?: number;
  options?: Array<{ id?: string; text: string; points: number; order_index: number }>;
}

// Forms CRUD
export async function createForm(data: CreateFormData) {
  const { data: session } = await supabase.auth.getSession();
  if (!session.session) {
    throw new Error("Usuário não autenticado");
  }

  const { data: form, error } = await supabase
    .from("forms")
    .insert({
      name: data.name,
      description: data.description || null,
      is_active: data.is_active ?? true,
      created_by: session.session.user.id,
      customization_settings: data.customization_settings || null,
      analysis_engine_id: data.analysis_engine_id || null,
    })
    .select()
    .single();

  if (error) throw error;
  return form;
}

export async function getForms(includeInactive = false) {
  let query = supabase.from("forms").select("*").order("created_at", { ascending: false });

  if (!includeInactive) {
    query = query.eq("is_active", true);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getFormById(id: string) {
  const { data, error } = await supabase.from("forms").select("*").eq("id", id).single();
  if (error) throw error;
  return data;
}

export async function updateForm(id: string, data: Partial<CreateFormData>) {
  const updateData: Record<string, unknown> = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.is_active !== undefined) updateData.is_active = data.is_active;
  if (data.customization_settings !== undefined) updateData.customization_settings = data.customization_settings;
  if (data.analysis_engine_id !== undefined) updateData.analysis_engine_id = data.analysis_engine_id;

  const { data: form, error } = await supabase
    .from("forms")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return form;
}

export async function deleteForm(id: string) {
  const { error } = await supabase.from("forms").delete().eq("id", id);
  if (error) throw error;
}

// Get form with questions and options
export async function getFormWithQuestions(formId: string): Promise<Form> {
  // Get form
  const { data: form, error: formError } = await supabase
    .from("forms")
    .select("*")
    .eq("id", formId)
    .single();

  if (formError) throw formError;

  // If form has an analysis engine, fetch it with pillars
  let analysisEngineWithPillars: AnalysisEngine | null = null;
  if (form.analysis_engine_id) {
    const { getAnalysisEngineWithPillars } = await import("./analysisEngines");
    analysisEngineWithPillars = await getAnalysisEngineWithPillars(form.analysis_engine_id);
  }

  // Get questions
  const { data: questions, error: questionsError } = await supabase
    .from("questions")
    .select("*")
    .eq("form_id", formId)
    .order("order_index", { ascending: true });

  if (questionsError) throw questionsError;

  // Get options for each question
  const questionsWithOptions: Question[] = await Promise.all(
    (questions || []).map(async (question) => {
      const { data: options, error: optionsError } = await supabase
        .from("question_options")
        .select("*")
        .eq("question_id", question.id)
        .order("order_index", { ascending: true });

      if (optionsError) throw optionsError;

      return {
        id: question.id,
        text: question.text,
        pillar: question.pillar || undefined,
        pillar_id: (question as any).pillar_id || undefined,
        order_index: question.order_index,
        options: (options || []).map((opt) => ({
          id: opt.id,
          text: opt.text,
          points: opt.points,
          order_index: opt.order_index,
        })),
      };
    })
  );

  return {
    ...form,
    questions: questionsWithOptions,
    analysis_engine: analysisEngineWithPillars || undefined,
  } as Form;
}

// Get active form with questions
export async function getActiveFormWithQuestions(): Promise<Form | null> {
  const { data: forms, error } = await supabase
    .from("forms")
    .select("id")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(1);

  if (error) throw error;
  if (!forms || forms.length === 0) return null;

  return getFormWithQuestions(forms[0].id);
}

// Questions CRUD
export async function createQuestion(data: CreateQuestionData) {
  // Create question
  const insertData: TablesInsert<"public", "questions"> = {
    form_id: data.form_id,
    text: data.text,
    order_index: data.order_index,
  } as any;
  
  // Use pillar_id if provided, otherwise use legacy pillar enum
  if (data.pillar_id) {
    insertData.pillar_id = data.pillar_id as any;
  } else if (data.pillar) {
    insertData.pillar = data.pillar as any;
  } else {
    throw new Error("Either pillar_id or pillar must be provided");
  }
  
  const { data: question, error: questionError } = await supabase
    .from("questions")
    .insert(insertData)
    .select()
    .single();

  if (questionError) throw questionError;

  // Create options
  if (data.options && data.options.length > 0) {
    const { error: optionsError } = await supabase.from("question_options").insert(
      data.options.map((opt) => ({
        question_id: question.id,
        text: opt.text,
        points: opt.points,
        order_index: opt.order_index,
      }))
    );

    if (optionsError) throw optionsError;
  }

  return question;
}

export async function updateQuestion(questionId: string, data: UpdateQuestionData) {
  // Update question
  const updateData: TablesUpdate<"public", "questions"> = {};
  if (data.text !== undefined) updateData.text = data.text;
  if (data.pillar_id !== undefined) {
    updateData.pillar_id = data.pillar_id as any;
    // Clear legacy pillar when using pillar_id
    updateData.pillar = null as any;
  } else if (data.pillar !== undefined) {
    updateData.pillar = data.pillar as any;
    // Clear pillar_id when using legacy pillar
    updateData.pillar_id = null as any;
  }
  if (data.order_index !== undefined) updateData.order_index = data.order_index;

  if (Object.keys(updateData).length > 0) {
    const { error: questionError } = await supabase
      .from("questions")
      .update(updateData)
      .eq("id", questionId);

    if (questionError) throw questionError;
  }

  // Update options if provided
  if (data.options) {
    // Delete existing options
    const { error: deleteError } = await supabase
      .from("question_options")
      .delete()
      .eq("question_id", questionId);

    if (deleteError) throw deleteError;

    // Insert new options
    if (data.options.length > 0) {
      const { error: insertError } = await supabase.from("question_options").insert(
        data.options.map((opt) => ({
          question_id: questionId,
          text: opt.text,
          points: opt.points,
          order_index: opt.order_index,
        }))
      );

      if (insertError) throw insertError;
    }
  }
}

export async function deleteQuestion(questionId: string) {
  // Options will be deleted automatically due to CASCADE
  const { error } = await supabase.from("questions").delete().eq("id", questionId);
  if (error) throw error;
}

