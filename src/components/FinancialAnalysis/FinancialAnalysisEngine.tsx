import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, BarChart3, AlertTriangle, CheckCircle } from "lucide-react";
import { TransactionsView } from "./TransactionsView";
import { FinancialStatementsView } from "./FinancialStatementsView";
import { DataIssuesView } from "./DataIssuesView";
import { ERDiagram } from "./ERDiagram";

interface FileData {
  id: string;
  file_name: string;
  file_type: string;
  processing_status: string;
  upload_date: string;
  processing_metadata?: any;
}

interface AnalysisResult {
  success: boolean;
  fileId: string;
  transactionsProcessed: number;
  summary: any;
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
  }, []);

  const fetchFiles = async () => {
    const { data, error } = await supabase
      .from('files')
      .select('*')
      .order('upload_date', { ascending: false });

    if (error) {
      console.error('Error fetching files:', error);
      return;
    }

    setFiles(data || []);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['application/pdf', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'image/png', 'image/jpeg'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a PDF, Excel file, or image (PNG/JPEG)",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
  };

  const processFile = async () => {
    if (!selectedFile) return;

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
      const response = await supabase.functions.invoke('financial-analysis-engine', {
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
          <TabsTrigger value="schema">Schema</TabsTrigger>
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
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center space-y-4">
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
                    accept=".pdf,.xlsx,.xls,.png,.jpg,.jpeg"
                    onChange={handleFileUpload}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  PDF, Excel, PNG, or JPEG files up to 10MB
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
                  <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{file.file_name}</p>
                      <p className="text-sm text-muted-foreground">
                        Uploaded {new Date(file.upload_date).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant={file.processing_status === 'completed' ? 'default' : 'secondary'}>
                      {file.processing_status}
                    </Badge>
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

        <TabsContent value="schema">
          <ERDiagram />
        </TabsContent>
      </Tabs>
    </div>
  );
};