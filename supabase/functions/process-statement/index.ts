
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple mock processing function for statements
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { statement_id, user_id } = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`Processing statement ${statement_id} for user ${user_id}`);

    // Update the statement status to processing
    await supabase
      .from('bank_statements')
      .update({ processing_status: 'processing' })
      .eq('id', statement_id);

    // Create some mock transactions for demo purposes
    const mockTransactions = [
      {
        statement_id: statement_id,
        user_id: user_id,
        date: '2024-01-15',
        description: 'Office Rent Payment',
        amount: -5000,
        debit: 5000,
        credit: null,
        balance: 45000,
        category: 'Office Rent',
        reference_number: 'REF001',
        type: 'debit',
        currency: 'ZAR'
      },
      {
        statement_id: statement_id,
        user_id: user_id,
        date: '2024-01-16',
        description: 'Client Payment Received',
        amount: 15000,
        debit: null,
        credit: 15000,
        balance: 60000,
        category: 'Revenue',
        reference_number: 'REF002',
        type: 'credit',
        currency: 'ZAR'
      },
      {
        statement_id: statement_id,
        user_id: user_id,
        date: '2024-01-17',
        description: 'Fuel Expense',
        amount: -800,
        debit: 800,
        credit: null,
        balance: 59200,
        category: 'Travel',
        reference_number: 'REF003',
        type: 'debit',
        currency: 'ZAR'
      }
    ];

    // Insert mock transactions
    const { error: transactionError } = await supabase
      .from('transactions')
      .insert(mockTransactions);

    if (transactionError) {
      console.error('Error inserting transactions:', transactionError);
      throw new Error('Failed to create transactions');
    }

    // Update statement status to completed
    await supabase
      .from('bank_statements')
      .update({ 
        processing_status: 'completed',
        result_json: {
          totalTransactions: mockTransactions.length,
          processedAt: new Date().toISOString()
        }
      })
      .eq('id', statement_id);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Statement processed successfully',
        transactionsCreated: mockTransactions.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in process-statement:', error);
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
