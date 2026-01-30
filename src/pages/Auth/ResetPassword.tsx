import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import rigelFullLogo from "@/assets/rigel-full-logo.jpg";
import globeImage from "@/assets/globe.jpg";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if we have the access token and refresh token from the URL
    const access_token = searchParams.get('access_token');
    const refresh_token = searchParams.get('refresh_token');
    
    if (access_token && refresh_token) {
      // Set the session with the tokens
      supabase.auth.setSession({
        access_token,
        refresh_token,
      });
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure both passwords are the same",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 8) {
      toast({
        title: "Password too short",
        description: "Password must be at least 8 characters long",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;

      toast({
        title: "Password updated",
        description: "Your password has been successfully updated",
      });
      
      navigate("/login");
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
          <CardTitle className="text-2xl font-bold text-gray-900">Set New Password</CardTitle>
          <CardDescription className="text-gray-600">
            Enter your new password below
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4 px-2">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-800 font-medium">New Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="py-6 text-gray-900 placeholder:text-gray-400 bg-white border-gray-300"
                minLength={8}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-gray-800 font-medium">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="py-6 text-gray-900 placeholder:text-gray-400 bg-white border-gray-300"
                minLength={8}
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-6 text-lg shadow-md mt-2"
              disabled={isLoading}
            >
              {isLoading ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;
