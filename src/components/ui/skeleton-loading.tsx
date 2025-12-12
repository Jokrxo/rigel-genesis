import { cn } from "@/lib/utils";

interface SkeletonCardProps {
  className?: string;
}

export function SkeletonCard({ className }: SkeletonCardProps) {
  return (
    <div className={cn("rounded-xl border border-border bg-card p-6 space-y-4", className)}>
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-lg bg-muted animate-pulse" />
        <div className="space-y-2 flex-1">
          <div className="h-4 w-1/3 rounded bg-muted animate-pulse" />
          <div className="h-3 w-1/2 rounded bg-muted animate-pulse" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 w-full rounded bg-muted animate-pulse" />
        <div className="h-3 w-4/5 rounded bg-muted animate-pulse" />
      </div>
    </div>
  );
}

interface SkeletonTableProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export function SkeletonTable({ rows = 5, columns = 4, className }: SkeletonTableProps) {
  return (
    <div className={cn("rounded-lg border border-border overflow-hidden", className)}>
      {/* Header */}
      <div className="bg-muted/30 px-4 py-3 flex gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} className="h-4 flex-1 rounded bg-muted animate-pulse" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="px-4 py-4 flex gap-4 border-t border-border">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div 
              key={colIndex} 
              className="h-4 flex-1 rounded bg-muted animate-pulse"
              style={{ animationDelay: `${(rowIndex * columns + colIndex) * 50}ms` }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

interface SkeletonFormProps {
  fields?: number;
  className?: string;
}

export function SkeletonForm({ fields = 4, className }: SkeletonFormProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 w-24 rounded bg-muted animate-pulse" />
          <div className="h-11 w-full rounded-lg bg-muted animate-pulse" />
        </div>
      ))}
      <div className="flex gap-3 pt-4">
        <div className="h-11 w-32 rounded-lg bg-muted animate-pulse" />
        <div className="h-11 w-24 rounded-lg bg-muted animate-pulse" />
      </div>
    </div>
  );
}

interface SkeletonStatsProps {
  count?: number;
  className?: string;
}

export function SkeletonStats({ count = 4, className }: SkeletonStatsProps) {
  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="h-4 w-20 rounded bg-muted animate-pulse" />
            <div className="h-8 w-8 rounded-lg bg-muted animate-pulse" />
          </div>
          <div className="h-8 w-24 rounded bg-muted animate-pulse mb-2" />
          <div className="h-3 w-16 rounded bg-muted animate-pulse" />
        </div>
      ))}
    </div>
  );
}

interface SkeletonListProps {
  items?: number;
  className?: string;
}

export function SkeletonList({ items = 5, className }: SkeletonListProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 rounded-lg border border-border">
          <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-1/3 rounded bg-muted animate-pulse" />
            <div className="h-3 w-1/2 rounded bg-muted animate-pulse" />
          </div>
          <div className="h-8 w-20 rounded-lg bg-muted animate-pulse" />
        </div>
      ))}
    </div>
  );
}
