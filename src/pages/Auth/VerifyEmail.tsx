import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, CheckCircle2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { sendVerificationEmail } from "@/utils/emailService";
import { useToast } from "@/hooks/use-toast";

const VerifyEmail = () => {
  const [isResending, setIsResending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { user, sendVerificationEmail: resendVerification } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      toast({
        title: "Not logged in",
        description: "Please log in or create an account first",
        variant: "destructive",
      });
      navigate("/login");
    }
  }, [user, toast, navigate]);

  const handleResendEmail = async () => {
    if (!user?.email) return;

    setIsResending(true);
    try {
      // Use Supabase's built-in resend
      await resendVerification();
      
      // Also send our custom branded email
      const verificationUrl = `${window.location.origin}/verification-success`;
      await sendVerificationEmail({
        userName: user.displayName || user.email.split('@')[0],
        email: user.email,
        verificationUrl,
      });

      setEmailSent(true);
      toast({
        title: "Verification email sent",
        description: "Please check your inbox and spam folder",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to resend verification email",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-background via-background to-muted">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center">
            {emailSent ? (
              <CheckCircle2 className="h-10 w-10 text-primary-foreground animate-scale-in" />
            ) : (
              <Mail className="h-10 w-10 text-primary-foreground" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {emailSent ? "Email Sent!" : "Verify Your Email"}
          </CardTitle>
          <CardDescription className="text-base">
            {emailSent
              ? "We've sent another verification email to your inbox."
              : `We've sent a verification link to ${user.email}. Please check your inbox and click the link to verify your account.`}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-primary text-sm font-semibold">1</span>
              </div>
              <div>
                <p className="text-sm font-medium">Check your inbox</p>
                <p className="text-xs text-muted-foreground">
                  Look for an email from Rigel Team
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-primary text-sm font-semibold">2</span>
              </div>
              <div>
                <p className="text-sm font-medium">Click the verification link</p>
                <p className="text-xs text-muted-foreground">
                  Or copy the verification code from the email
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-primary text-sm font-semibold">3</span>
              </div>
              <div>
                <p className="text-sm font-medium">Start using Rigel</p>
                <p className="text-xs text-muted-foreground">
                  Access all features and manage your finances
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              onClick={handleResendEmail}
              disabled={isResending}
              className="w-full"
              variant="outline"
            >
              <Send className="mr-2 h-4 w-4" />
              {isResending ? "Sending..." : "Resend Verification Email"}
            </Button>

            <Button
              onClick={() => navigate("/login")}
              variant="ghost"
              className="w-full"
            >
              Back to Login
            </Button>
          </div>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Didn't receive the email? Check your spam folder or{" "}
              <button
                onClick={handleResendEmail}
                className="text-primary hover:underline font-medium"
                disabled={isResending}
              >
                resend verification email
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyEmail;
