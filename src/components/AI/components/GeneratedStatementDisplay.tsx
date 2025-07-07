
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { ExportControls } from "@/components/Dashboard/ExportControls";
import { GeneratedStatement, statementTypes } from '../types/financialStatementTypes';
import { StatementContentRenderer } from './StatementContentRenderer';

interface GeneratedStatementDisplayProps {
  statement: GeneratedStatement;
}

export const GeneratedStatementDisplay = ({ statement }: GeneratedStatementDisplayProps) => {
  return (
    <Card id="generated-financial-statement">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            {statementTypes.find(s => s.value === statement.type)?.label}
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Generated on {format(new Date(statement.generatedDate), "PPP")}
            {statement.periodFrom && statement.periodTo && (
              <span> | Period: {format(new Date(statement.periodFrom), "PP")} - {format(new Date(statement.periodTo), "PP")}</span>
            )}
          </p>
        </div>
        <ExportControls 
          data={statement.data}
          filename={`${statement.type}-${format(new Date(), "yyyy-MM-dd")}`}
          elementId="generated-financial-statement"
        />
      </CardHeader>
      <CardContent>
        <StatementContentRenderer statement={statement} />
      </CardContent>
    </Card>
  );
};
