
import { supabase } from "@/integrations/supabase/client";

// Type definition based on the likely Supabase schema (snake_case)
// We define it manually since it might be missing in the generated types
export interface FixedAsset {
  id: string;
  user_id: string;
  name: string;
  category: string | null;
  purchase_date: string;
  cost_price: number;
  depreciation_rate: number;
  accum_depr: number;
  disposal_date: string | null;
  selling_price: number | null;
  created_at?: string;
}

export type CreateFixedAsset = Omit<FixedAsset, 'id' | 'created_at' | 'accum_depr' | 'user_id'>;

const TABLE_NAME = 'fixed_assets';

export const fixedAssetsApi = {
  async getAll() {
    try {
      const { data, error } = await supabase
        .from<FixedAsset>(TABLE_NAME)
        .select('*')
        .order('purchase_date', { ascending: false });

      if (error) {
        console.warn('Supabase fixed_assets fetch failed, falling back to localStorage', error);
        return this.getLocal();
      }
      
      return data as FixedAsset[];
    } catch {
      return this.getLocal();
    }
  },

  async create(asset: CreateFixedAsset) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from<FixedAsset>(TABLE_NAME)
        .insert([{ ...asset, user_id: user.id }])
        .select()
        .single();

      if (error) {
        console.warn('Supabase fixed_assets create failed, falling back to localStorage', error);
        return this.createLocal(asset);
      }

      return data as FixedAsset;
    } catch {
      return this.createLocal(asset);
    }
  },

  async update(id: string, updates: Partial<FixedAsset>) {
    try {
      const { data, error } = await supabase
        .from<FixedAsset>(TABLE_NAME)
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.warn('Supabase fixed_assets update failed, falling back to localStorage', error);
        return this.updateLocal(id, updates);
      }

      return data as FixedAsset;
    } catch {
      return this.updateLocal(id, updates);
    }
  },

  async delete(id: string) {
    try {
      const { error } = await supabase
        .from<FixedAsset>(TABLE_NAME)
        .delete()
        .eq('id', id);

      if (error) {
        console.warn('Supabase fixed_assets delete failed, falling back to localStorage', error);
        return this.deleteLocal(id);
      }
      return true;
    } catch {
      return this.deleteLocal(id);
    }
  },

  // LocalStorage Fallback Implementation
  getLocal(): FixedAsset[] {
    const stored = localStorage.getItem('rigel_assets');
    if (!stored) return [];
    const localAssets = JSON.parse(stored);
    return localAssets.map((a: { id: string; name: string; category: string | null; purchase_date: string; purchase_price?: number; cost_price?: number; depreciation_rate: number }) => ({
      id: a.id,
      entity_id: 'demo',
      name: a.name,
      category: a.category,
      purchase_date: a.purchase_date,
      cost_price: a.purchase_price || a.cost_price || 0,
      depreciation_rate: a.depreciation_rate,
      accum_depr: 0,
      disposal_date: null,
      selling_price: null
    }));
  },

  createLocal(asset: CreateFixedAsset): FixedAsset {
    const stored = this.getLocal();
    const newAsset = { ...asset, id: crypto.randomUUID(), created_at: new Date().toISOString(), accum_depr: 0 };
    const toStore = {
        ...newAsset,
        purchase_price: newAsset.cost_price
    };
    
    const newStore = [toStore, ...stored.map(a => ({...a, purchase_price: a.cost_price}))];
    localStorage.setItem('rigel_assets', JSON.stringify(newStore));
    return newAsset as FixedAsset;
  },

  updateLocal(id: string, updates: Partial<FixedAsset>): FixedAsset | null {
    const stored = this.getLocal();
    const index = stored.findIndex(a => a.id === id);
    if (index === -1) return null;
    
    const updated = { ...stored[index], ...updates };
    stored[index] = updated;
    
    const toStore = stored.map(a => ({
        ...a,
        purchase_price: a.cost_price
    }));
    
    localStorage.setItem('rigel_assets', JSON.stringify(toStore));
    return updated;
  },

  deleteLocal(id: string): boolean {
    const stored = this.getLocal();
    const filtered = stored.filter(a => a.id !== id);
    const toStore = filtered.map(a => ({
        ...a,
        purchase_price: a.cost_price
    }));
    localStorage.setItem('rigel_assets', JSON.stringify(toStore));
    return true;
  }
};
