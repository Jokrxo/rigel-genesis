
import { useEffect, useState } from "react";
import { MainLayout } from "@/components/Layout/MainLayout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { TransactionSummaryCards } from "@/components/TransactionProcessing/TransactionSummaryCards";
import { TransactionsTable } from "@/components/TransactionProcessing/TransactionsTable";
import { TransactionForm } from "@/components/TransactionProcessing/TransactionForm";
import { TransactionSearchBar } from "@/components/TransactionProcessing/TransactionSearchBar";
import { TransactionProcessingErrorBoundary } from "@/components/TransactionProcessing/TransactionProcessingErrorBoundary";
import { Chatbot } from "@/components/Shared/Chatbot";

interface Transaction {
  id: string;
  statement_id: string;
  user_id: string;
  date: string | null;
  amount: number | null;
  description: string | null;
  type: string | null;
  category: string | null;
  metadata?: any;
}

const TransactionProcessing = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Fetch transactions error:', error);
        throw error;
      }
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast({
        title: "Error",
        description: "Failed to fetch transactions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    fetchTransactions();
  };

  const filteredTransactions = transactions.filter(transaction =>
    transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);

  const netPosition = totalIncome - totalExpenses;

  return (
    <MainLayout>
      <TransactionProcessingErrorBoundary>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Transaction Processing</h1>
              <p className="text-muted-foreground">Record and manage all financial transactions</p>
            </div>
            <Button onClick={() => setIsFormOpen(true)}>
              New Transaction
            </Button>
          </div>

          <TransactionSummaryCards
            totalIncome={totalIncome}
            totalExpenses={totalExpenses}
            netPosition={netPosition}
            totalCount={transactions.length}
          />

          <div className="flex items-center gap-4">
            <TransactionSearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          </div>

          <TransactionsTable transactions={filteredTransactions} loading={loading} />

          <TransactionForm
            open={isFormOpen}
            onClose={() => setIsFormOpen(false)}
            onSuccess={handleFormSuccess}
          />
        </div>
      </TransactionProcessingErrorBoundary>
      <Chatbot />
    </MainLayout>
  );
};

export default TransactionProcessing;
