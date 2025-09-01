
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUp, Upload, File } from "lucide-react";
import React from "react";

interface StatementUploadCardProps {
  tab: "pdf" | "excel";
  file: File | null;
  onFileChange: (file: File | null) => void;
  isUploading: boolean;
  isProcessingComplete: boolean;
  onUpload: () => void;
}

const TAB_CONFIG = {
  pdf: {
    label: "PDF Statement",
    description: "Import your bank statement in PDF format",
    accept: ".pdf",
    toast: "PDF (MAX. 10MB)",
  },
  excel: {
    label: "Excel Statement",
    description: "Import your bank statement in Excel format",
    accept: ".xlsx,.xls",
    toast: "XLSX, XLS (MAX. 10MB)",
  },
};

const StatementUploadCard: React.FC<StatementUploadCardProps> = ({
  tab,
  file,
  onFileChange,
  isUploading,
  isProcessingComplete,
  onUpload,
}) => {
  const { label, description, accept, toast } = TAB_CONFIG[tab];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload {label}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-center w-full">
          <label
            htmlFor={`${tab}-upload`}
            className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/80 border-border"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <FileUp className="w-12 h-12 text-muted-foreground" />
              <p className="mb-2 text-sm text-muted-foreground mt-2">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-muted-foreground">{toast}</p>
              {file && (
                <div className="mt-4 text-center">
                  <div className="flex items-center gap-2 mt-2 text-primary">
                    <File className="w-4 h-4" />
                    <span className="text-sm font-medium">{file.name}</span>
                  </div>
                </div>
              )}
            </div>
            <input
              id={`${tab}-upload`}
              type="file"
              accept={accept}
              className="hidden"
              onChange={(e) =>
                onFileChange(
                  e.target.files && e.target.files[0] ? e.target.files[0] : null
                )
              }
              disabled={isUploading || isProcessingComplete}
            />
          </label>
        </div>
        <Button
          className="w-full mt-4"
          onClick={onUpload}
          disabled={!file || isUploading || isProcessingComplete}
        >
          {isUploading ? (
            <div className="flex items-center gap-2">
              <span>Uploading...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              <span>Upload {label}</span>
            </div>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default StatementUploadCard;
