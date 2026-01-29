import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { generateAuditReport } from '@/utils/buttonAudit';

interface AuditIssue {
  buttonText?: string;
  linkText?: string;
  issues: string[];
}

interface AuditCategory {
  total: number;
  working?: number;
  issues: AuditIssue[];
}

interface AuditResults {
  buttonAudit: AuditCategory;
  navigationAudit: AuditCategory;
  recommendations: string[];
}

export const AuditPanel = () => {
  const [auditResults, setAuditResults] = useState<AuditResults | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const runAudit = async () => {
    setIsRunning(true);
    try {
      const results = generateAuditReport();
      setAuditResults(results);
    } catch (error) {
      console.error('Audit failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (isWorking: boolean) => {
    return isWorking ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          App Functionality Audit
        </CardTitle>
        <CardDescription>
          Check button functionality, navigation, and Supabase integrations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={runAudit} 
          disabled={isRunning}
          className="w-full"
        >
          {isRunning ? 'Running Audit...' : 'Run Full Audit'}
        </Button>

        {auditResults && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  Button Functionality
                  {getStatusIcon(auditResults.buttonAudit.issues.length === 0)}
                </h4>
                <div className="text-sm text-muted-foreground">
                  {auditResults.buttonAudit.working}/{auditResults.buttonAudit.total} working
                </div>
                {auditResults.buttonAudit.issues.length > 0 && (
                  <div className="space-y-1">
                    {auditResults.buttonAudit.issues.slice(0, 3).map((issue, index) => (
                      <div key={index} className="text-xs bg-red-50 p-2 rounded">
                        <div className="font-medium">{issue.buttonText}</div>
                        <div className="text-red-600">{issue.issues.join(', ')}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  Navigation
                  {getStatusIcon(auditResults.navigationAudit.issues.length === 0)}
                </h4>
                <div className="text-sm text-muted-foreground">
                  {auditResults.navigationAudit.total - auditResults.navigationAudit.issues.length}/
                  {auditResults.navigationAudit.total} working
                </div>
                {auditResults.navigationAudit.issues.length > 0 && (
                  <div className="space-y-1">
                    {auditResults.navigationAudit.issues.slice(0, 3).map((issue, index) => (
                      <div key={index} className="text-xs bg-red-50 p-2 rounded">
                        <div className="font-medium">{issue.linkText}</div>
                        <div className="text-red-600">{issue.issues.join(', ')}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Recommendations</h4>
              <div className="space-y-1">
                {auditResults.recommendations.slice(0, 3).map((rec: string, index: number) => (
                  <div key={index} className="text-xs bg-blue-50 p-2 rounded flex items-start gap-2">
                    <AlertCircle className="h-3 w-3 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-xs text-muted-foreground">
              Last audit: {new Date(auditResults.timestamp).toLocaleString()}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};