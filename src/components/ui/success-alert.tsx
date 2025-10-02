import { CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface SuccessAlertProps {
  title?: string;
  message: string;
  className?: string;
}

export function SuccessAlert({ title = "Success", message, className }: SuccessAlertProps) {
  return (
    <Alert className={className}>
      <CheckCircle2 className="h-4 w-4 text-success" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
