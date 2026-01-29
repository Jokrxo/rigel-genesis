import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QrCode } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { emailSchema } from "@/utils/validation";
import rigelFullLogo from "@/assets/rigel-full-logo.jpg";
import globeImage from "@/assets/globe.jpg";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login, loginWithGoogle, loginWithFacebook } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate email before submission
      emailSchema.parse(email);
      
      await login(email, password);
    } catch (error: any) {
      if (error.errors) {
        // Zod validation error
        toast({
          title: "Validation Error",
          description: error.errors[0].message,
          variant: "destructive",
        });
      }
      // Other errors handled in useAuth
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (error) {
      // Error is handled in useAuth
    }
  };

  const handleFacebookLogin = async () => {
    try {
      await loginWithFacebook();
    } catch (error) {
      // Error is handled in useAuth
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

      <div className="relative z-10 w-full max-w-md bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl overflow-hidden">
        <div className="flex justify-center pt-8 pb-2">
          <img 
            src={rigelFullLogo}
            alt="Rigel - Powered by Stella Lumen" 
            className="h-16 w-auto object-contain"
          />
        </div>

        <div className="flex flex-col items-center text-center mb-6 px-6">
          <h2 className="text-2xl font-bold text-gray-900">Welcome to Rigel</h2>
          <p className="mt-2 text-sm text-gray-700 leading-relaxed text-justify max-w-sm mx-auto">
            Log in to your account to continue using our comprehensive financial management system designed for South African businesses.
          </p>
        </div>

        <div className="px-6 pb-6">
          <div className="space-y-3">
            <Button
              onClick={handleGoogleLogin}
              variant="outline"
              className="w-full justify-center gap-2 py-6 border-gray-300 hover:bg-gray-50 text-gray-800 font-medium"
            >
              <img 
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
                alt="Google" 
                className="h-5 w-5 mr-2" 
              />
              <span>Continue with Google</span>
            </Button>

            <Button
              onClick={handleFacebookLogin}
              disabled={isLoading}
              variant="outline"
              className="w-full justify-center gap-2 py-6 border-gray-300 hover:bg-gray-50 text-gray-800 font-medium"
            >
              <div className="h-5 w-5 mr-2 bg-[#1877F3] rounded-full flex items-center justify-center">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </div>
              <span>Continue with Facebook</span>
            </Button>
          </div>

          <div className="my-5 flex items-center">
            <Separator className="flex-1" />
            <span className="px-3 text-xs text-gray-600 font-medium">or</span>
            <Separator className="flex-1" />
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
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
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-gray-800 font-medium">Password</Label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-primary hover:underline font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="py-6 text-gray-900 placeholder:text-gray-400 bg-white border-gray-300"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-lg"
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Log in"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-700">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary hover:underline font-semibold">
              Create an account
            </Link>
          </div>

          <div className="mt-6 border-t border-gray-200 pt-6">
            <div className="flex items-center justify-center gap-2">
              <QrCode className="h-4 w-4 text-gray-600" />
              <Link to="/qr-code" className="text-xs text-gray-600 hover:underline font-medium">
                Share application via QR code
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
