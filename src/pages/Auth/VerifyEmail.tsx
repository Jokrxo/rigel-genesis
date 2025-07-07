
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const VerifyEmail = () => {
  const { user, sendVerificationEmail } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      // If no user, they shouldn't be on this page
      toast({
        title: "Not logged in",
        description: "Please log in or create an account first",
        variant: "destructive",
      });
    }
  }, [user, toast]);

  const handleResendEmail = async () => {
    try {
      await sendVerificationEmail();
      toast({
        title: "Email sent",
        description: "Verification email has been resent to your inbox",
      });
    } catch (error) {
      toast({
        title: "Failed to send email",
        description: "Please try again later",
        variant: "destructive",
      });
    }
  };

  // Mock: For demo purposes, we'll simulate verification after a short delay
  useEffect(() => {
    const timer = setTimeout(() => {
      // For demo, redirect to verification success page automatically
      window.location.href = "/verification-success";
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  if (!user) {
    return null; // Component will handle redirect in useEffect
  }

  return (
    <div className="auth-container">
      <div className="max-w-md w-full">
        <Card>
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-financial-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Mail className="h-8 w-8 text-financial-600" />
            </div>
            <CardTitle className="text-xl font-semibold">Verify your email</CardTitle>
            <CardDescription>
              We've sent a verification email to{" "}
              <span className="font-medium">{user.email}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground mb-6">
              Please check your email and click on the verification link to continue.
              If you don't see the email, check your spam folder.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button onClick={handleResendEmail} variant="outline" className="w-full">
              Resend verification email
            </Button>
            <div className="text-center text-sm text-muted-foreground">
              <Link to="/login" className="text-financial-600 hover:underline">
                Back to login
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default VerifyEmail;
