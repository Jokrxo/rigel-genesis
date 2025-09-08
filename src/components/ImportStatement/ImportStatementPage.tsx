import { useState, useEffect } from "react";
import { BankSelector } from "@/components/Shared/BankSelector";
import StatementUploadCard from "./StatementUploadCard";
import ProcessingStatusCard from "./ProcessingStatusCard";
import ImportCompleteCard from "./ImportCompleteCard";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Bank {
  id: string;
  name: string;
  logo: string;
}

const ImportStatementPage = () => {
  const [selectedBankId, setSelectedBankId] = useState<string>();
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingStatus, setProcessingStatus] = useState<string | null>(null);
  const [isProcessingComplete, setIsProcessingComplete] = useState(false);
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Use useEffect for async call on mount (fix session timing)
  useEffect(() => {
    let cancelled = false;
    setAuthLoading(true);
    supabase.auth.getUser().then((res) => {
      if (!cancelled) {
        setUserId(res.data?.user?.id ?? null);
        setAuthLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, []);

  const handleBankSelect = (bank: Bank) => {
    setSelectedBankId(bank.id);
  };

  const handlePdfFileChange = (file: File | null) => {
    setPdfFile(file);
  };

  const handleExcelFileChange = (file: File | null) => {
    setExcelFile(file);
  };

  const handleUpload = async (fileType: "pdf" | "excel") => {
    const selectedFile = fileType === "pdf" ? pdfFile : excelFile;

    if (!selectedBankId) {
      toast({
        title: "Bank Required",
        description: "Please select your bank before uploading a file.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedFile) {
      toast({
        title: "No File Selected",
        description: `Please select a ${fileType.toUpperCase()} file to upload.`,
        variant: "destructive",
      });
      return;
    }

    if (authLoading) {
      toast({
        title: "Just a moment",
        description: "Still checking login status. Please try again in a second.",
        variant: "destructive",
      });
      return;
    }
    if (!userId) {
      toast({
        title: "Not authenticated",
        description: "You must be logged in to upload statements.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      setProcessingStatus("Uploading to secure storage...");
      const { uploadStatementFile } = await import("@/utils/uploadToSupabase");
      const fileUrl = await uploadStatementFile(selectedFile, userId);

      setUploadProgress(25);
      setProcessingStatus("Registering statement in database...");

      const { data: statement, error } = await supabase
        .from("bank_statements")
        .insert({
          user_id: userId,
          bank_id: selectedBankId,
          file_url: fileUrl,
          file_type: fileType,
          processing_status: "pending",
        })
        .select()
        .single();

      if (error || !statement)
        throw error || new Error("Failed to register statement.");

      setUploadProgress(40);
      setProcessingStatus("Processing transactions...");

      const { data: processResult, error: processError } = await supabase.functions.invoke('process-statement', {
        body: {
          statement_id: statement.id,
          user_id: userId,
        }
      });
      
      if (processError) {
        throw new Error(processError.message || 'Processing failed');
      }
      
      if (!processResult?.success) {
        throw new Error(processResult?.error || 'Processing failed');
      }

      setUploadProgress(90);
      setProcessingStatus("Processing complete! Refreshing data...");
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(100);
        setProcessingStatus(null);
        setIsProcessingComplete(true);
        toast({
          title: "Import Complete",
          description: "Your bank statement was successfully processed.",
        });
      }, 1300);
    } catch (err) {
      setIsUploading(false);
      setProcessingStatus(null);
      toast({
        title: "Upload failed",
        description:
          err instanceof Error ? err.message : "An unknown error occurred.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Import Bank Statement</h1>
        <p className="text-muted-foreground">
          Upload your bank statement to generate financial reports
        </p>
      </div>

      <div>
        <div className="mb-6">
          <BankSelector
            onSelect={handleBankSelect}
            selectedBankId={selectedBankId}
          />
        </div>

        <StatementUploadCard
          tab="pdf"
          file={pdfFile}
          onFileChange={handlePdfFileChange}
          isUploading={isUploading}
          isProcessingComplete={isProcessingComplete}
          onUpload={() => handleUpload("pdf")}
        />
        <div className="my-4" />
        <StatementUploadCard
          tab="excel"
          file={excelFile}
          onFileChange={handleExcelFileChange}
          isUploading={isUploading}
          isProcessingComplete={isProcessingComplete}
          onUpload={() => handleUpload("excel")}
        />
      </div>

      {(isUploading || uploadProgress > 0 || processingStatus) && (
        <ProcessingStatusCard
          uploadProgress={uploadProgress}
          processingStatus={processingStatus}
          isUploading={isUploading}
        />
      )}

      {isProcessingComplete && <ImportCompleteCard />}
    </div>
  );
};

export default ImportStatementPage;
