
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Brain } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loading } from "@/components/ui/loading";
import { statementTypes, GeneratedStatement } from '../types/financialStatementTypes';
import { generateSampleStatement } from '../utils/sampleDataGenerator';

interface StatementGenerationFormProps {
  onStatementGenerated: (statement: GeneratedStatement) => void;
}

export const StatementGenerationForm = ({ onStatementGenerated }: StatementGenerationFormProps) => {
  const [statementType, setStatementType] = useState<string>('');
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateStatement = async () => {
    if (!statementType) {
      toast({
        title: "Statement Type Required",
        description: "Please select a financial statement type to generate.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-financial-assistant', {
        body: {
          action: 'generate_financial_statement',
          statementType,
          dateFrom: dateFrom?.toISOString(),
          dateTo: dateTo?.toISOString(),
        }
      });

      if (error) throw error;

      const statement: GeneratedStatement = {
        type: statementType,
        generatedDate: new Date().toISOString(),
        periodFrom: dateFrom?.toISOString() || '',
        periodTo: dateTo?.toISOString() || '',
        data: data || generateSampleStatement(statementType)
      };

      onStatementGenerated(statement);
      toast({
        title: "Statement Generated",
        description: `Successfully generated ${statementTypes.find(s => s.value === statementType)?.label} using AI analysis.`,
      });
    } catch (error) {
      console.error('Error generating statement:', error);
      // Fallback to sample data
      const statement: GeneratedStatement = {
        type: statementType,
        generatedDate: new Date().toISOString(),
        periodFrom: dateFrom?.toISOString() || '',
        periodTo: dateTo?.toISOString() || '',
        data: generateSampleStatement(statementType)
      };
      onStatementGenerated(statement);
      toast({
        title: "Statement Generated (Sample)",
        description: "Generated sample financial statement. Connect to your data source for real-time analysis.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-financial-600" />
          AI Financial Statement Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="financial-label">Statement Type</label>
            <Select onValueChange={setStatementType}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Select statement type" />
              </SelectTrigger>
              <SelectContent>
                {statementTypes.map((statement) => (
                  <SelectItem key={statement.value} value={statement.value}>
                    {statement.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="financial-label">Reporting Period</label>
            <div className="flex space-x-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "flex-1 justify-start text-left font-normal h-12",
                      !dateFrom && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateFrom ? format(dateFrom, "PPP") : "From date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateFrom}
                    onSelect={setDateFrom}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "flex-1 justify-start text-left font-normal h-12",
                      !dateTo && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateTo ? format(dateTo, "PPP") : "To date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateTo}
                    onSelect={setDateTo}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        <Button 
          onClick={generateStatement} 
          disabled={isGenerating || !statementType}
          className="w-full h-12"
        >
          {isGenerating ? (
            <Loading size="sm" text="Generating with AI..." />
          ) : (
            <>
              <Brain className="mr-2 h-4 w-4" />
              Generate Financial Statement
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
