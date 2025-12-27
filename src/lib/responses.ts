import { supabase } from "@/integrations/supabase/client";
import type { ScoreResult } from "./scoring";

export interface FormResponse {
  id: string;
  form_id: string;
  user_id: string | null;
  share_token: string;
  answers: Record<string, number>;
  created_at: string;
  updated_at: string;
}

export interface Diagnostic {
  id: string;
  form_response_id: string;
  scores: ScoreResult["scores"];
  max_scores: ScoreResult["maxScores"];
  percentages: ScoreResult["percentages"];
  bottleneck: string;
  levels: ScoreResult["levels"];
  pillar_id?: string | null;
  created_at: string;
}

export interface FormResponseWithDiagnostic {
  response: FormResponse;
  diagnostic: Diagnostic | null;
}

export interface SaveResponseData {
  form_id: string;
  answers: Record<string, number>;
  result: ScoreResult;
}

function generateShareToken(): string {
  // Generate a unique token using crypto API
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
}

export async function saveFormResponse(
  formId: string,
  answers: Record<string, number>,
  result: ScoreResult
): Promise<{ response: FormResponse; diagnostic: Diagnostic; shareToken: string }> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Generate unique share token
  let shareToken = generateShareToken();
  let attempts = 0;
  const maxAttempts = 10;

  // Ensure token is unique (check if exists)
  while (attempts < maxAttempts) {
    const { data: existing } = await supabase
      .from("form_responses")
      .select("id")
      .eq("share_token", shareToken)
      .single();

    if (!existing) {
      break; // Token is unique
    }

    shareToken = generateShareToken();
    attempts++;
  }

  if (attempts >= maxAttempts) {
    throw new Error("Failed to generate unique share token");
  }

  // Insert form response
  const { data: response, error: responseError } = await supabase
    .from("form_responses")
    .insert({
      form_id: formId,
      user_id: user?.id || null,
      share_token: shareToken,
      answers: answers as any,
    })
    .select()
    .single();

  if (responseError) {
    throw new Error(`Failed to save response: ${responseError.message}`);
  }

  // Insert diagnostic
  const { data: diagnostic, error: diagnosticError } = await supabase
    .from("diagnostics")
    .insert({
      form_response_id: response.id,
      scores: result.scores as any,
      max_scores: result.maxScores as any,
      percentages: result.percentages as any,
      bottleneck: result.bottleneck,
      levels: result.levels as any,
      pillar_id: result.pillar_id || null,
    })
    .select()
    .single();

  if (diagnosticError) {
    throw new Error(`Failed to save diagnostic: ${diagnosticError.message}`);
  }

  return {
    response: response as FormResponse,
    diagnostic: diagnostic as Diagnostic,
    shareToken,
  };
}

export async function getResponseByShareToken(
  shareToken: string
): Promise<{ response: FormResponse; diagnostic: Diagnostic } | null> {
  const { data: response, error: responseError } = await supabase
    .from("form_responses")
    .select("*")
    .eq("share_token", shareToken)
    .single();

  if (responseError || !response) {
    return null;
  }

  const { data: diagnostic, error: diagnosticError } = await supabase
    .from("diagnostics")
    .select("*")
    .eq("form_response_id", response.id)
    .single();

  if (diagnosticError || !diagnostic) {
    return null;
  }

  return {
    response: response as FormResponse,
    diagnostic: diagnostic as Diagnostic,
  };
}

export async function getUserResponses(
  userId: string
): Promise<FormResponse[]> {
  const { data, error } = await supabase
    .from("form_responses")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch responses: ${error.message}`);
  }

  return (data || []) as FormResponse[];
}

export function getShareUrl(shareToken: string): string {
  return `${window.location.origin}/share/${shareToken}`;
}

export async function getFormResponses(
  formId: string
): Promise<FormResponseWithDiagnostic[]> {
  // Get all responses for this form
  const { data: responses, error: responsesError } = await supabase
    .from("form_responses")
    .select("*")
    .eq("form_id", formId)
    .order("created_at", { ascending: false });

  if (responsesError) {
    throw new Error(`Failed to fetch responses: ${responsesError.message}`);
  }

  if (!responses || responses.length === 0) {
    return [];
  }

  // Get diagnostics for all responses
  const responseIds = responses.map((r) => r.id);
  const { data: diagnostics, error: diagnosticsError } = await supabase
    .from("diagnostics")
    .select("*")
    .in("form_response_id", responseIds);

  if (diagnosticsError) {
    throw new Error(`Failed to fetch diagnostics: ${diagnosticsError.message}`);
  }

  // Combine responses with their diagnostics
  const diagnosticsMap = new Map(
    (diagnostics || []).map((d) => [d.form_response_id, d as Diagnostic])
  );

  return responses.map((response) => ({
    response: response as FormResponse,
    diagnostic: diagnosticsMap.get(response.id) || null,
  }));
}

