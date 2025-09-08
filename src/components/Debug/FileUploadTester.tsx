import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileText, CheckCircle, AlertCircle, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const FileUploadTester = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadResult(null);
      setUploadError(null);
    }
  };

  const testUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadError(null);
    setUploadResult(null);

    try {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { uploadStatementFile } = await import('@/utils/uploadToSupabase');
      const fileUrl = await uploadStatementFile(selectedFile, user.id);
      
      setUploadResult(fileUrl);
      toast({
        title: "Upload Successful",
        description: "File uploaded successfully!",
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setUploadError(errorMessage);
      toast({
        title: "Upload Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const resetTest = () => {
    setSelectedFile(null);
    setUploadResult(null);
    setUploadError(null);
    const fileInput = document.getElementById('test-file-input') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Test
        </CardTitle>
        <CardDescription>
          Test the file upload functionality
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="test-file-input" className="text-sm font-medium">
            Select a file to test upload:
          </label>
          <input
            id="test-file-input"
            type="file"
            accept=".pdf,.xlsx,.xls,.csv,.png,.jpg,.jpeg"
            onChange={handleFileSelect}
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
          />
        </div>

        {selectedFile && (
          <Alert>
            <FileText className="h-4 w-4" />
            <AlertDescription>
              Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
            </AlertDescription>
          </Alert>
        )}

        {uploadResult && (
          <Alert>
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertDescription className="text-green-700">
              Upload successful! File URL: {uploadResult.substring(0, 50)}...
            </AlertDescription>
          </Alert>
        )}

        {uploadError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Upload failed: {uploadError}
            </AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2">
          <Button 
            onClick={testUpload} 
            disabled={!selectedFile || isUploading}
            className="flex-1"
          >
            {isUploading ? "Uploading..." : "Test Upload"}
          </Button>
          <Button 
            variant="outline" 
            onClick={resetTest}
            disabled={isUploading}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};