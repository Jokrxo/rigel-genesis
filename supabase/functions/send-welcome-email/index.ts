import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import React from 'npm:react@18.3.1';
import { Resend } from 'npm:resend@4.0.0';
import { renderAsync } from 'npm:@react-email/components@0.0.22';
import { WelcomeEmail } from './_templates/welcome-email.tsx';

const resend = new Resend(Deno.env.get('RESEND_API_KEY') as string);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

interface WelcomeEmailRequest {
  userName: string;
  email: string;
  loginUrl?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userName, email, loginUrl }: WelcomeEmailRequest = await req.json();

    if (!email || !userName) {
      throw new Error('Email and userName are required');
    }

    console.log('Sending welcome email to:', email);

    // Render the React email template to HTML
    const html = await renderAsync(
      React.createElement(WelcomeEmail, {
        userName,
        loginUrl: loginUrl || `${req.headers.get('origin') || 'https://rigel.co.za'}/login`,
      })
    );

    // Send email using Resend
    const emailResponse = await resend.emails.send({
      from: 'Rigel Team <hello@rigel.co.za>',
      to: [email],
      subject: `Welcome to Rigel, ${userName}! 🚀`,
      html,
    });

    if (emailResponse.error) {
      console.error('Resend error:', emailResponse.error);
      throw emailResponse.error;
    }

    console.log('Welcome email sent successfully:', emailResponse);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Welcome email sent successfully',
        emailId: emailResponse.data?.id,
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
    console.error('Error in send-welcome-email function:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to send welcome email',
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
