import { apiFetch } from "@/api/client";

export interface TrialBalanceRow {
  code: string;
  name: string;
  type: string;
  debit: number;
  credit: number;
}

export interface TrialBalanceData {
  accountsCount?: number;
  rows: TrialBalanceRow[];
  totals: { debit: number; credit: number };
}

export const trialBalanceApi = {
  async get(entityId: string): Promise<TrialBalanceData> {
    const res = await apiFetch(`/api/trial-balance?entityId=${encodeURIComponent(entityId)}`);
    if (!res.ok) {
      const t = await res.json().catch(() => ({}));
      throw new Error(t.error || "Failed to load trial balance");
    }
    return res.json();
  },
  async exportPdf(entityId: string): Promise<Blob> {
    const res = await apiFetch(`/api/reports/trial-balance?entityId=${encodeURIComponent(entityId)}`);
    if (!res.ok) throw new Error("Failed to export trial balance");
    return res.blob();
  },
};
