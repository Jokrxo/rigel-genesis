import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Transaction {
  date: string;
  description: string;
  amount: number;
  debit?: number;
  credit?: number;
  balance?: number;
  category: string;
  confidence: number;
  suggestedDeduction: boolean;
  reference?: string;
}

interface ProcessedFile {
  fileId: string;
  transactions: Transaction[];
  totalTransactions: number;
  processingErrors: string[];
  validationIssues: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fileId, fileContent, fileType, userId } = await req.json();
    
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`Processing file ${fileId} of type ${fileType} for user ${userId}`);

    // Enhanced system prompt for comprehensive financial analysis
    const systemPrompt = `You are an expert South African financial AI that processes bank statements and performs comprehensive financial analysis. 

CONTEXT:
- VAT rate: 15%
- Common SA business categories: Office Rent, Fuel, Travel, Stationery, Marketing, Professional Fees, Bank Charges, Utilities
- Focus on accuracy and detailed categorization

TASK: Process the bank statement and return structured JSON with:

1. TRANSACTION PARSING - Extract each transaction with:
   - date (YYYY-MM-DD format)
   - description (cleaned, normalized)
   - amount (negative for debits, positive for credits)
   - debit/credit amounts (if available separately)
   - balance (running balance if available)
   - reference (transaction reference if available)
   - category (specific business category)
   - confidence (0-100 based on OCR/parsing quality)
   - suggestedDeduction (true/false for SA tax purposes)

2. DATA VALIDATION - Check for:
   - Balance consistency (opening + transactions = closing)
   - Duplicate transactions
   - Missing or malformed data
   - OCR errors

3. FINANCIAL CATEGORIZATION:
   Business Categories: Office Rent, Utilities, Fuel, Travel, Marketing, Professional Fees, Bank Charges, Insurance, Salaries, Stationery, Equipment, Software, Maintenance
   Personal Categories: Personal Withdrawal, Transfer, Investment, Other

Return JSON format:
{
  "transactions": [Transaction[]],
  "summary": {
    "totalTransactions": number,
    "totalDebits": number,
    "totalCredits": number,
    "openingBalance": number,
    "closingBalance": number,
    "period": { "from": "YYYY-MM-DD", "to": "YYYY-MM-DD" }
  },
  "validationIssues": [string[]],
  "processingNotes": string
}`;

    // Process with OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-2025-08-07',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Process this ${fileType} bank statement data: ${fileContent}` }
        ],
        max_completion_tokens: 4000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    let processedData;
    
    try {
      processedData = JSON.parse(data.choices[0].message.content);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      throw new Error('Failed to parse financial data from AI response');
    }

    console.log(`Parsed ${processedData.transactions?.length || 0} transactions`);

    // Store transactions in database
    const transactionsToInsert = processedData.transactions.map((t: Transaction) => ({
      user_id: userId,
      file_id: fileId,
      date: t.date,
      description: t.description,
      original_description: t.description,
      normalized_description: t.description,
      amount: t.amount,
      debit: t.debit || (t.amount < 0 ? Math.abs(t.amount) : null),
      credit: t.credit || (t.amount > 0 ? t.amount : null),
      balance: t.balance,
      reference_number: t.reference,
      category: t.category,
      confidence_score: t.confidence,
      metadata: {
        suggestedDeduction: t.suggestedDeduction,
        aiProcessed: true,
        model: 'gpt-5-2025-08-07'
      }
    }));

    const { error: transactionError } = await supabase
      .from('transactions')
      .insert(transactionsToInsert);

    if (transactionError) {
      console.error('Error inserting transactions:', transactionError);
      throw new Error('Failed to store transactions');
    }

    // Store ML tags for categorization
    const mlTags = processedData.transactions.flatMap((t: Transaction, index: number) => [
      {
        transaction_id: transactionsToInsert[index].id,
        tag_type: 'category',
        tag_value: t.category,
        confidence_score: t.confidence,
        model_version: 'gpt-5-2025-08-07'
      },
      {
        transaction_id: transactionsToInsert[index].id,
        tag_type: 'tax_deductible',
        tag_value: t.suggestedDeduction.toString(),
        confidence_score: t.confidence,
        model_version: 'gpt-5-2025-08-07'
      }
    ]);

    // Store validation issues
    if (processedData.validationIssues?.length > 0) {
      const dataIssues = processedData.validationIssues.map((issue: string) => ({
        user_id: userId,
        file_id: fileId,
        issue_type: 'validation_error',
        issue_description: issue,
        severity: 'medium'
      }));

      await supabase.from('data_issues').insert(dataIssues);
    }

    // Update file processing status
    await supabase
      .from('files')
      .update({
        processing_status: 'completed',
        processing_metadata: {
          totalTransactions: processedData.transactions.length,
          summary: processedData.summary,
          processingNotes: processedData.processingNotes,
          processedAt: new Date().toISOString()
        }
      })
      .eq('id', fileId);

    // Generate financial statements
    await generateFinancialStatements(supabase, userId, fileId, processedData);

    return new Response(
      JSON.stringify({
        success: true,
        fileId,
        transactionsProcessed: processedData.transactions.length,
        summary: processedData.summary,
        validationIssues: processedData.validationIssues || []
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in financial-analysis-engine:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function generateFinancialStatements(supabase: any, userId: string, fileId: string, processedData: any) {
  try {
    const transactions = processedData.transactions;
    const summary = processedData.summary;
    
    // Generate Income Statement
    const incomeStatement = {
      revenue: transactions
        .filter((t: Transaction) => t.amount > 0 && ['Sales', 'Revenue', 'Income'].includes(t.category))
        .reduce((sum: number, t: Transaction) => sum + t.amount, 0),
      expenses: {
        operatingExpenses: transactions
          .filter((t: Transaction) => t.amount < 0 && !['Bank Charges', 'Interest'].includes(t.category))
          .reduce((acc: any, t: Transaction) => {
            if (!acc[t.category]) acc[t.category] = 0;
            acc[t.category] += Math.abs(t.amount);
            return acc;
          }, {}),
        bankCharges: transactions
          .filter((t: Transaction) => t.category === 'Bank Charges')
          .reduce((sum: number, t: Transaction) => sum + Math.abs(t.amount), 0),
        interest: transactions
          .filter((t: Transaction) => t.category === 'Interest')
          .reduce((sum: number, t: Transaction) => sum + Math.abs(t.amount), 0)
      },
      netIncome: summary.totalCredits + summary.totalDebits
    };

    // Generate Cash Flow Statement
    const cashFlowStatement = {
      operatingActivities: {
        netIncome: incomeStatement.netIncome,
        adjustments: transactions
          .filter((t: Transaction) => ['Depreciation', 'Amortization'].includes(t.category))
          .reduce((sum: number, t: Transaction) => sum + Math.abs(t.amount), 0),
        workingCapitalChanges: 0 // Would need more sophisticated analysis
      },
      investingActivities: transactions
        .filter((t: Transaction) => ['Equipment', 'Investment'].includes(t.category))
        .reduce((sum: number, t: Transaction) => sum + t.amount, 0),
      financingActivities: transactions
        .filter((t: Transaction) => ['Loan', 'Capital'].includes(t.category))
        .reduce((sum: number, t: Transaction) => sum + t.amount, 0)
    };

    // Calculate financial ratios
    const ratios = {
      cashRatio: summary.closingBalance / (summary.totalDebits || 1),
      expenseRatio: Math.abs(summary.totalDebits) / (summary.totalCredits || 1),
      netCashFlow: summary.closingBalance - summary.openingBalance
    };

    // Store financial statements
    const statements = [
      {
        user_id: userId,
        file_id: fileId,
        statement_type: 'income_statement',
        period_start: summary.period.from,
        period_end: summary.period.to,
        statement_data: incomeStatement,
        ratios
      },
      {
        user_id: userId,
        file_id: fileId,
        statement_type: 'cash_flow',
        period_start: summary.period.from,
        period_end: summary.period.to,
        statement_data: cashFlowStatement,
        ratios
      }
    ];

    await supabase.from('financial_statements').insert(statements);
    
  } catch (error) {
    console.error('Error generating financial statements:', error);
  }
}