
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
}

export const Loading = ({ size = "md", text, className }: LoadingProps) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6", 
    lg: "h-8 w-8"
  };

  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      <Loader2 className={cn("animate-spin text-financial-600", sizeClasses[size])} />
      {text && <span className="text-sm text-muted-foreground">{text}</span>}
    </div>
  );
};

export const LoadingScreen = ({ text = "Loading..." }: { text?: string }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-financial-50">
      <div className="text-center">
        <Loading size="lg" />
        <p className="mt-4 text-lg text-financial-700">{text}</p>
      </div>
    </div>
  );
};
