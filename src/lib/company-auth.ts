import { supabase } from "@/integrations/supabase/client";

export const getCompanyId = async (): Promise<string | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('user_id', user.id)
    .single();
    
  return data?.company_id || null;
};
