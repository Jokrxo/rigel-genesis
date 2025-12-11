
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { apiFetch } from '@/api/client'
import { CompanyProfile } from "@/components/CompanyProfile/types";
import { useCompanyProfile } from "../hooks/useCompanyProfile";
import { getTransactionTypesForOwnership } from "../hooks/useTransactionTypesForOwnership";
import { TransactionFields } from "./TransactionFields";
import { PartySelectionFields } from "./PartySelectionFields";
import { FormActions } from "./FormActions";

export interface TransactionFormData {
  date: Date;
  amount: number;
  description: string;
  type: string;
  category: string;
  reference?: string;
  party_type?: string;
  party_id?: string;
}

interface TransactionFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function TransactionForm({ open, onClose, onSuccess }: TransactionFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const companyProfile = useCompanyProfile(open);
  const [lockedTransactionTypes, setLockedTransactionTypes] = useState(false);
  
  const form = useForm<TransactionFormData>({
    defaultValues: {
      date: new Date(),
      amount: 0,
      description: "",
      type: "expense",
      category: "",
      reference: "",
      party_type: "internal",
      party_id: "",
    },
  });

  const watchedPartyType = form.watch("party_type");

  useEffect(() => {
    if (open) {
      fetchCustomers();
      fetchSuppliers();
      setLockedTransactionTypes(true);
      if (companyProfile) {
        try {
          const types = getTransactionTypesForOwnership(companyProfile);
          form.setValue("type", types[0]?.value || "income");
        } catch (error) {
          console.error("Error setting transaction types:", error);
        }
      }
    }
  }, [open, companyProfile]);

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase.from("customers").select("id, name, company").order("name");
      if (error) {
        console.error("Error fetching customers:", error);
        return;
      }
      setCustomers(data || []);
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  const fetchSuppliers = async () => {
    try {
      // Mock data for now - replace with actual Supabase query when ready
      setSuppliers([
        { id: "1", name: "ABC Office Supplies", company: "ABC Office Supplies" },
        { id: "2", name: "Tech Solutions Ltd", company: "Tech Solutions Ltd" },
      ]);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
    }
  };

  const onSubmit = async (data: TransactionFormData) => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const payload = {
        entityId: user.id, // temporary: use user id as entity linkage; replace with selected entity
        type: data.type,
        amount: Math.abs(data.amount),
        date: data.date.toISOString(),
        description: data.description,
      };

      const res = await apiFetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const t = await res.json().catch(() => ({}));
        throw new Error(t.error || 'Failed to create transaction');
      }

      const result = await res.json();
      toast({ title: 'Transaction recorded', description: `Journal created: Debit ${result.suggested.debit.name}, Credit ${result.suggested.credit.name}` });
      form.reset();
      onSuccess();
    } catch (error) {
      console.error('Error saving transaction:', error);
      toast({ title: 'Error', description: error instanceof Error ? error.message : 'Failed to record transaction', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Record New Transaction</DialogTitle>
          <DialogDescription>
            Enter transaction details to record income, expenses, or transfers
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <TransactionFields
              form={form}
              lockedTransactionTypes={lockedTransactionTypes}
              companyProfile={companyProfile}
              customers={customers}
              suppliers={suppliers}
              watchedPartyType={watchedPartyType}
            />
            <PartySelectionFields
              form={form}
              customers={customers}
              suppliers={suppliers}
              watchedPartyType={watchedPartyType}
            />
            <FormActions loading={loading} onClose={onClose} />
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
