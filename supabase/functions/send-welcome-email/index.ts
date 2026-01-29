import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WelcomeEmailRequest {
  userName: string;
  email: string;
  loginUrl?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userName, email, loginUrl }: WelcomeEmailRequest = await req.json();

    if (!email || !userName) {
      throw new Error('Email and userName are required');
    }

    console.log('Sending welcome email to:', email);

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not configured');
    }

    const finalLoginUrl = loginUrl || 'https://rigel.co.za/login';

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Welcome to Rigel</title>
        </head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #6366f1;">Welcome to Rigel!</h1>
          </div>
          <h2>Hello ${userName},</h2>
          <p>Welcome to Rigel – your comprehensive South African financial management solution!</p>
          <p>With Rigel, you can:</p>
          <ul>
            <li>Import and process bank statements from all major SA banks</li>
            <li>Calculate VAT, income tax, and deferred taxes</li>
            <li>Manage assets and track depreciation</li>
            <li>Generate financial reports and statements</li>
            <li>Stay SARS compliant with ease</li>
          </ul>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${finalLoginUrl}" style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Get Started</a>
          </div>
          <p>If you have any questions, our AI assistant is available 24/7, or you can contact Luthando at 073 988 2190.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">© 2024 Rigel. South African Financial Management.</p>
        </body>
      </html>
    `;

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Rigel Team <onboarding@resend.dev>',
        to: [email],
        subject: `Welcome to Rigel, ${userName}! 🚀`,
        html,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Resend error:', data);
      throw new Error(data.message || 'Failed to send email');
    }

    console.log('Welcome email sent successfully:', data);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Welcome email sent successfully',
        emailId: data.id,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  } catch (error: unknown) {
    console.error('Error in send-welcome-email function:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send welcome email',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
};

serve(handler);
