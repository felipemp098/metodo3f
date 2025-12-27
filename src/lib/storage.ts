import { supabase } from "@/integrations/supabase/client";

const BUCKET_NAME = "form-assets";

export interface UploadImageResult {
  url: string;
  path: string;
}

/**
 * Upload an image file to Supabase Storage
 * @param file The file to upload
 * @param formId The ID of the form (used for organizing files)
 * @param type Either 'logo' or 'background'
 * @returns The public URL of the uploaded file
 */
export async function uploadFormImage(
  file: File,
  formId: string,
  type: "logo" | "background"
): Promise<UploadImageResult> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("Usuário não autenticado");
  }

  // Validate file type
  const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
  if (!validTypes.includes(file.type)) {
    throw new Error("Tipo de arquivo inválido. Use apenas imagens (JPEG, PNG, WebP, GIF)");
  }

  // Validate file size (5MB max)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    throw new Error("Arquivo muito grande. Tamanho máximo: 5MB");
  }

  // Generate unique filename
  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
  const filePath = `forms/${formId}/${type}/${fileName}`;

  // Upload file
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    throw new Error(`Erro ao fazer upload: ${error.message}`);
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath);

  return {
    url: publicUrl,
    path: filePath,
  };
}

/**
 * Delete an image from Supabase Storage
 * @param path The path of the file to delete
 */
export async function deleteFormImage(path: string): Promise<void> {
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([path]);

  if (error) {
    throw new Error(`Erro ao deletar arquivo: ${error.message}`);
  }
}

/**
 * Get public URL for a storage path
 * @param path The storage path
 * @returns Public URL
 */
export function getStoragePublicUrl(path: string): string {
  const { data: { publicUrl } } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(path);

  return publicUrl;
}

