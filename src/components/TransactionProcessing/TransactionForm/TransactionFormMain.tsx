
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { transactionsApi } from "@/lib/transactions-api";
import { CompanyProfile } from "@/components/CompanyProfile/types";
import { useCompanyProfile } from "../hooks/useCompanyProfile";
import { getTransactionTypesForOwnership } from "../hooks/useTransactionTypesForOwnership";
import { TransactionFields } from "./TransactionFields";
import { PartySelectionFields } from "./PartySelectionFields";
import { FormActions } from "./FormActions";

const transactionSchema = z.object({
  date: z.date({ required_error: "Date is required" }),
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  description: z.string().min(1, "Description is required"),
  type: z.string().min(1, "Type is required"),
  category: z.string().min(1, "Category is required"),
  reference: z.string().optional(),
  party_type: z.string().optional(),
  party_id: z.string().optional(),
});

export type TransactionFormValues = z.infer<typeof transactionSchema>;

interface TransactionFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function TransactionForm({ open, onClose, onSuccess }: TransactionFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<{ id: string; name: string; company: string }[]>([]);
  const [suppliers, setSuppliers] = useState<{ id: string; name: string; company: string }[]>([]);
  const companyProfile = useCompanyProfile(open);
  const [lockedTransactionTypes, setLockedTransactionTypes] = useState<string[]>([]);
  
  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
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
      setLockedTransactionTypes(["locked"]);
      if (companyProfile) {
        try {
          const types = getTransactionTypesForOwnership(companyProfile);
          form.setValue("type", types[0]?.value || "income");
        } catch (error) {
          console.error("Error setting transaction types:", error);
        }
      }
    }
  }, [open, companyProfile, form]);

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase.from("customers").select("id, name, company").order("name");
      if (error) {
        console.error("Error fetching customers:", error);
        return;
      }
      setCustomers((data || []).map(c => ({ id: c.id, name: c.name, company: c.company || '' })));
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

  const onSubmit = async (data: TransactionFormValues) => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any).rpc('create_transaction_v2', {
        p_user_id: user.id,
        p_date: data.date,
        p_amount: Math.abs(data.amount),
        p_description: data.description,
        p_type: data.type,
        p_category: data.category,
        p_vat_inclusive: true
      });

      if (error) throw error;

      toast({ title: 'Transaction recorded', description: 'Transaction and journal entries created successfully' });
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
