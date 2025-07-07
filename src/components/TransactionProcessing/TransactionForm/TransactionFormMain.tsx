import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
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
        // Get transaction types per ownership type and set default type
        const types = getTransactionTypesForOwnership(companyProfile);
        form.setValue("type", types[0]?.value || "income");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, companyProfile]);

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase.from("customers").select("id, name, company").order("name");
      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  const fetchSuppliers = async () => {
    setSuppliers([
      { id: "1", name: "ABC Office Supplies", company: "ABC Office Supplies" },
      { id: "2", name: "Tech Solutions Ltd", company: "Tech Solutions Ltd" },
    ]);
  };

  const onSubmit = async (data: TransactionFormData) => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Create a mock statement first
      const { data: statement, error: statementError } = await supabase
        .from("bank_statements")
        .insert([
          {
            user_id: user.id,
            bank_id: "manual",
            file_url: "manual-entry",
            file_type: "manual",
            processing_status: "completed",
            result_json: { manual_entry: true },
          }
        ])
        .select()
        .single();
      if (statementError) throw statementError;

      const { error } = await supabase.from("transactions").insert([
        {
          statement_id: statement.id,
          user_id: user.id,
          date: data.date.toISOString().split("T")[0],
          amount: data.type === "expense" ? -Math.abs(data.amount) : Math.abs(data.amount),
          description: data.description,
          type: data.type,
          category: data.category,
          metadata: {
            reference: data.reference,
            party_type: data.party_type,
            party_id: data.party_id,
            manual_entry: true,
          },
        },
      ]);
      if (error) throw error;
      toast({ title: "Success", description: "Transaction recorded successfully" });
      onSuccess();
    } catch (error) {
      console.error("Error saving transaction:", error);
      toast({
        title: "Error",
        description: "Failed to record transaction",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
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
