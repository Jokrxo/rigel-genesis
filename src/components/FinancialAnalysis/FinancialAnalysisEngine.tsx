import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, BarChart3, AlertTriangle, CheckCircle, Eye, Download, Trash2 } from "lucide-react";
import { TransactionsView } from "./TransactionsView";
import { FinancialStatementsView } from "./FinancialStatementsView";
import { DataIssuesView } from "./DataIssuesView";
import { FileUploadTester } from "@/components/Debug/FileUploadTester";
import { ERDiagram } from "./ERDiagram";

interface FileData {
  id: string;
  file_name: string;
  file_type: string;
  file_url: string;
  processing_status: string;
  upload_date: string;
  processing_metadata?: Record<string, unknown>;
  transaction_count: number;
  total_debits: number;
  total_credits: number;
  statement_count: number;
  issues_count: number;
  bank_id?: string;
}

interface AnalysisResult {
  success: boolean;
  fileId: string;
  transactionsProcessed: number;
  summary: Record<string, unknown>;
  validationIssues: string[];
}

export const FinancialAnalysisEngine = () => {
  const [files, setFiles] = useState<FileData[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState("upload");
  const { toast } = useToast();

  useEffect(() => {
    fetchFiles();
    
    // Set up real-time subscriptions for file updates
    const channel = supabase
      .channel('financial-data-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'files'
      }, () => {
        fetchFiles(); // Refresh files when any file changes
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'transactions'
      }, () => {
        fetchFiles(); // Refresh to update transaction counts
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'financial_statements'
      }, () => {
        fetchFiles(); // Refresh to update statement counts
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'data_issues'
      }, () => {
        fetchFiles(); // Refresh to update issue counts
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchFiles]);

  const fetchFiles = useCallback(async () => {
    try {
      const { data, error } = await supabase.rpc('get_file_overview');
      
      if (error) {
        console.error('Error fetching files:', error);
        toast({
          title: "Error",
          description: "Failed to fetch files",
          variant: "destructive",
        });
        return;
      }

      setFiles(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  }, [toast]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    validateAndSetFile(file);
  };

  const validateAndSetFile = (file: File) => {
    // Check file size (10MB limit)
    const maxSizeInBytes = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSizeInBytes) {
      toast({
        title: "File Too Large",
        description: "Please upload a file smaller than 10MB",
        variant: "destructive",
      });
      return;
    }

    const allowedTypes = [
      'application/pdf', 
      'application/vnd.ms-excel', 
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv',
      'image/png', 
      'image/jpeg'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a PDF, Excel file, CSV, or image (PNG/JPEG)",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    toast({
      title: "File Selected",
      description: `${file.name} is ready for processing`,
    });
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    
    const files = Array.from(event.dataTransfer.files);
    if (files.length > 0) {
      validateAndSetFile(files[0]);
    }
  };

  const processFile = async () => {
    if (!selectedFile) {
      toast({
        title: "No File Selected",
        description: "Please select a file to process",
        variant: "destructive",
      });
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to process files",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setProcessingProgress(0);

    try {
      // Upload file to Supabase Storage
      setProcessingProgress(20);
      const { uploadStatementFile } = await import("@/utils/uploadToSupabase");
      const fileUrl = await uploadStatementFile(selectedFile, user.id);

      // Create file record
      setProcessingProgress(40);
      const { data: fileRecord, error: fileError } = await supabase
        .from('files')
        .insert({
          user_id: user.id,
          file_name: selectedFile.name,
          file_type: selectedFile.type,
          file_size: selectedFile.size,
          file_url: fileUrl,
          processing_status: 'processing'
        })
        .select()
        .single();

      if (fileError) throw fileError;

      // Read file content
      setProcessingProgress(60);
      const fileContent = await selectedFile.text();

      // Process with AI engine
      setProcessingProgress(80);
      const response = await supabase.functions.invoke<AnalysisResult>('financial-analysis-engine', {
        body: {
          fileId: fileRecord.id,
          fileContent,
          fileType: selectedFile.type,
          userId: user.id
        }
      });

      if (response.error) throw response.error;

      setProcessingProgress(100);
      setAnalysisResult(response.data);
      setActiveTab("results");
      
      toast({
        title: "Processing Complete",
        description: `Successfully processed ${response.data.transactionsProcessed} transactions`,
      });

      await fetchFiles();

    } catch (error) {
      console.error('Processing error:', error);
      toast({
        title: "Processing Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setProcessingProgress(0);
    }
  };

  const handleViewFile = (file: FileData) => {
    toast({
      title: "File Details",
      description: `${file.file_name} - Status: ${file.processing_status}`,
    });
    // Navigate to detailed view or show modal with file details
  };

  const handleDownloadFile = async (file: FileData) => {
    try {
      // Create a download link
      const link = document.createElement('a');
      link.href = file.file_url || '#';
      link.download = file.file_name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Download Started",
        description: `Downloading ${file.file_name}...`,
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Unable to download the file. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    try {
      const { error } = await supabase
        .from('files')
        .delete()
        .eq('id', fileId);

      if (error) throw error;

      setFiles(files.filter(f => f.id !== fileId));
      toast({
        title: "File Deleted",
        description: "File has been successfully deleted.",
      });
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: "Unable to delete the file. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Financial Analysis Engine</h1>
        <p className="text-muted-foreground">
          Upload bank statements for AI-powered analysis, categorization, and financial statement generation
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="statements">Statements</TabsTrigger>
          <TabsTrigger value="issues">Issues</TabsTrigger>
          <TabsTrigger value="debug">Debug</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Bank Statement
              </CardTitle>
              <CardDescription>
                Upload PDF, Excel, or image files for automatic processing and analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div 
                className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center space-y-4 hover:border-primary/50 transition-colors cursor-pointer"
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <div className="mx-auto h-12 w-12 text-muted-foreground">
                  <FileText className="h-full w-full" />
                </div>
                <div>
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <span className="text-sm font-medium text-primary hover:text-primary/80">
                      Click to upload
                    </span>
                    <span className="text-sm text-muted-foreground"> or drag and drop</span>
                  </label>
                  <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    accept=".pdf,.xlsx,.xls,.csv,.png,.jpg,.jpeg"
                    onChange={handleFileUpload}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  PDF, Excel, CSV, PNG, or JPEG files up to 10MB
                </p>
              </div>

              {selectedFile && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </AlertDescription>
                </Alert>
              )}

              {isProcessing && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Processing...</span>
                    <span>{processingProgress}%</span>
                  </div>
                  <Progress value={processingProgress} />
                </div>
              )}

              <Button 
                onClick={processFile} 
                disabled={!selectedFile || isProcessing}
                className="w-full"
              >
                {isProcessing ? "Processing..." : "Analyze Financial Data"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Files</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {files.map((file) => (
                  <div key={file.id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{file.file_name}</p>
                        <p className="text-sm text-muted-foreground">
                          Uploaded {new Date(file.upload_date).toLocaleDateString()}
                          {file.bank_id && ` • ${file.bank_id}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={file.processing_status === 'completed' ? 'default' : 'secondary'}>
                          {file.processing_status}
                        </Badge>
                        <div className="flex gap-1">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleViewFile(file)}
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleDownloadFile(file)}
                            title="Download"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleDeleteFile(file.id)}
                            title="Delete"
                            className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Related Data Summary */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div className="text-center p-2 bg-muted/50 rounded">
                        <p className="font-semibold text-primary">{file.transaction_count}</p>
                        <p className="text-muted-foreground">Transactions</p>
                      </div>
                      <div className="text-center p-2 bg-muted/50 rounded">
                        <p className="font-semibold text-green-600">
                          R{Math.abs(file.total_credits || 0).toLocaleString()}
                        </p>
                        <p className="text-muted-foreground">Credits</p>
                      </div>
                      <div className="text-center p-2 bg-muted/50 rounded">
                        <p className="font-semibold text-red-600">
                          R{Math.abs(file.total_debits || 0).toLocaleString()}
                        </p>
                        <p className="text-muted-foreground">Debits</p>
                      </div>
                      <div className="text-center p-2 bg-muted/50 rounded">
                        <p className="font-semibold text-orange-600">{file.issues_count}</p>
                        <p className="text-muted-foreground">Issues</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results">
          {analysisResult ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Analysis Results
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-2xl font-bold text-primary">{analysisResult.transactionsProcessed}</p>
                    <p className="text-sm text-muted-foreground">Transactions Processed</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-2xl font-bold text-green-600">
                      R{analysisResult.summary?.totalCredits?.toLocaleString() || '0'}
                    </p>
                    <p className="text-sm text-muted-foreground">Total Credits</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-2xl font-bold text-red-600">
                      R{Math.abs(analysisResult.summary?.totalDebits || 0).toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">Total Debits</p>
                  </div>
                </div>

                {analysisResult.validationIssues.length > 0 && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      {analysisResult.validationIssues.length} validation issues detected. 
                      Check the Issues tab for details.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">No analysis results yet. Upload a file to get started.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="transactions">
          <TransactionsView />
        </TabsContent>

        <TabsContent value="statements">
          <FinancialStatementsView />
        </TabsContent>

        <TabsContent value="issues">
          <DataIssuesView />
        </TabsContent>

        <TabsContent value="debug">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="text-center p-8">
              <p className="text-muted-foreground">Debug tools for testing upload functionality</p>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Upload Debug Info</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p><strong>Selected File:</strong> {selectedFile?.name || 'None'}</p>
                  <p><strong>File Size:</strong> {selectedFile ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` : 'N/A'}</p>
                  <p><strong>File Type:</strong> {selectedFile?.type || 'N/A'}</p>
                  <p><strong>Processing Status:</strong> {isProcessing ? 'Processing...' : 'Ready'}</p>
                  <p><strong>Progress:</strong> {processingProgress}%</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="schema">
          <ERDiagram />
        </TabsContent>
      </Tabs>
    </div>
  );
};