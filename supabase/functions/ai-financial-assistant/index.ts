
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Basic South African financial knowledge base
const SA_FINANCIAL_DATA = {
  vat_rate: 15,
  company_tax_rate: 27,
  tax_year: "March 1 to February 28",
  vat_threshold: 1000000,
  small_business_threshold: 20000000,
  personal_tax_brackets: [
    { min: 0, max: 237100, rate: 18 },
    { min: 237101, max: 370500, rate: 26 },
    { min: 370501, max: 512800, rate: 31 },
    { min: 512801, max: 673000, rate: 36 },
    { min: 673001, max: 857900, rate: 39 },
    { min: 857901, max: 1817000, rate: 41 },
    { min: 1817001, max: Infinity, rate: 45 }
  ]
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

Application Features You Can Help With:
- Import bank statements (supports all major SA banks: ABSA, FNB, Standard Bank, Nedbank, Capitec)
- Asset management and depreciation tracking
- Document creation (invoices, quotations)
- Tax calculations and planning
- Financial reporting and analysis

Always provide specific, actionable advice relevant to South African regulations. Be conversational but professional. If you need clarification, ask specific questions.`;

// Function to check if question can be answered with local knowledge
const canAnswerLocally = (message: string): string | null => {
  const lowerMessage = message.toLowerCase();
  
  // VAT rate questions
  if (lowerMessage.includes('vat') && (lowerMessage.includes('rate') || lowerMessage.includes('percentage') || lowerMessage.includes('%'))) {
    return `The current VAT rate in South Africa is ${SA_FINANCIAL_DATA.vat_rate}%. This standard rate applies to most goods and services, with some items being zero-rated or exempt.`;
  }
  
  // Company tax rate questions
  if (lowerMessage.includes('company') && lowerMessage.includes('tax') && (lowerMessage.includes('rate') || lowerMessage.includes('%'))) {
    return `The standard company income tax rate in South Africa is ${SA_FINANCIAL_DATA.company_tax_rate}% for companies with taxable income above R100,000. Small Business Corporations may qualify for lower rates.`;
  }
  
  // Tax year questions
  if (lowerMessage.includes('tax year') || (lowerMessage.includes('financial year') && lowerMessage.includes('south africa'))) {
    return `The South African tax year runs from ${SA_FINANCIAL_DATA.tax_year}. This applies to both individuals and companies for tax filing purposes.`;
  }
  
  // VAT registration threshold
  if (lowerMessage.includes('vat') && (lowerMessage.includes('threshold') || lowerMessage.includes('registration'))) {
    return `The VAT registration threshold in South Africa is R${SA_FINANCIAL_DATA.vat_threshold.toLocaleString()} in taxable supplies over a 12-month period. Once you exceed this threshold, you must register for VAT within 21 business days.`;
  }
  
  return null;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, context } = await req.json();

    if (!message) {
      throw new Error('Message is required');
    }

    // First, try to answer with local South African financial knowledge
    const localAnswer = canAnswerLocally(message);
    if (localAnswer) {
      return new Response(
        JSON.stringify({ response: localAnswer }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If we can't answer locally, try OpenAI
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      return new Response(
        JSON.stringify({ 
          response: "I can help with basic South African tax questions like VAT rates (15%), company tax rates (27%), and tax year information. For more complex queries, please ensure the OpenAI API key is configured in the system settings, or contact support at 073 988 2190." 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Enhanced prompt with user context if available
    let enhancedPrompt = SYSTEM_PROMPT;
    if (context) {
      enhancedPrompt += `\n\nUser Context: ${JSON.stringify(context)}`;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: enhancedPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API Error:', error);
      
      // Provide helpful fallback response
      return new Response(
        JSON.stringify({ 
          response: "I'm having trouble accessing advanced AI features right now, but I can still help with basic South African financial questions. For example, the current VAT rate is 15% and company tax rate is 27%. For immediate assistance with complex queries, please contact Luthando at 073 988 2190." 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ response: aiResponse }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in ai-financial-assistant:', error);
    
    // Provide helpful fallback response instead of generic error
    return new Response(
      JSON.stringify({ 
        response: "I can help with basic South African financial questions. The current VAT rate is 15%, company tax rate is 27%, and the tax year runs from March 1 to February 28. For complex queries or if you continue experiencing issues, please contact support at 073 988 2190." 
      }),
      { 
        status: 200, // Changed from 500 to 200 to avoid error display
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
