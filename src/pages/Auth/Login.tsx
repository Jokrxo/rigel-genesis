import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QrCode } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

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
      await login(email, password);
    } catch (error) {
      // Error is handled in useAuth
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
    <div className="auth-container">
      <div className="auth-card">
        <div className="flex flex-col items-center text-center mb-6">
          <img 
            src="/lovable-uploads/3b7b3f31-f5d5-4f5c-b75b-6e7f54d5bf88.png"
            alt="Financial workspace" 
            className="h-24 w-auto mb-4 object-cover rounded-lg border border-financial-200"
            onError={(e) => {
              console.log("Login page image failed to load");
              (e.target as HTMLImageElement).src = "/lovable-uploads/globe.png";
            }}
            onLoad={() => console.log("Login page image loaded successfully")}
          />
          <h2 className="text-2xl font-bold text-gray-900">Welcome to Rigel</h2>
          <p className="mt-2 text-sm text-gray-600 text-justify max-w-sm mx-auto">
            Log in to your account to continue using our comprehensive financial management system designed for South African businesses.
          </p>
        </div>

        <div className="mt-8 space-y-3">
          <Button
            onClick={handleGoogleLogin}
            variant="outline"
            className="w-full justify-center gap-2 py-6 border-gray-300 hover:bg-gray-50"
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
            variant="outline"
            className="w-full justify-center gap-2 py-6 border-gray-300 hover:bg-gray-50"
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
          <span className="px-3 text-xs text-muted-foreground">or</span>
          <Separator className="flex-1" />
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              required
              className="py-6"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                to="/forgot-password"
                className="text-xs text-financial-600 hover:underline"
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
              className="py-6"
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-financial-600 hover:bg-financial-700 text-white py-6 text-lg"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Log in"}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          Don't have an account?{" "}
          <Link to="/register" className="text-financial-600 hover:underline font-medium">
            Create an account
          </Link>
        </div>

        <div className="mt-6 border-t border-border pt-6">
          <div className="flex items-center justify-center gap-2">
            <QrCode className="h-4 w-4 text-muted-foreground" />
            <Link to="/qr-code" className="text-xs text-muted-foreground hover:underline">
              Share application via QR code
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
