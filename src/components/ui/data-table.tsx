import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/Shared/EmptyState";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { FileQuestion } from "lucide-react";

interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  isLoading?: boolean;
  emptyMessage?: string;
  emptyDescription?: string;
  onRowClick?: (item: T) => void;
  rowClassName?: (item: T) => string;
}

export function DataTable<T extends { id?: string | number }>({
  data,
  columns,
  isLoading = false,
  emptyMessage = "No data available",
  emptyDescription = "There are no items to display at this time.",
  onRowClick,
  rowClassName,
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <EmptyState
        icon={FileQuestion}
        title={emptyMessage}
        description={emptyDescription}
      />
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column, index) => (
              <TableHead key={index} className={column.className}>
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, rowIndex) => (
            <TableRow
              key={item.id || rowIndex}
              onClick={() => onRowClick?.(item)}
              className={`
                ${onRowClick ? 'cursor-pointer hover:bg-muted/50' : ''}
                ${rowClassName ? rowClassName(item) : ''}
              `}
            >
              {columns.map((column, colIndex) => (
                <TableCell key={colIndex} className={column.className}>
                  {column.render
                    ? column.render(item)
                    : String(item[column.key as keyof T] || '-')}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
