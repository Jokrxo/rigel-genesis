
import { supabase } from '@/integrations/supabase/client';
import { auditLogger } from './audit-logger';

export interface Budget {
  id: string;
  category: string;
  amount: number;
  spent: number;
  period: string;
  department: string;
  created_at?: string;
  updated_at?: string;
  company_id?: string;
}

const TABLE_NAME = 'budgets';

const getCompanyId = async (userId: string) => {
  const { data } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('user_id', userId)
    .single();
  return data?.company_id;
};

export const budgetApi = {
  async getBudgets(): Promise<Budget[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      
      const companyId = await getCompanyId(user.id);
      if (!companyId) return [];

      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching budgets:', error);
        return [];
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return data.map((b: any) => ({
        id: b.id,
        category: b.category || '',
        amount: Number(b.budgeted_amount || 0),
        spent: Number(b.actual_amount || 0),
        period: b.period_name || '',
        department: b.department || '',
        created_at: b.created_at,
        updated_at: b.updated_at,
        company_id: b.company_id
      }));
    } catch (err) {
      console.error('Unexpected error fetching budgets:', err);
      return [];
    }
  },

  async createBudget(budget: Omit<Budget, 'id' | 'created_at' | 'updated_at' | 'spent'>): Promise<Budget> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const companyId = await getCompanyId(user.id);
    if (!companyId) throw new Error('Company not found');

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert([{
        company_id: companyId,
        category: budget.category,
        department: budget.department,
        period_name: budget.period,
        budgeted_amount: budget.amount,
        actual_amount: 0,
      }])
      .select()
      .single();

    if (error) throw error;

    await auditLogger.log({
      action: 'CREATE_BUDGET',
      entityType: 'budget',
      entityId: data.id,
      details: { category: data.category, period: data.period_name, amount: data.budgeted_amount }
    });

    return {
      id: data.id,
      category: data.category || '',
      amount: Number(data.budgeted_amount || 0),
      spent: Number(data.actual_amount || 0),
      period: data.period_name || '',
      department: data.department || '',
      created_at: data.created_at,
      updated_at: data.updated_at,
      company_id: data.company_id
    };
  },

  async updateBudget(id: string, updates: Partial<Budget>): Promise<Budget> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const companyId = await getCompanyId(user.id);
    if (!companyId) throw new Error('Company not found');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const toUpdate: any = {};
    if (updates.category !== undefined) toUpdate.category = updates.category;
    if (updates.department !== undefined) toUpdate.department = updates.department;
    if (updates.period !== undefined) toUpdate.period_name = updates.period;
    if (updates.amount !== undefined) toUpdate.budgeted_amount = updates.amount;
    if (updates.spent !== undefined) toUpdate.actual_amount = updates.spent;

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update(toUpdate)
      .eq('id', id)
      .eq('company_id', companyId)
      .select()
      .single();

    if (error) throw error;

    await auditLogger.log({
      action: 'UPDATE_BUDGET',
      entityType: 'budget',
      entityId: data.id,
      details: { updates: updates }
    });

    return {
      id: data.id,
      category: data.category || '',
      amount: Number(data.budgeted_amount || 0),
      spent: Number(data.actual_amount || 0),
      period: data.period_name || '',
      department: data.department || '',
      created_at: data.created_at,
      updated_at: data.updated_at,
      company_id: data.company_id
    };
  },

  async deleteBudget(id: string): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const companyId = await getCompanyId(user.id);
    if (!companyId) throw new Error('Company not found');

    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq('id', id)
      .eq('company_id', companyId);

    if (error) throw error;

    await auditLogger.log({
      action: 'DELETE_BUDGET',
      entityType: 'budget',
      entityId: id,
      details: {}
    });

    return true;
  }
};
