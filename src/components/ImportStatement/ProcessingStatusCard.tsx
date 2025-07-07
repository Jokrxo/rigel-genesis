
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import React from "react";

interface ProcessingStatusCardProps {
  uploadProgress: number;
  processingStatus: string | null;
  isUploading: boolean;
}

const ProcessingStatusCard: React.FC<ProcessingStatusCardProps> = ({
  uploadProgress,
  processingStatus,
  isUploading,
}) => (
  <Card>
    <CardHeader>
      <CardTitle>Processing Status</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <Progress value={uploadProgress} className="h-2" />
      <p className="text-sm text-center">
        {isUploading
          ? `Uploading: ${uploadProgress}%`
          : processingStatus}
      </p>
    </CardContent>
  </Card>
);

export default ProcessingStatusCard;
