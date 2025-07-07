import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { FileText, Wand2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Loading } from "@/components/ui/loading";

interface GeneratedDocument {
  title: string;
  content: string;
  metadata: Record<string, unknown>;
  lineItems: Array<{
    description: string;
    quantity: number;
    rate: number;
    amount: number;
  }>;
  totals: Record<string, number | string>;
}

export const SmartDocumentGenerator = () => {
  const [documentType, setDocumentType] = useState("");
  const [description, setDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDocument, setGeneratedDocument] = useState<GeneratedDocument | null>(null);
  const { toast } = useToast();

  const generateDocument = async () => {
    if (!documentType || !description.trim()) {
      toast({
        title: "Missing Information",
        description: "Please select a document type and provide a description.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke('smart-document-generator', {
        body: { 
          description,
          documentType,
          companyInfo: {
            name: "Your Company Name",
            vatNumber: "VAT123456789",
            address: "123 Business Street, Cape Town, 8001",
            phone: "021 123 4567",
            email: "info@company.co.za"
          }
        }
      });

      if (error) throw error;

      setGeneratedDocument(data);
      toast({
        title: "Document Generated",
        description: `Your ${documentType} has been generated successfully!`,
      });
    } catch (error) {
      console.error('Error generating document:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-financial-600" />
            AI Document Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="financial-label">Document Type</label>
            <Select value={documentType} onValueChange={setDocumentType}>
              <SelectTrigger>
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="invoice">Invoice</SelectItem>
                <SelectItem value="quotation">Quotation</SelectItem>
                <SelectItem value="contract">Contract</SelectItem>
                <SelectItem value="proposal">Business Proposal</SelectItem>
                <SelectItem value="receipt">Receipt</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="financial-label">Description</label>
            <Textarea
              placeholder="Describe what you need... e.g., 'Invoice for web development services, 40 hours at R500/hour, for ABC Company, due in 30 days'"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>

          <Button 
            onClick={generateDocument} 
            disabled={isGenerating || !documentType || !description.trim()}
            className="w-full"
          >
            {isGenerating ? (
              <Loading size="sm" text="Generating..." />
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4" />
                Generate Document
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {generatedDocument && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-financial-600" />
              {generatedDocument.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: generatedDocument.content }}
            />
            {generatedDocument.totals && Object.keys(generatedDocument.totals).length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <h4 className="font-medium mb-2">Financial Summary:</h4>
                <div className="space-y-1 text-sm">
                  {Object.entries(generatedDocument.totals).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                      <span>R {typeof value === 'number' ? value.toFixed(2) : String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="mt-4 flex gap-2">
              <Button variant="outline" size="sm">
                Edit Document
              </Button>
              <Button size="sm">
                Save to Documents
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
