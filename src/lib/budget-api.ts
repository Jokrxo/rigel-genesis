
import { v4 as uuidv4 } from 'uuid';

export interface Budget {
  id: string;
  category: string;
  amount: number;
  spent: number;
  period: string;
  department: string;
  created_at?: string;
  updated_at?: string;
}

const STORAGE_KEY = 'rigel_budgets';

export const budgetApi = {
  async getBudgets(): Promise<Budget[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
        // Return default demo data if nothing stored
        const defaultBudgets: Budget[] = [
            { id: '1', category: 'Marketing', amount: 50000, spent: 45000, period: '2024-Q1', department: 'Sales', created_at: new Date().toISOString() },
            { id: '2', category: 'Software Subscriptions', amount: 15000, spent: 12000, period: '2024-Q1', department: 'IT', created_at: new Date().toISOString() },
            { id: '3', category: 'Office Supplies', amount: 5000, spent: 2000, period: '2024-Q1', department: 'Admin', created_at: new Date().toISOString() },
            { id: '4', category: 'Travel', amount: 20000, spent: 25000, period: '2024-Q1', department: 'Operations', created_at: new Date().toISOString() },
            { id: '5', category: 'Salaries', amount: 500000, spent: 480000, period: '2024-Q1', department: 'HR', created_at: new Date().toISOString() },
        ];
        // Initialize storage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultBudgets));
        return defaultBudgets;
    }
    return JSON.parse(stored);
  },

  async createBudget(budget: Omit<Budget, 'id' | 'created_at' | 'updated_at' | 'spent'>): Promise<Budget> {
    const budgets = await this.getBudgets();
    
    const newBudget: Budget = {
      ...budget,
      id: uuidv4(),
      spent: 0, // Initial spent is 0
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    budgets.push(newBudget);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(budgets));
    return newBudget;
  },

  async updateBudget(id: string, updates: Partial<Budget>): Promise<Budget> {
    const budgets = await this.getBudgets();
    const index = budgets.findIndex(b => b.id === id);
    
    if (index === -1) throw new Error('Budget not found');
    
    const updated = { ...budgets[index], ...updates, updated_at: new Date().toISOString() };
    budgets[index] = updated;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(budgets));
    return updated;
  },

  async deleteBudget(id: string): Promise<boolean> {
    const budgets = await this.getBudgets();
    const filtered = budgets.filter(b => b.id !== id);
    
    if (budgets.length === filtered.length) return false;
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  }
};
