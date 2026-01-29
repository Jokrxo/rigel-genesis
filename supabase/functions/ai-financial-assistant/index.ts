import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const SYSTEM_PROMPT = `You are Rigel AI, an expert South African financial assistant integrated into the Rigel financial management application. You have deep knowledge of:

- South African tax laws and SARS regulations
- VAT calculations (15% standard rate)
- Company Income Tax (27% for companies)
- Personal Income Tax brackets and rates
- Asset depreciation according to IAS16 standards
- Financial statement preparation
- Bank statement processing and categorization
- Invoice and quotation creation
- Deferred tax calculations

Key South African Financial Context:
- Tax year runs from March 1 to February 28
- VAT registration threshold: R1 million turnover
- Small Business Corporation tax rates apply for qualifying businesses
- Common deductions: office expenses, travel, depreciation, bad debts

Personal Income Tax Brackets (2024/2025):
- R0 - R237,100: 18%
- R237,101 - R370,500: 26%
- R370,501 - R512,800: 31%
- R512,801 - R673,000: 36%
- R673,001 - R857,900: 39%
- R857,901 - R1,817,000: 41%
- Above R1,817,000: 45%

Application Features You Can Help With:
- Import bank statements (supports all major SA banks: ABSA, FNB, Standard Bank, Nedbank, Capitec)
- Asset management and depreciation tracking
- Document creation (invoices, quotations)
- Tax calculations and planning
- Financial reporting and analysis
- Trial balance preparation
- Deferred tax calculations

Always provide specific, actionable advice relevant to South African regulations. Be conversational but professional. If you need clarification, ask specific questions.`;

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
