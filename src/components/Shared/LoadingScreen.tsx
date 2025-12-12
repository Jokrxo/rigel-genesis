import { Loader2 } from "lucide-react";
import rigelLogo from "@/assets/rigel-logo.jpg";

interface LoadingScreenProps {
  message?: string;
}

export const LoadingScreen = ({ message = "Loading..." }: LoadingScreenProps) => {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <img 
            src={rigelLogo} 
            alt="Rigel" 
            className="h-16 w-16 rounded-xl shadow-lg animate-pulse"
          />
          <div className="absolute -bottom-2 -right-2 bg-card rounded-full p-1 shadow-md">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        </div>
        <div className="flex flex-col items-center gap-2">
          <p className="text-lg text-foreground font-semibold">{message}</p>
          <div className="flex gap-1">
            <span className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    </div>
  );
};
