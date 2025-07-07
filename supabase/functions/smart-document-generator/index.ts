
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
    const { description, documentType, companyInfo } = await req.json();

    if (!description || !documentType) {
      throw new Error('Description and document type are required');
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const systemPrompt = `You are an expert document generator for South African businesses. Generate professional ${documentType} content based on the user's description.

Guidelines:
- Use proper South African business formatting
- Include VAT calculations (15%) where applicable
- Use South African Rand (R) currency
- Follow SARS requirements for invoices
- Be professional and detailed
- Include all necessary legal disclaimers

Company Information: ${JSON.stringify(companyInfo || {})}

Return the response as a JSON object with these fields:
- title: Document title
- content: Main document content in HTML format
- metadata: Additional document information (due dates, terms, etc.)
- lineItems: Array of line items if applicable (description, quantity, rate, amount)
- totals: Financial totals (subtotal, vat, total)`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Generate a ${documentType} for: ${description}` }
        ],
        temperature: 0.3,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to generate document');
    }

    const data = await response.json();
    let generatedContent;
    
    try {
      generatedContent = JSON.parse(data.choices[0].message.content);
    } catch {
      // Fallback if AI doesn't return valid JSON
      generatedContent = {
        title: `Generated ${documentType}`,
        content: data.choices[0].message.content,
        metadata: {},
        lineItems: [],
        totals: {}
      };
    }

    return new Response(
      JSON.stringify(generatedContent),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in smart-document-generator:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
