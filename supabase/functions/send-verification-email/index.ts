import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VerificationEmailRequest {
  userName: string;
  email: string;
  verificationUrl: string;
  verificationCode?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userName, email, verificationUrl, verificationCode }: VerificationEmailRequest = await req.json();

    if (!email || !userName || !verificationUrl) {
      throw new Error('Email, userName, and verificationUrl are required');
    }

    console.log('Sending verification email to:', email);

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not configured');
    }

    const code = verificationCode || Math.floor(100000 + Math.random() * 900000).toString();

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Verify your Rigel account</title>
        </head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #6366f1;">Rigel</h1>
          </div>
          <h2>Hello ${userName},</h2>
          <p>Thank you for signing up for Rigel! Please verify your email address by clicking the button below or using the verification code.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Verify Email</a>
          </div>
          <p style="text-align: center;">Or use this verification code:</p>
          <div style="text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 4px; margin: 20px 0; color: #6366f1;">${code}</div>
          <p style="color: #666; font-size: 14px;">If you didn't create an account with Rigel, you can safely ignore this email.</p>
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
        subject: 'Verify your Rigel account ✅',
        html,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Resend error:', data);
      throw new Error(data.message || 'Failed to send email');
    }

    console.log('Verification email sent successfully:', data);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Verification email sent successfully',
        emailId: data.id,
        verificationCode: code,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  } catch (error: unknown) {
    console.error('Error in send-verification-email function:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send verification email',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
};

serve(handler);
