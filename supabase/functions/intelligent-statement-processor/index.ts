
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      throw new Error('No file provided');
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Read file content (simplified - in production would handle different formats)
    const fileContent = await file.text();
    
    const systemPrompt = `You are an expert South African financial AI that processes bank statements. Analyze the provided bank statement data and categorize each transaction with the following:

1. Transaction category (Office Expenses, Travel, Fuel, Marketing, etc.)
2. Tax deductibility for SA businesses (true/false)
3. Confidence level (0-100%)
4. Clean description

South African Business Context:
- VAT rate: 15%
- Common business expense categories: Office Rent, Fuel, Travel, Stationery, Marketing, Professional Fees
- Travel allowances, office expenses, and business meals are typically deductible
- Personal expenses are not deductible

Return a JSON object with:
{
  "transactions": [
    {
      "date": "YYYY-MM-DD",
      "description": "cleaned description",
      "amount": number,
      "category": "category name",
      "confidence": 85,
      "suggestedDeduction": true/false
    }
  ]
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Process this bank statement data: ${fileContent.substring(0, 8000)}` }
        ],
        temperature: 0.1,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to process statement');
    }

    const data = await response.json();
    let processedData;
    
    try {
      processedData = JSON.parse(data.choices[0].message.content);
    } catch {
      // Fallback if AI doesn't return valid JSON
      processedData = {
        transactions: [
          {
            date: new Date().toISOString().split('T')[0],
            description: "Sample transaction - processing failed",
            amount: -100.00,
            category: "Other",
            confidence: 50,
            suggestedDeduction: false
          }
        ]
      };
    }

    return new Response(
      JSON.stringify(processedData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in intelligent-statement-processor:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
