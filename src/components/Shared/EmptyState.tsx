import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
  secondaryActionLabel,
  onSecondaryAction,
}: EmptyStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-16 px-6 text-center",
      className
    )}>
      <div className="rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 p-6 mb-6 ring-1 ring-primary/20">
        <Icon className="h-12 w-12 text-primary" />
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground mb-8 max-w-md leading-relaxed">{description}</p>
      <div className="flex flex-col sm:flex-row gap-3">
        {actionLabel && onAction && (
          <Button onClick={onAction} size="lg">{actionLabel}</Button>
        )}
        {secondaryActionLabel && onSecondaryAction && (
          <Button variant="outline" onClick={onSecondaryAction} size="lg">{secondaryActionLabel}</Button>
        )}
      </div>
    </div>
  );
}
