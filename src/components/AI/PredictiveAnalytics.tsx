
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { TrendingUp, AlertTriangle, Calendar, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Loading } from "@/components/ui/loading";

interface Prediction {
  metric: string;
  currentValue: number;
  predictedValue: number;
  change: number;
  confidence: number;
  timeframe: string;
}

interface RiskAlert {
  type: 'warning' | 'danger' | 'info';
  title: string;
  description: string;
  recommendation: string;
}

export const PredictiveAnalytics = () => {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [riskAlerts, setRiskAlerts] = useState<RiskAlert[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const generatePredictions = useCallback(async () => {
    setIsAnalyzing(true);

    try {
      const { data, error } = await supabase.functions.invoke('predictive-analytics', {
        body: { 
          timeframe: 'quarterly',
          analysisType: 'financial_forecast'
        }
      });

      if (error) throw error;

      setPredictions(data.predictions || []);
      setRiskAlerts(data.riskAlerts || []);
      
      toast({
        title: "Analysis Complete",
        description: "Financial predictions and risk assessment generated.",
      });
    } catch (error) {
      console.error('Error generating predictions:', error);
      toast({
        title: "Analysis Failed",
        description: "Unable to generate predictions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  }, [toast]);

  useEffect(() => {
    // Auto-generate predictions on component mount
    generatePredictions();
  }, [generatePredictions]);

  const getRiskIcon = (type: string) => {
    switch (type) {
      case 'danger': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default: return <AlertTriangle className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-financial-600" />
            AI Financial Predictions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={generatePredictions} 
            disabled={isAnalyzing}
            className="w-full mb-4"
          >
            {isAnalyzing ? (
              <Loading size="sm" text="Analyzing..." />
            ) : (
              <>
                <TrendingUp className="mr-2 h-4 w-4" />
                Refresh Analysis
              </>
            )}
          </Button>

          {predictions.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2">
              {predictions.map((prediction, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{prediction.metric}</h4>
                    <span className="text-sm text-muted-foreground">{prediction.timeframe}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Current:</span>
                      <span className="font-medium">R {prediction.currentValue.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Predicted:</span>
                      <span className="font-medium">R {prediction.predictedValue.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Change:</span>
                      <span className={`font-medium ${prediction.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {prediction.change >= 0 ? '+' : ''}{prediction.change.toFixed(1)}%
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {prediction.confidence}% confidence
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {riskAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              Risk Alerts & Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {riskAlerts.map((alert, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    {getRiskIcon(alert.type)}
                    <div className="flex-1">
                      <h4 className="font-medium mb-1">{alert.title}</h4>
                      <p className="text-sm text-muted-foreground mb-2">{alert.description}</p>
                      <p className="text-sm font-medium text-financial-700">{alert.recommendation}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
