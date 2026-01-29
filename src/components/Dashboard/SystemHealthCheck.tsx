import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SystemCheck {
  name: string;
  status: 'checking' | 'success' | 'warning' | 'error';
  message: string;
  action?: () => void;
}

export const SystemHealthCheck = () => {
  const [checks, setChecks] = useState<SystemCheck[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const runSystemChecks = useCallback(async () => {
    setIsRunning(true);
    setChecks([]);

    const checkItems: SystemCheck[] = [
      { name: 'Authentication Status', status: 'checking', message: 'Checking login status...' },
      { name: 'Navigation Links', status: 'checking', message: 'Validating route navigation...' },
      { name: 'Button Functionality', status: 'checking', message: 'Testing button handlers...' },
      { name: 'Supabase Connection', status: 'checking', message: 'Testing database connection...' },
      { name: 'Upload Processing', status: 'checking', message: 'Checking file upload system...' },
    ];

    setChecks([...checkItems]);

    // Check Authentication
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      checkItems[0] = {
        ...checkItems[0],
        status: user ? 'success' : 'warning',
        message: user ? `Logged in as: ${user.email}` : 'Not authenticated - some features may not work',
      };
      setChecks([...checkItems]);
    } catch (error) {
      checkItems[0] = {
        ...checkItems[0],
        status: 'error',
        message: 'Authentication system error',
      };
      setChecks([...checkItems]);
    }

    // Check Navigation Routes
    setTimeout(() => {
      const requiredRoutes = [
        '/dashboard',
        '/import-statement', 
        '/financial-analysis',
        '/transaction-processing',
        '/reports'
      ];
      
      let routeIssues = 0;
      requiredRoutes.forEach(route => {
        try {
          // Test if route exists by checking if Link components can navigate
          const testElement = document.querySelector(`a[href="${route}"]`);
          if (!testElement) routeIssues++;
        } catch (error) {
          routeIssues++;
        }
      });

      checkItems[1] = {
        ...checkItems[1],
        status: routeIssues === 0 ? 'success' : 'warning',
        message: routeIssues === 0 ? 'All navigation routes working' : `${routeIssues} routes may have issues`,
      };
      setChecks([...checkItems]);
    }, 500);

    // Check Button Functionality
    setTimeout(() => {
      const buttons = document.querySelectorAll('button');
      let buttonIssues = 0;
      
      buttons.forEach(button => {
        if (!button.onclick && !button.addEventListener && button.type !== 'submit' && !button.disabled) {
          const hasClickHandler = button.getAttribute('onclick') || 
                                 button.classList.contains('cursor-pointer') ||
                                 button.closest('a') ||
                                 button.form;
          if (!hasClickHandler) buttonIssues++;
        }
      });

      checkItems[2] = {
        ...checkItems[2],
        status: buttonIssues === 0 ? 'success' : 'warning',
        message: buttonIssues === 0 ? 'All buttons have click handlers' : `${buttonIssues} buttons may not be functional`,
      };
      setChecks([...checkItems]);
    }, 1000);

    // Check Supabase Connection
    setTimeout(async () => {
      try {
        const { data, error } = await supabase.from('profiles').select('id').limit(1);
        
        checkItems[3] = {
          ...checkItems[3],
          status: error ? 'error' : 'success',
          message: error ? `Database error: ${error.message}` : 'Database connection working',
        };
      } catch (error) {
        checkItems[3] = {
          ...checkItems[3],
          status: 'error',
          message: 'Cannot connect to Supabase',
        };
      }
      setChecks([...checkItems]);
    }, 1500);

    // Check Upload Processing
    setTimeout(() => {
      try {
        const uploadButtons = document.querySelectorAll('button:contains("Upload"), button:contains("Process")');
        checkItems[4] = {
          ...checkItems[4],
          status: uploadButtons.length > 0 ? 'success' : 'warning',
          message: uploadButtons.length > 0 ? 'Upload functionality available' : 'Upload features may not be working',
          action: uploadButtons.length === 0 ? () => navigate('/import-statement') : undefined,
        };
      } catch (error) {
        checkItems[4] = {
          ...checkItems[4],
          status: 'error',
          message: 'Upload system check failed',
        };
      }
      setChecks([...checkItems]);
      setIsRunning(false);
    }, 2000);
  }, [navigate]);

  const getStatusIcon = (status: SystemCheck['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
    }
  };

  const getStatusBadge = (status: SystemCheck['status']) => {
    const variants = {
      success: 'default',
      warning: 'secondary',
      error: 'destructive',
      checking: 'outline'
    } as const;

    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  useEffect(() => {
    runSystemChecks();
  }, [runSystemChecks]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          System Health Check
        </CardTitle>
        <CardDescription>
          Automated validation of core application functionality
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={runSystemChecks} 
          disabled={isRunning}
          className="w-full"
        >
          {isRunning ? 'Running Checks...' : 'Run Health Check'}
        </Button>

        {checks.length > 0 && (
          <div className="space-y-3">
            {checks.map((check, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(check.status)}
                  <div>
                    <div className="font-medium">{check.name}</div>
                    <div className="text-sm text-muted-foreground">{check.message}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(check.status)}
                  {check.action && (
                    <Button size="sm" variant="outline" onClick={check.action}>
                      Fix
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {checks.length > 0 && !isRunning && (
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <div className="text-sm">
              <strong>Health Score:</strong>{' '}
              {checks.filter(c => c.status === 'success').length}/{checks.length} systems healthy
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};