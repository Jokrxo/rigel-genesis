
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

// Type definition based on the likely Supabase schema (snake_case)
// We define it manually since it might be missing in the generated types
export interface FixedAsset {
  id: string;
  entity_id: string; // Map to entityId
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

export type CreateFixedAsset = Omit<FixedAsset, 'id' | 'created_at' | 'accum_depr'>;

const TABLE_NAME = 'fixed_assets';

export const fixedAssetsApi = {
  async getAll(entityId: string = 'demo') {
    const { data, error } = await supabase
      .from(TABLE_NAME as "fixed_assets") // Cast to allow missing table in types
      .select('*')
      .eq('entity_id', entityId)
      .order('purchase_date', { ascending: false });

    if (error) {
      console.warn('Supabase fixed_assets fetch failed, falling back to localStorage', error);
      return this.getLocal();
    }
    
    // Map snake_case to the frontend expected format if needed, or just return as is
    // The component expects camelCase-ish but let's stick to one convention.
    // Actually AssetManagement.tsx uses: name, category, purchase_date (snake), purchase_price (snake?), current_value...
    // Let's align with the component's expectation or refactor the component.
    // Component uses: id, name, category, purchase_date, purchase_price, current_value, depreciation_rate, useful_life, location
    
    // We will return the data as is from DB (snake_case) and let the component adapt or we adapt here.
    // Let's adapt here to match the Component's Asset interface partially, 
    // but the component uses "purchase_price" vs "cost_price".
    return data as unknown as FixedAsset[];
  },

  async create(asset: CreateFixedAsset) {
    // Try Supabase
    const { data, error } = await supabase
      .from(TABLE_NAME as "fixed_assets")
      .insert([asset])
      .select()
      .single();

    if (error) {
      console.warn('Supabase fixed_assets create failed, falling back to localStorage', error);
      return this.createLocal(asset);
    }

    return data as unknown as FixedAsset;
  },

  async update(id: string, updates: Partial<FixedAsset>) {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
       console.warn('Supabase fixed_assets update failed, falling back to localStorage', error);
       return this.updateLocal(id, updates);
    }

    return data as unknown as FixedAsset;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from(TABLE_NAME as "fixed_assets")
      .delete()
      .eq('id', id);

    if (error) {
      console.warn('Supabase fixed_assets delete failed, falling back to localStorage', error);
      return this.deleteLocal(id);
    }
    return true;
  },

  // LocalStorage Fallback Implementation
  getLocal(): FixedAsset[] {
    const stored = localStorage.getItem('rigel_assets');
    if (!stored) return [];
    const localAssets = JSON.parse(stored);
    // Map local assets (which might be in component format) to DB format if necessary
    // Component: purchase_price -> cost_price
    return localAssets.map((a: { id: string; name: string; category: string | null; purchase_date: string; purchase_price?: number; cost_price?: number; depreciation_rate: number }) => ({
      id: a.id,
      entity_id: 'demo',
      name: a.name,
      category: a.category,
      purchase_date: a.purchase_date,
      cost_price: a.purchase_price || a.cost_price || 0,
      depreciation_rate: a.depreciation_rate,
      accum_depr: 0, // Not tracked in local storage usually
      disposal_date: null,
      selling_price: null
    }));
  },

  createLocal(asset: CreateFixedAsset): FixedAsset {
    const stored = this.getLocal();
    const newAsset = { ...asset, id: crypto.randomUUID(), created_at: new Date().toISOString(), accum_depr: 0 };
    // Map back to component format for storage to keep compatibility? 
    // Or just store our new format. Let's store new format.
    // But wait, if we mix formats, it breaks. 
    // We should migrate localStorage to our format.
    const toStore = {
        ...newAsset,
        purchase_price: newAsset.cost_price // Backward compat
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
    
    // Save with backward compat fields
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
    // Save
    const toStore = filtered.map(a => ({
        ...a,
        purchase_price: a.cost_price
    }));
    localStorage.setItem('rigel_assets', JSON.stringify(toStore));
    return true;
  }
};
