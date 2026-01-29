import { apiFetch } from "@/api/client";

export interface TaxSummary {
  vatRate: number;
  vatDue: number;
  revenue: number;
  expenses: number;
  depreciationExpense: number;
  taxableIncome: number;
  corpTax: number;
}

export const taxApi = {
  async getSummary(entityId?: string): Promise<TaxSummary> {
    const path = entityId
      ? `/api/tax/report?entityId=${encodeURIComponent(entityId)}`
      : "/api/tax/report";
    const res = await apiFetch(path);
    if (!res.ok) {
      const t = await res.json().catch(() => ({}));
      throw new Error(t.error || "Failed to load tax summary");
    }
    return res.json();
  },
};
