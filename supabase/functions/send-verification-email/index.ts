import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import React from 'npm:react@18.3.1';
import { Resend } from 'npm:resend@4.0.0';
import { renderAsync } from 'npm:@react-email/components@0.0.22';
import { VerificationEmail } from './_templates/verification-email.tsx';

const resend = new Resend(Deno.env.get('RESEND_API_KEY') as string);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

interface VerificationEmailRequest {
  userName: string;
  email: string;
  verificationUrl: string;
  verificationCode?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      userName,
      email,
      verificationUrl,
      verificationCode,
    }: VerificationEmailRequest = await req.json();

    if (!email || !userName || !verificationUrl) {
      throw new Error('Email, userName, and verificationUrl are required');
    }

    console.log('Sending verification email to:', email);

    // Generate a verification code if not provided
    const code = verificationCode || Math.floor(100000 + Math.random() * 900000).toString();

    // Render the React email template to HTML
    const html = await renderAsync(
      React.createElement(VerificationEmail, {
        userName,
        verificationUrl,
        verificationCode: code,
      })
    );

    // Send email using Resend
    const emailResponse = await resend.emails.send({
      from: 'Rigel Team <hello@rigel.co.za>',
      to: [email],
      subject: 'Verify your Rigel account ✅',
      html,
    });

    if (emailResponse.error) {
      console.error('Resend error:', emailResponse.error);
      throw emailResponse.error;
    }

    console.log('Verification email sent successfully:', emailResponse);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Verification email sent successfully',
        emailId: emailResponse.data?.id,
        verificationCode: code,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error('Error in send-verification-email function:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to send verification email',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
};

serve(handler);
