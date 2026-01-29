import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const SYSTEM_PROMPT = `You are Rigel AI, an expert South African financial and accounting assistant. Answer questions DIRECTLY and ACCURATELY.

CRITICAL INSTRUCTION: When answering questions about acronyms or definitions, provide the EXACT answer first, then add context.

KEY DEFINITIONS:
- VAT = Value-Added Tax (South Africa rate: 15%)
- PAYE = Pay As You Earn (employee income tax)
- SARS = South African Revenue Service
- UIF = Unemployment Insurance Fund (contribution: 1% employee + 1% employer)
- SDL = Skills Development Levy (1% of payroll)
- CIT = Company Income Tax (27% for companies)
- CGT = Capital Gains Tax
- ETI = Employment Tax Incentive
- IRP5 = Employee Tax Certificate
- IT14 = Company Income Tax Return
- EMP201 = Monthly Employer Declaration
- EMP501 = Annual Employer Reconciliation

SOUTH AFRICAN TAX RATES (2024/2025):
- VAT: 15% (registration threshold: R1 million turnover)
- Company Tax: 27%
- Small Business Corporation: 0% on first R95,750; 7% on R95,751-R365,000; 21% on R365,001-R550,000; 27% above
- Dividends Tax: 20%

Personal Income Tax Brackets (2024/2025):
- R0 - R237,100: 18%
- R237,101 - R370,500: 26%
- R370,501 - R512,800: 31%
- R512,801 - R673,000: 36%
- R673,001 - R857,900: 39%
- R857,901 - R1,817,000: 41%
- Above R1,817,000: 45%

Tax Year: March 1 to February 28/29

RESPONSE FORMAT:
1. Answer the question DIRECTLY first (e.g., "VAT stands for Value-Added Tax")
2. Provide the relevant rate or figure
3. Add brief context if helpful

Be concise, accurate, and professional.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, context } = await req.json();

    if (!message) {
      throw new Error('Message is required');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      return new Response(
        JSON.stringify({ 
          response: "I'm temporarily unavailable. Please try again in a moment or contact support at 073 988 2190." 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Enhanced prompt with user context if available
    let enhancedPrompt = SYSTEM_PROMPT;
    if (context) {
      enhancedPrompt += `\n\nUser Context: ${JSON.stringify(context)}`;
    }

    console.log('Sending request to Lovable AI Gateway...');
    
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: enhancedPrompt },
          { role: 'user', content: message }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ 
            response: "I'm receiving too many requests right now. Please wait a moment and try again." 
          }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ 
            response: "The AI service needs additional credits. Please contact support." 
          }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    console.log('Successfully received AI response');

    return new Response(
      JSON.stringify({ response: aiResponse }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in ai-financial-assistant:', error);
    
    return new Response(
      JSON.stringify({ 
        response: "I'm having trouble connecting right now. For immediate assistance, please contact Luthando at 073 988 2190. In the meantime, here are some quick facts: VAT rate is 15%, company tax rate is 27%, and the tax year runs from March 1 to February 28." 
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
