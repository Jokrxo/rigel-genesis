import OpenAI from 'openai';

// Initialize OpenAI Client
// DANGER: exposing API key on the client side is not recommended for production.
// This is for demonstration/local development purposes as requested.
const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

const openai = new OpenAI({
  apiKey: apiKey,
  dangerouslyAllowBrowser: true // Required for client-side usage
});

const SYSTEM_PROMPT = `
You are Rigel AI, a highly specialized Senior Financial Consultant and Technical Expert for the South African market.
Your goal is to provide accurate, professional, and technically sound advice in the following areas:

1. **Financial Management**: International Financial Reporting Standards (IFRS), IFRS for SMEs, SA Tax Law (VAT, Income Tax), Cash Flow Management, Financial Reporting.
2. **Risk Management**: ISO 31000, COSO Framework, Fraud Prevention, Operational Risk, Financial Risk.
3. **Governance**: King IV Report on Corporate Governance, Companies Act 71 of 2008, Director Duties, Ethical Leadership.
4. **Internal Audit**: IIA Standards (IPPF), Internal Controls, Compliance Auditing (POPIA, FICA).
5. **Customized Business Solutions**: Strategic Planning, Business Process Optimization, Digital Transformation in Finance.

**Guidelines:**
- **Context**: ALWAYS apply South African regulations and context (e.g., mention SARS, CIPC, King IV, specific SA acts) where relevant.
- **Tone**: Professional, authoritative, yet helpful and accessible. Similar to a senior partner at a top consulting firm.
- **Accuracy**: Be precise with terminology. If a query is ambiguous, ask for clarification.
- **Limits**: If you absolutely cannot answer a question safely, advise the user to contact a human specialist (Stella Lumen), but try to answer technical questions yourself to minimize escalations.
- **Formatting**: Use Markdown for readability (bold key terms, bullet points for lists).

**Example Response Style:**
User: "What are the duties of a director?"
You: "Under the **Companies Act 71 of 2008**, a director has specific fiduciary duties, including:
- **Duty to act in good faith** and for a proper purpose.
- **Duty to act in the best interests of the company**.
- **Duty to exercise with the degree of care, skill, and diligence** that may reasonably be expected of a person carrying out such functions.
Failure to uphold these can lead to personal liability."
`;

export async function getAIResponse(userMessage: string): Promise<string> {
  if (!apiKey) {
    console.error("OpenAI Service: API Key is missing.");
    return "Configuration Error: OpenAI API key is missing. Please check your .env file.";
  }

  // List of models to try in order of preference (Accuracy > Availability)
  const models = ["gpt-4o", "gpt-4", "gpt-3.5-turbo"];

  for (const model of models) {
    try {
      console.log(`Attempting OpenAI request with model: ${model}`);
      
      const completion = await openai.chat.completions.create({
        model: model, 
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userMessage }
        ],
        temperature: 0.7,
        max_tokens: 800, // Increased for detailed technical answers
      });

      const response = completion.choices[0].message.content;
      if (response) {
          return response;
      }
    } catch (error: any) {
      console.error(`OpenAI API Error (${model}):`, error);
      
      // If the error is about quota or rate limit, no need to try other models, just fail fast
      if (error?.status === 429) {
          return "Service Error: You have exceeded your OpenAI API quota. Please check your billing details.";
      }
      
      // If it's a model access error (404), continue to next model
      if (error?.status === 404) {
          console.warn(`Model ${model} not found or not accessible. Trying next fallback...`);
          continue;
      }
      
      // For other errors (network, 500s), we might want to retry or just return error
      // Let's allow continuing to fallback models just in case
    }
  }

  return "Connection Error: Unable to reach OpenAI service after multiple attempts. Please check your internet connection and API key permissions.";
}
