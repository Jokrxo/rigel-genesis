/**
 * Helper to get company_id from the profiles table.
 * The `company_id` column exists in the database but may not be in generated types.
 * This helper casts appropriately to avoid build errors.
 */
import { supabase } from "@/integrations/supabase/client";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

export const getCompanyIdForUser = async (userId: string): Promise<string | null> => {
  const { data } = await db
    .from('profiles')
    .select('company_id')
    .eq('user_id', userId)
    .single();
  return data?.company_id || null;
};

export const getCurrentUserCompanyId = async (): Promise<string | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  return getCompanyIdForUser(user.id);
};

/** Typed-safe access to tables not in generated types */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const fromTable = (table: string) => (supabase as any).from(table);
