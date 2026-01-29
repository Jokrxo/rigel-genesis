import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, CheckCircle, X, Eye } from "lucide-react";

interface DataIssue {
  id: string;
  issue_type: string;
  issue_description: string;
  severity: string;
  resolution_status: string;
  resolution_notes?: string;
  created_at: string;
  updated_at: string;
  file_id?: string;
  transaction_id?: string;
}

export const DataIssuesView = () => {
  const [issues, setIssues] = useState<DataIssue[]>([]);
  const [filteredIssues, setFilteredIssues] = useState<DataIssue[]>([]);
  const [severityFilter, setSeverityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchIssues = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('data_issues')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching data issues:', error);
      return;
    }

    setIssues(data || []);
    setIsLoading(false);
  }, []);

  const filterIssues = useCallback(() => {
    let filtered = issues;

    if (severityFilter !== "all") {
      filtered = filtered.filter(issue => issue.severity === severityFilter);
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(issue => issue.resolution_status === statusFilter);
    }

    setFilteredIssues(filtered);
  }, [issues, severityFilter, statusFilter]);

  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  useEffect(() => {
    filterIssues();
  }, [filterIssues]);

  const updateIssueStatus = async (issueId: string, status: string, notes?: string) => {
    const { error } = await supabase
      .from('data_issues')
      .update({
        resolution_status: status,
        resolution_notes: notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', issueId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update issue status",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Issue status updated",
    });

    fetchIssues();
  };

  const getSeverityBadgeVariant = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'resolved': return 'default';
      case 'acknowledged': return 'secondary';
      case 'ignored': return 'outline';
      case 'open': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved': return <CheckCircle className="h-4 w-4" />;
      case 'acknowledged': return <Eye className="h-4 w-4" />;
      case 'ignored': return <X className="h-4 w-4" />;
      case 'open': return <AlertTriangle className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const issueStats = {
    total: issues.length,
    open: issues.filter(i => i.resolution_status === 'open').length,
    critical: issues.filter(i => i.severity === 'critical').length,
    resolved: issues.filter(i => i.resolution_status === 'resolved').length,
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{issueStats.total}</p>
                <p className="text-sm text-muted-foreground">Total Issues</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-red-600">{issueStats.open}</p>
                <p className="text-sm text-muted-foreground">Open Issues</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-orange-600">{issueStats.critical}</p>
                <p className="text-sm text-muted-foreground">Critical</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-green-600">{issueStats.resolved}</p>
                <p className="text-sm text-muted-foreground">Resolved</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Data Quality Issues
          </CardTitle>
          <CardDescription>
            Track and resolve data validation, OCR errors, and processing issues
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="acknowledged">Acknowledged</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="ignored">Ignored</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Issue Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Loading issues...
                    </TableCell>
                  </TableRow>
                ) : filteredIssues.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      No issues found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredIssues.map((issue) => (
                    <TableRow key={issue.id}>
                      <TableCell>
                        <Badge variant="outline">{issue.issue_type.replace(/_/g, ' ')}</Badge>
                      </TableCell>
                      <TableCell className="max-w-96">
                        <p className="truncate">{issue.issue_description}</p>
                        {issue.resolution_notes && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Note: {issue.resolution_notes}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getSeverityBadgeVariant(issue.severity)}>
                          {issue.severity}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(issue.resolution_status)}
                          <Badge variant={getStatusBadgeVariant(issue.resolution_status)}>
                            {issue.resolution_status}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(issue.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {issue.resolution_status === 'open' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateIssueStatus(issue.id, 'acknowledged')}
                              >
                                Acknowledge
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => updateIssueStatus(issue.id, 'resolved')}
                              >
                                Resolve
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {!isLoading && (
            <div className="text-sm text-muted-foreground">
              Showing {filteredIssues.length} of {issues.length} issues
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};