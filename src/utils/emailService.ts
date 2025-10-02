/**
 * Email service utilities for sending transactional emails
 */

import { supabase } from "@/integrations/supabase/client";

interface SendWelcomeEmailParams {
  userName: string;
  email: string;
  loginUrl?: string;
}

interface SendVerificationEmailParams {
  userName: string;
  email: string;
  verificationUrl: string;
  verificationCode?: string;
}

/**
 * Sends a welcome email to a new user
 */
export async function sendWelcomeEmail({
  userName,
  email,
  loginUrl,
}: SendWelcomeEmailParams): Promise<{ success: boolean; error?: string }> {
  try {
    const { data, error } = await supabase.functions.invoke('send-welcome-email', {
      body: {
        userName,
        email,
        loginUrl: loginUrl || `${window.location.origin}/login`,
      },
    });

    if (error) {
      console.error('Error sending welcome email:', error);
      return { success: false, error: error.message };
    }

    console.log('Welcome email sent:', data);
    return { success: true };
  } catch (error: any) {
    console.error('Exception sending welcome email:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Sends a verification email to a user
 */
export async function sendVerificationEmail({
  userName,
  email,
  verificationUrl,
  verificationCode,
}: SendVerificationEmailParams): Promise<{ success: boolean; error?: string; code?: string }> {
  try {
    const { data, error } = await supabase.functions.invoke('send-verification-email', {
      body: {
        userName,
        email,
        verificationUrl,
        verificationCode,
      },
    });

    if (error) {
      console.error('Error sending verification email:', error);
      return { success: false, error: error.message };
    }

    console.log('Verification email sent:', data);
    return {
      success: true,
      code: data?.verificationCode,
    };
  } catch (error: any) {
    console.error('Exception sending verification email:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Sends a password reset email to a user
 * Note: This uses Supabase's built-in password reset functionality
 */
export async function sendPasswordResetEmail(
  email: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      console.error('Error sending password reset email:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Exception sending password reset email:', error);
    return { success: false, error: error.message };
  }
}
