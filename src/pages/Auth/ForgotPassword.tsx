import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import rigelFullLogo from "@/assets/rigel-full-logo.jpg";
import globeImage from "@/assets/globe.jpg";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setIsEmailSent(true);
      toast({
        title: "Reset link sent",
        description: "Check your email for the password reset link",
      });
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send reset email",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isEmailSent) {
    return (
      <div className="min-h-screen w-full relative flex items-center justify-center p-4">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src={globeImage} 
            alt="Global Financial Network" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>

        <Card className="relative z-10 w-full max-w-md bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl overflow-hidden">
          <CardHeader className="text-center">
            <CardTitle>Check Your Email</CardTitle>
            <CardDescription>
              We've sent a password reset link to {email}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-800 text-center">
              Click the link in your email to reset your password. You can close this page.
            </p>
            <div className="text-center">
              <Link 
                to="/login" 
                className="text-emerald-600 hover:underline text-sm font-medium"
              >
                Back to Login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center p-4">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={globeImage} 
          alt="Global Financial Network" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60" />
      </div>

      <Card className="relative z-10 w-full max-w-md bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl overflow-hidden">
        <CardHeader className="text-center pt-10 pb-4">
          <img 
            src={rigelFullLogo}
            alt="Rigel - Powered by Stella Lumen" 
            className="h-32 w-auto mx-auto mb-4 object-contain transition-transform duration-300 hover:scale-105"
          />
          <CardTitle className="text-2xl font-bold text-gray-900">Reset Your Password</CardTitle>
          <CardDescription className="text-gray-600">
            Enter your email address and we'll send you a link to reset your password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4 px-2">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-800 font-medium">Email address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                required
                className="py-6 text-gray-900 placeholder:text-gray-400 bg-white border-gray-300"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-6 text-lg shadow-md"
              disabled={isLoading}
            >
              {isLoading ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <Link 
              to="/login" 
              className="text-emerald-600 hover:underline text-sm font-medium"
            >
              Back to Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword;
