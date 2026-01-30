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
import { ZodError } from "zod";
import rigelFullLogo from "@/assets/rigel-full-logo.jpg";
import globeImage from "@/assets/globe.jpg";

const Register = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { register, loginWithGoogle, loginWithFacebook, loginWithGithub } = useAuth();
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
    } catch (error: unknown) {
      if (error instanceof ZodError) {
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

  const handleGithubLogin = async () => {
    try {
      await loginWithGithub();
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
        <div className="absolute inset-0 bg-background/60 dark:bg-background/80" />
      </div>

      <div className="relative z-10 w-full max-w-md bg-card/95 backdrop-blur-sm rounded-xl shadow-2xl overflow-hidden border border-border">
        <div className="flex justify-center pt-10 pb-4">
          <img 
            src={rigelFullLogo}
            alt="Rigel - Powered by Stella Lumen" 
            className="h-48 w-auto object-contain transition-transform duration-300 hover:scale-105"
          />
        </div>

        <div className="flex flex-col items-center text-center mb-8 px-6">
          <h2 className="text-3xl font-bold text-card-foreground">Create an account</h2>
          <p className="mt-3 text-lg text-muted-foreground leading-relaxed text-center max-w-sm mx-auto">
            Join Rigel to manage your finances with our comprehensive financial management system designed for South African businesses.
          </p>
        </div>

        <div className="px-6 pb-6">
          <div className="space-y-3">
            <Button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              variant="outline"
              className="w-full justify-center gap-2 py-6 border-border hover:bg-accent hover:text-accent-foreground font-medium"
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
              className="w-full justify-center gap-2 py-6 border-border hover:bg-accent hover:text-accent-foreground font-medium"
            >
              <div className="h-5 w-5 mr-2 bg-[#1877F3] rounded-full flex items-center justify-center">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </div>
              <span>Continue with Facebook</span>
            </Button>

            <Button
              onClick={handleGithubLogin}
              variant="outline"
              className="w-full justify-center gap-2 py-6 border-border hover:bg-accent hover:text-accent-foreground font-medium"
            >
              <div className="h-5 w-5 mr-2 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </div>
              <span>Continue with GitHub</span>
            </Button>
          </div>

          <div className="my-5 flex items-center">
            <Separator className="flex-1" />
            <span className="px-3 text-xs text-muted-foreground font-medium">or</span>
            <Separator className="flex-1" />
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="name" className="text-card-foreground font-semibold">Full Name</Label>
              <Input
                id="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                required
                className="py-6 text-card-foreground placeholder:text-muted-foreground bg-background border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-card-foreground font-semibold">Email address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                required
                className="py-6 text-card-foreground placeholder:text-muted-foreground bg-background border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-card-foreground font-semibold">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="py-6 text-card-foreground placeholder:text-muted-foreground bg-background border-border"
              />
              <p className="text-xs text-muted-foreground">
                Password must be at least 8 characters long
              </p>
            </div>
            <div className="space-y-2">
              <Label className="flex items-start gap-2 text-sm text-muted-foreground">
                <Input type="checkbox" className="mt-0.5 h-4 w-4 border-border" required />
                <span className="text-justify leading-relaxed">
                  I agree to the{" "}
                  <Link to="/terms" className="text-primary hover:underline font-medium">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link to="/privacy" className="text-primary hover:underline font-medium">
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

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline font-semibold">
              Log in
            </Link>
          </div>

          <div className="mt-6 border-t border-border pt-6">
            <div className="flex items-center justify-center gap-2">
              <QrCode className="h-4 w-4 text-muted-foreground" />
              <Link to="/qr-code" className="text-xs text-muted-foreground hover:underline font-medium">
                Share application via QR code
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
