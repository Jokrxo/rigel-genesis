
import { supabase } from "@/integrations/supabase/client";
import { ownershipTemplates } from './coa-data';

export type OwnershipForm = 'sole' | 'partnership' | 'llc' | 'corp' | 'pty_ltd' | 'soe' | 'other';

export async function seedEntity(
  name: string,
  address: string,
  ownership: OwnershipForm,
  inventorySystem: 'periodic' | 'perpetual' = 'periodic'
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  // 1. Create or Update Company
  // Check if user has a company
  const { data: profile } = await supabase.from('profiles').select('company_id').eq('user_id', user.id).single();
  
  let companyId = profile?.company_id;

  if (!companyId) {
    // Create new company
    const { data: company, error } = await supabase
      .from('companies')
      .insert({
        name,
        address, 
        settings: { ownership, inventorySystem }
      })
      .select()
      .single();

    if (error) throw error;
    companyId = company.id;

    // Link profile to company
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ company_id: companyId })
      .eq('user_id', user.id);
      
    if (profileError) throw profileError;
  } else {
    // Update existing company
    const { error } = await supabase.from('companies').update({
      name,
      address,
      settings: { ownership, inventorySystem }
    }).eq('id', companyId);
    
    if (error) throw error;
  }

  // 2. Seed COA
  // First, check if COA already exists to avoid duplicates
  const { count } = await supabase
    .from('chart_of_accounts')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', companyId);
  
  const template = ownershipTemplates[ownership] || ownershipTemplates.other;
  const accountsToInsert = [];

  if (count === 0) {
     const templateAccounts = template.accounts.map(account => ({
      company_id: companyId,
      code: account.code,
      name: account.name,
      type: account.type,
      balance: 0,
      is_active: true
    }));
    accountsToInsert.push(...templateAccounts);

    if (inventorySystem === 'periodic') {
       accountsToInsert.push({
          company_id: companyId,
          code: '5002',
          name: 'Purchases',
          type: 'EXPENSE',
          balance: 0,
          is_active: true
       });
    }

    if (accountsToInsert.length > 0) {
      const { error } = await supabase.from('chart_of_accounts').insert(accountsToInsert);
      if (error) throw error;
    }
  }

  // Fetch final COA to return
  const { data: finalCOA } = await supabase
    .from('chart_of_accounts')
    .select('*')
    .eq('company_id', companyId)
    .order('code', { ascending: true });

  return { 
    entity: { id: companyId, name, address, ownership, inventorySystem }, 
    accounts: finalCOA 
  };
}
