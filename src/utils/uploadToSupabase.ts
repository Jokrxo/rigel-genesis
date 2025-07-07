
import { supabase } from "@/integrations/supabase/client";

/**
 * Uploads a file to Supabase storage ('statements' bucket).
 * @param file - The file to upload
 * @param user_id - The user's id
 * @returns The public URL on success or throws on error.
 */
export async function uploadStatementFile(file: File, user_id: string): Promise<string> {
  const ext = file.name.split(".").pop();
  const uuid = crypto.randomUUID();
  const path = `${user_id}/${uuid}.${ext}`;
  const { data, error } = await supabase.storage.from("statements").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;
  // Get a signed URL (valid for 6h)
  const { data: urlData } = await supabase.storage.from("statements").createSignedUrl(path, 60 * 60 * 6);
  if (!urlData?.signedUrl) throw new Error("Failed to get file URL.");
  return urlData.signedUrl;
}
