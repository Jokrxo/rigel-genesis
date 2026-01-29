
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
    const { timeframe, analysisType } = await req.json();

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const systemPrompt = `You are an expert South African financial analyst AI. Generate realistic financial predictions and risk assessments for a small to medium business.

Context:
- South African business environment
- Current economic conditions
- VAT implications (15%)
- SARS compliance requirements
- Seasonal business patterns

Generate predictions for:
1. Cash flow (next 3 months)
2. Revenue trends
3. Expense patterns
4. Tax liability estimates

Also identify potential risks and provide actionable recommendations.

Return JSON format:
{
  "predictions": [
    {
      "metric": "Cash Flow",
      "currentValue": 50000,
      "predictedValue": 55000,
      "change": 10.0,
      "confidence": 85,
      "timeframe": "Next Quarter"
    }
  ],
  "riskAlerts": [
    {
      "type": "warning",
      "title": "Cash Flow Risk",
      "description": "Potential cash flow shortage in Q2",
      "recommendation": "Consider early invoice collection or credit facility"
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
          { role: 'user', content: `Generate ${timeframe} financial predictions and risk analysis for ${analysisType}` }
        ],
        temperature: 0.3,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to generate predictions');
    }

    const data = await response.json();
    let analyticsData;
    
    try {
      analyticsData = JSON.parse(data.choices[0].message.content);
    } catch {
      // Fallback data
      analyticsData = {
        predictions: [
          {
            metric: "Cash Flow",
            currentValue: 45000,
            predictedValue: 52000,
            change: 15.6,
            confidence: 78,
            timeframe: "Next Quarter"
          },
          {
            metric: "Monthly Revenue",
            currentValue: 85000,
            predictedValue: 91000,
            change: 7.1,
            confidence: 82,
            timeframe: "Next 3 Months"
          }
        ],
        riskAlerts: [
          {
            type: "warning",
            title: "Seasonal Revenue Dip",
            description: "Historical data suggests 15% revenue decrease in Q2",
            recommendation: "Plan marketing campaigns and consider diversifying income streams"
          }
        ]
      };
    }

    return new Response(
      JSON.stringify(analyticsData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in predictive-analytics:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
