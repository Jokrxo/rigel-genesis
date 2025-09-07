export interface Country {
  id: string;
  code: string;
  name: string;
  corporate_tax_rate: number;
  capital_gains_tax_inclusion: number;
  is_active: boolean;
}

export interface DeferredTaxProject {
  id: string;
  user_id: string;
  name: string;
  country_id: string;
  tax_year: number;
  reporting_currency: string;
  multi_entity: boolean;
  status: 'draft' | 'final' | 'archived';
  created_at: string;
  updated_at: string;
  country?: Country;
}

export type CategoryType = 'temporary_taxable' | 'temporary_deductible' | 'tax_losses' | 'initial_recognition' | 'uncertain_positions';

export interface DeferredTaxCategory {
  id: string;
  project_id: string;
  entity_name?: string;
  category_type: CategoryType;
  description: string;
  book_value: number;
  tax_value: number;
  temporary_difference: number;
  applicable_tax_rate: number;
  deferred_tax_asset: number;
  deferred_tax_liability: number;
  recognition_criteria_met: boolean;
  reversal_pattern?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export type LossType = 'assessed_loss' | 'capital_loss' | 'other';

export interface TaxLossCarryForward {
  id: string;
  project_id: string;
  entity_name?: string;
  loss_type: LossType;
  loss_amount: number;
  origination_year: number;
  expiry_year?: number;
  utilization_probability: number;
  deferred_tax_asset: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export type MovementType = 'opening_balance' | 'origination' | 'reversal' | 'rate_change' | 'closing_balance';

export interface DeferredTaxMovement {
  id: string;
  project_id: string;
  category_id?: string;
  loss_id?: string;
  movement_type: MovementType;
  deferred_tax_asset_movement: number;
  deferred_tax_liability_movement: number;
  movement_date: string;
  description?: string;
  created_at: string;
}

export interface DeferredTaxSummary {
  total_dta: number;
  total_dtl: number;
  net_position: number;
  by_category: {
    category_type: CategoryType;
    dta: number;
    dtl: number;
  }[];
  by_entity: {
    entity_name: string;
    dta: number;
    dtl: number;
  }[];
}