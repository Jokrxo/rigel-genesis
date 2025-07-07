
/**
 * Edge Function: process-statement
 * This is a stub processor. In production, connect to your model/endpoint here.
 * Receives: { statement_id, user_id }
 * Updates processing_status/result_json in bank_statements, inserts sample transactions.
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const SUPABASE_URL = "https://upmlbzaskdloikeqgtzz.supabase.co";
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req) => {
  try {
    const { statement_id, user_id } = await req.json();
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Simulate ML extraction: Insert dummy transactions & update status
    await supabase
      .from("transactions")
      .insert([
        {
          statement_id,
          user_id,
          date: new Date().toISOString().substring(0, 10),
          description: "ML-generated Rent Payment",
          amount: 8000,
          type: "debit",
          category: "Rent",
          metadata: { ml: true },
        },
        {
          statement_id,
          user_id,
          date: new Date().toISOString().substring(0, 10),
          description: "ML-generated Salary",
          amount: 15000,
          type: "credit",
          category: "Income",
          metadata: { ml: true },
        },
      ]);
    await supabase
      .from("bank_statements")
      .update({
        processing_status: "completed",
        result_json: { status: "ok", processed_by_ml: true },
      })
      .eq("id", statement_id);
    return new Response(JSON.stringify({ success: true }));
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error?.message }), { status: 500 });
  }
});
