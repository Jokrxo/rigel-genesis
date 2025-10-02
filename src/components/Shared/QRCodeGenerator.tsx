
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QrCode, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const QRCodeGenerator = () => {
  const [url, setUrl] = useState("https://www.sa-financial-insight.com/register");
  const [qrCodeImage, setQrCodeImage] = useState("");
  const { toast } = useToast();
  const qrImageRef = useRef<HTMLImageElement>(null);
  
  // Generate QR code whenever URL changes
  useEffect(() => {
    // Using a more reliable QR code API with proper error handling
    try {
      const encodedUrl = encodeURIComponent(url);
      const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodedUrl}&margin=15&format=png&ecc=H`;
      setQrCodeImage(qrApiUrl);
    } catch (error) {
      console.error("Failed to generate QR code URL:", error);
      toast({
        title: "QR Code Error",
        description: "Unable to generate QR code. Please check the URL.",
        variant: "destructive"
      });
    }
  }, [url, toast]);

  const downloadQRCode = () => {
    if (!qrImageRef.current) return;
    
    // Create a temporary link to download the image
    const link = document.createElement("a");
    link.href = qrCodeImage;
    link.download = "rigel-qrcode.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "QR Code Downloaded",
      description: "QR Code has been saved to your device",
    });
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5" />
          <span>QR Code Generator</span>
        </CardTitle>
        <CardDescription>
          Generate a QR code that links to your registration page
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="url">URL</Label>
          <Input
            id="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter URL"
          />
        </div>
        <div className="flex justify-center py-4">
          {qrCodeImage ? (
            <img
              ref={qrImageRef}
              src={qrCodeImage}
              alt="QR Code for sharing"
              className="h-64 w-64 border-2 border-border rounded-lg shadow-sm bg-white p-2"
              onError={(e) => {
                // Single fallback attempt with better API
                const fallbackUrl = `https://quickchart.io/qr?text=${encodeURIComponent(url)}&size=400&margin=2&ecLevel=H`;
                if (e.currentTarget.src !== fallbackUrl) {
                  e.currentTarget.src = fallbackUrl;
                } else {
                  toast({
                    title: "QR Code Generation Failed",
                    description: "Please verify the URL and try again",
                    variant: "destructive"
                  });
                }
              }}
              loading="lazy"
            />
          ) : (
            <div className="h-64 w-64 border-2 border-dashed border-border rounded-lg flex items-center justify-center">
              <p className="text-muted-foreground text-sm">Loading QR code...</p>
            </div>
          )}
        </div>
        <Button onClick={downloadQRCode} className="w-full">
          <Download className="mr-2 h-4 w-4" />
          Download QR Code
        </Button>
      </CardContent>
    </Card>
  );
};
