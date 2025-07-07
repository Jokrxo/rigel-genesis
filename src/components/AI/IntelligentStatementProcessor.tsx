
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, Brain, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Loading } from "@/components/ui/loading";

interface ProcessedTransaction {
  date: string;
  description: string;
  amount: number;
  category: string;
  confidence: number;
  suggestedDeduction: boolean;
}

export const IntelligentStatementProcessor = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedTransactions, setProcessedTransactions] = useState<ProcessedTransaction[]>([]);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setProcessedTransactions([]);
    }
  };

  const processStatement = async () => {
    if (!file) {
      toast({
        title: "No File Selected",
        description: "Please select a bank statement file to process.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const { data, error } = await supabase.functions.invoke('intelligent-statement-processor', {
        body: formData
      });

      if (error) throw error;

      setProcessedTransactions(data.transactions || []);
      toast({
        title: "Statement Processed",
        description: `Successfully processed ${data.transactions?.length || 0} transactions with AI categorization.`,
      });
    } catch (error) {
      console.error('Error processing statement:', error);
      toast({
        title: "Processing Failed",
        description: "Failed to process bank statement. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-financial-600" />
            Intelligent Statement Processing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="financial-label">Bank Statement File</label>
            <Input
              type="file"
              accept=".pdf,.csv,.xlsx,.xls"
              onChange={handleFileChange}
              className="file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-sm file:bg-financial-100 file:text-financial-700"
            />
            <p className="text-xs text-muted-foreground">
              Supports PDF, CSV, and Excel files from major SA banks
            </p>
          </div>

          <Button 
            onClick={processStatement} 
            disabled={isProcessing || !file}
            className="w-full"
          >
            {isProcessing ? (
              <Loading size="sm" text="Processing with AI..." />
            ) : (
              <>
                <Brain className="mr-2 h-4 w-4" />
                Process Statement
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {processedTransactions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              AI-Processed Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {processedTransactions.slice(0, 10).map((transaction, index) => (
                <div key={index} className="border rounded-lg p-3 space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-muted-foreground">{transaction.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">R {Math.abs(transaction.amount).toFixed(2)}</p>
                      <p className={`text-xs ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.amount > 0 ? 'Credit' : 'Debit'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-financial-100 text-financial-700">
                      {transaction.category}
                    </span>
                    <div className="flex items-center gap-2">
                      {transaction.suggestedDeduction && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">
                          Tax Deductible
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {Math.round(transaction.confidence)}% confidence
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {processedTransactions.length > 10 && (
                <p className="text-sm text-muted-foreground text-center">
                  Showing 10 of {processedTransactions.length} transactions
                </p>
              )}
            </div>
            <div className="mt-4 flex gap-2">
              <Button variant="outline" size="sm">
                Review All
              </Button>
              <Button size="sm">
                Import Transactions
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
