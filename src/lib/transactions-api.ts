import { apiFetch } from "@/api/client";

export interface TransactionPayload {
  entityId: string;
  type: string;
  amount: number;
  date: string;
  description: string;
  category: string;
  reference_number?: string;
  metadata?: Record<string, any>;
}

export interface SuggestedEntry {
  name: string;
}

export interface TransactionResponse {
  transaction: { id: string };
  suggested: { debit: SuggestedEntry; credit: SuggestedEntry };
  journal: { id: string };
}

export const transactionsApi = {
  async create(payload: TransactionPayload): Promise<TransactionResponse> {
    const res = await apiFetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const t = await res.json().catch(() => ({}));
      throw new Error(t.error || "Failed to create transaction");
    }
    return res.json();
  },
};
