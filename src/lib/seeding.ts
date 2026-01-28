
import { ownershipTemplates } from './coa-data';

export type OwnershipForm = 'sole' | 'partnership' | 'llc' | 'corp' | 'pty_ltd' | 'soe' | 'other';

export async function seedEntity(
  name: string,
  address: string,
  ownership: OwnershipForm,
  inventorySystem: 'periodic' | 'perpetual' = 'periodic'
) {
  // Create entity in localStorage since DB table doesn't exist
  const entityId = crypto.randomUUID();
  const entity = {
    id: entityId,
    name,
    address,
    ownership,
    inventory_system: inventorySystem,
    created_at: new Date().toISOString(),
  };

  // Store entity
  localStorage.setItem(`rigel_entity_${entityId}`, JSON.stringify(entity));

  // Prepare chart of accounts template
  const template = ownershipTemplates[ownership] || ownershipTemplates.other;
  
  const accountsToInsert = template.accounts.map(account => ({
    entity_id: entityId,
    code: account.code,
    name: account.name,
    type: account.type,
    balance: 0,
    is_active: true
  }));

  if (inventorySystem === 'periodic') {
     accountsToInsert.push({
        entity_id: entityId,
        code: '5002',
        name: 'Purchases',
        type: 'EXPENSE',
        balance: 0,
        is_active: true
     });
  }

  // Store chart of accounts in localStorage
  localStorage.setItem(`rigel_coa_${entityId}`, JSON.stringify(accountsToInsert));
  console.log('Chart of accounts template prepared:', accountsToInsert.length, 'accounts');

  return { entity, accounts: accountsToInsert };
}
