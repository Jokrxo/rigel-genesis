import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QrCode } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { emailSchema, passwordSchema, displayNameSchema } from "@/utils/validation";
import { useToast } from "@/hooks/use-toast";
import rigelFullLogo from "@/assets/rigel-full-logo.jpg";
import globeImage from "@/assets/globe.jpg";

const Register = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { register, loginWithGoogle, loginWithFacebook } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate inputs before submission
      emailSchema.parse(email);
      passwordSchema.parse(password);
      displayNameSchema.parse(fullName);
      
      await register(email, password, fullName);
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
    <div className="auth-container">
      <div className="auth-card overflow-hidden">
        <div className="relative h-48 w-full mb-6">
          <img 
            src={globeImage} 
            alt="Global Financial Network" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent flex items-end justify-center pb-4">
             <img 
              src={rigelFullLogo}
              alt="Rigel - Powered by Stella Lumen" 
              className="h-16 w-auto object-contain bg-white/80 rounded px-2 py-1 backdrop-blur-sm"
            />
          </div>
        </div>

        <div className="flex flex-col items-center text-center mb-6 px-6">
          <h2 className="text-2xl font-bold text-black">Create an account</h2>
          <p className="mt-2 text-sm text-black text-justify max-w-sm mx-auto">
            Join Rigel to manage your finances with our comprehensive financial management system designed for South African businesses.
          </p>
        </div>

        <div className="px-6 pb-6">
          <div className="space-y-3">
            <Button
              onClick={handleGoogleLogin}
              variant="outline"
              className="w-full justify-center gap-2 py-6 border-border hover:bg-accent text-black"
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
            className="w-full justify-center gap-2 py-6 border-border hover:bg-accent"
          >
            <div className="h-5 w-5 mr-2 bg-[#1877F3] rounded-full flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </div>
            <span>Continue with Facebook</span>
          </Button>
        </div>
        </div>

        <div className="my-5 flex items-center">
          <Separator className="flex-1" />
          <span className="px-3 text-xs text-muted-foreground">or</span>
          <Separator className="flex-1" />
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="name" className="text-black">Full Name</Label>
            <Input
              id="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="John Doe"
              required
              className="py-6 text-black"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-black">Email address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              required
              className="py-6 text-black"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-black">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="py-6 text-black"
            />
            <p className="text-xs text-muted-foreground">
              Password must be at least 8 characters long
            </p>
          </div>
          <div className="space-y-2">
            <Label className="flex items-start gap-2 text-sm text-black">
              <Input type="checkbox" className="mt-0.5 h-4 w-4" required />
              <span className="text-justify">
                I agree to the{" "}
                <Link to="/terms" className="text-primary hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link to="/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </Link>
              </span>
            </Label>
          </div>
          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-lg"
            disabled={isLoading}
          >
            {isLoading ? "Creating account..." : "Create account"}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-black">
          Already have an account?{" "}
          <Link to="/login" className="text-primary hover:underline font-medium">
            Log in
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

export default Register;
