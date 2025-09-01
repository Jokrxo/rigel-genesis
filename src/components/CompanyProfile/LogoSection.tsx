
import { useState } from "react";
import { Building, FileUp } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface LogoSectionProps {
  previewLogo?: string;
  onLogoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveLogo: () => void;
}

export const LogoSection = ({ previewLogo, onLogoChange, onRemoveLogo }: LogoSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Company Logo</CardTitle>
        <CardDescription>
          Upload your company logo for documents and branding
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="w-32 h-32 rounded-md border border-border flex items-center justify-center overflow-hidden bg-muted/30">
            {previewLogo ? (
              <img
                src={previewLogo}
                alt="Company Logo"
                className="object-contain w-full h-full"
              />
            ) : (
              <Building className="w-16 h-16 text-muted-foreground" />
            )}
          </div>
          <div className="space-y-4 flex-1">
            <div className="space-y-2">
              <Label htmlFor="logo">Company Logo</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="logo"
                  type="file"
                  accept="image/*"
                  onChange={onLogoChange}
                  className="hidden"
                />
                <Label
                  htmlFor="logo"
                  className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border border-border rounded-md hover:bg-accent"
                >
                  <FileUp className="h-4 w-4" />
                  Choose File
                </Label>
                {previewLogo && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onRemoveLogo}
                  >
                    Remove
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Recommended size: 512x512px. Max size: 2MB.
              </p>
            </div>
            <div className="text-sm text-muted-foreground">
              Your logo will appear on invoices, quotations, and your company profile.
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
