
import { supabase } from '@/integrations/supabase/client';
import { ownershipTemplates } from './coa-data';

export type OwnershipForm = 'sole' | 'partnership' | 'llc' | 'corp' | 'pty_ltd' | 'soe' | 'other';

export async function seedEntity(
  name: string,
  address: string,
  ownership: OwnershipForm,
  inventorySystem: 'periodic' | 'perpetual' = 'periodic'
) {
  // 1. Create Entity
  const { data: entity, error: entityError } = await supabase
    .from('entities')
    .insert({
      name,
      address,
      ownership,
      inventory_system: inventorySystem
    })
    .select()
    .single();

  if (entityError) throw new Error(`Failed to create entity: ${entityError.message}`);
  if (!entity) throw new Error('Entity creation failed');

  // 2. Seed Chart of Accounts
  const template = ownershipTemplates[ownership] || ownershipTemplates.other;
  
  // Map accounts to DB columns (snake_case assumed for Supabase)
  const accountsToInsert = template.accounts.map(account => ({
    entity_id: entity.id,
    code: account.code,
    name: account.name,
    type: account.type,
    balance: 0,
    is_active: true
  }));

  // Adjust for Inventory System
  if (inventorySystem === 'periodic') {
     // For Periodic, we often track Purchases separately
     accountsToInsert.push({
        entity_id: entity.id,
        code: '5002',
        name: 'Purchases',
        type: 'EXPENSE',
        balance: 0,
        is_active: true
     });
  }

  const { error: coaError } = await supabase
    .from('chart_of_accounts')
    .insert(accountsToInsert);

  if (coaError) {
    console.error('COA Seed Error:', coaError);
    // We don't throw here to allow partial success, but ideally should transaction.
    // Since Supabase REST doesn't support multi-table transaction easily without RPC,
    // we proceed.
  }

  return { entity, accounts: accountsToInsert };
}
