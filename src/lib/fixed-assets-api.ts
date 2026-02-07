
import { supabase } from "@/integrations/supabase/client";
import { auditLogger } from './audit-logger';

// Type definition based on the likely Supabase schema (snake_case)
// We define it manually since it might be missing in the generated types
export interface FixedAsset {
  id: string;
  user_id: string;
  company_id?: string;
  name: string;
  category: string | null;
  purchase_date: string;
  cost_price: number;
  depreciation_rate: number;
  accum_depr: number;
  disposal_date: string | null;
  selling_price: number | null;
  created_at?: string;
  // Legacy/local fallback field (ignored by DB)
  entity_id?: string;
}

export type CreateFixedAsset = Omit<FixedAsset, 'id' | 'created_at' | 'accum_depr' | 'user_id'>;

const TABLE_NAME = 'fixed_assets';

const getCompanyId = async (userId: string) => {
  const { data } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('user_id', userId)
    .single();
  return data?.company_id;
};

export const fixedAssetsApi = {
  async getAll(companyId?: string) {
    try {
      if (!companyId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];
        companyId = await getCompanyId(user.id);
      }
      
      if (!companyId) return [];

      // supabase-js v2 no longer supports passing a single generic to `from<T>()`.
      // We keep runtime behavior the same and cast the result.
      const { data, error } = await (supabase as any)
        .from(TABLE_NAME)
        .select('*')
        .eq('company_id', companyId)
        .order('purchase_date', { ascending: false });

      if (error) {
        console.error('Supabase fixed_assets fetch failed', error);
        throw error;
      }
      
      return data as FixedAsset[];
    } catch (error) {
      console.error('Error fetching fixed assets:', error);
      return [];
    }
  },

  async create(asset: CreateFixedAsset) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const company_id = await getCompanyId(user.id);

      const { data, error } = await (supabase as any)
        .from(TABLE_NAME)
        .insert([{ ...asset, user_id: user.id, company_id }])
        .select()
        .single();

      if (error) {
        console.error('Supabase fixed_assets create failed', error);
        throw error;
      }

      await auditLogger.log({
        action: 'CREATE_ASSET',
        entityType: 'fixed_asset',
        entityId: data.id,
        details: { name: data.name, cost_price: data.cost_price, category: data.category }
      });

      return data as FixedAsset;
    } catch (error) {
      console.error('Error creating fixed asset:', error);
      throw error;
    }
  },

  async update(id: string, updates: Partial<FixedAsset>) {
    try {
      const { data, error } = await (supabase as any)
        .from(TABLE_NAME)
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Supabase fixed_assets update failed', error);
        throw error;
      }

      await auditLogger.log({
        action: 'UPDATE_ASSET',
        entityType: 'fixed_asset',
        entityId: data.id,
        details: { updates: updates }
      });

      return data as FixedAsset;
    } catch (error) {
      console.error('Error updating fixed asset:', error);
      throw error;
    }
  },

  async delete(id: string) {
    try {
      const { error } = await (supabase as any)
        .from(TABLE_NAME)
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Supabase fixed_assets delete failed', error);
        throw error;
      }

      await auditLogger.log({
        action: 'DELETE_ASSET',
        entityType: 'fixed_asset',
        entityId: id,
        details: {}
      });

      return true;
    } catch (error) {
      console.error('Error deleting fixed asset:', error);
      return false;
    }
  }
};
