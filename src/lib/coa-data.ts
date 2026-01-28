
export type AccountType = 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE' | 'CONTRA_ASSET';

export interface BaseAccount {
  code: string;
  name: string;
  type: AccountType;
}

export const baseAccounts: BaseAccount[] = [
  { code: '1001', name: 'Cash', type: 'ASSET' },
  { code: '1101', name: 'Accounts Receivable', type: 'ASSET' },
  { code: '1201', name: 'Inventory', type: 'ASSET' },
  { code: '1601', name: 'Fixed Assets', type: 'ASSET' },
  { code: '1701', name: 'Accumulated Depreciation', type: 'CONTRA_ASSET' },
  { code: '2001', name: 'Accounts Payable', type: 'LIABILITY' },
  { code: '3001', name: "Owner's Equity", type: 'EQUITY' },
  { code: '3101', name: 'Retained Earnings', type: 'EQUITY' },
  { code: '4001', name: 'Sales Revenue', type: 'REVENUE' },
  { code: '5001', name: 'Cost of Goods Sold', type: 'EXPENSE' },
  { code: '6001', name: 'Operating Expenses', type: 'EXPENSE' },
  { code: '6101', name: 'Depreciation Expense', type: 'EXPENSE' },
];

export const ownershipTemplates = {
  sole: { name: 'Sole Proprietorship COA', accounts: baseAccounts },
  partnership: { name: 'Partnership COA', accounts: baseAccounts },
  llc: { 
    name: 'LLC COA', 
    accounts: baseAccounts.map(a => a.code === '3001' ? { ...a, name: 'Members Equity' } : a) 
  },
  corp: { 
    name: 'Corporation COA', 
    accounts: baseAccounts.map(a => a.code === '3001' ? { ...a, name: 'Share Capital' } : a) 
  },
  pty_ltd: { 
    name: 'Private Company (Pty Ltd) COA', 
    accounts: baseAccounts.map(a => a.code === '3001' ? { ...a, name: 'Share Capital' } : a) 
  },
  soe: { 
    name: 'State Owned Entity COA', 
    accounts: baseAccounts.map(a => a.code === '3001' ? { ...a, name: 'Capital Fund' } : a) 
  },
  other: { 
    name: 'General COA', 
    accounts: baseAccounts 
  },
};

export const transactionMappings = [
  { type: 'sale_cash', debitCode: '1001', creditCode: '4001', description: 'Cash sale', isActive: true },
  { type: 'sale_credit', debitCode: '1101', creditCode: '4001', description: 'Credit sale', isActive: true },
  { type: 'purchase_inventory', debitCode: '1201', creditCode: '2001', description: 'Inventory purchase on credit', isActive: true },
  { type: 'asset_purchase_cash', debitCode: '1601', creditCode: '1001', description: 'Fixed asset purchase cash', isActive: true },
  { type: 'asset_purchase_credit', debitCode: '1601', creditCode: '2001', description: 'Fixed asset purchase on credit', isActive: true },
  { type: 'monthly_depreciation', debitCode: '6101', creditCode: '1701', description: 'Monthly depreciation', isActive: true },
  { type: 'disposal_cost_remove', debitCode: '1701', creditCode: '1601', description: 'Remove cost via accumulated depreciation', isActive: true },
  { type: 'disposal_sale_cash', debitCode: '1001', creditCode: '1601', description: 'Record disposal cash proceeds', isActive: true },
  { type: 'disposal_sale_credit', debitCode: '1101', creditCode: '1601', description: 'Record disposal credit proceeds', isActive: true },
  { type: 'disposal_gain', debitCode: '1601', creditCode: '4001', description: 'Gain on disposal', isActive: true },
  { type: 'disposal_loss', debitCode: '6001', creditCode: '1601', description: 'Loss on disposal', isActive: true },
];
