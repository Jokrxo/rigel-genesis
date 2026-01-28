
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/Layout/MainLayout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { BasicInfoSection } from "@/components/CompanyProfile/BasicInfoSection";
import { ContactSection } from "@/components/CompanyProfile/ContactSection";
import { AddressSection } from "@/components/CompanyProfile/AddressSection";
import { BankingSection } from "@/components/CompanyProfile/BankingSection";
import { LogoSection } from "@/components/CompanyProfile/LogoSection";
import { CompanyProfile, defaultProfile } from "@/components/CompanyProfile/types";
import { Chatbot } from "@/components/Shared/Chatbot";

const STORAGE_KEY = 'rigel_company_profile';

const CompanyProfilePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [previewLogo, setPreviewLogo] = useState<string>("");
  const [loading, setLoading] = useState(false);
  
  const [profile, setProfile] = useState<CompanyProfile>(defaultProfile);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setProfile(parsed);
        if (parsed.logoUrl) setPreviewLogo(parsed.logoUrl);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { name: string; value: any } },
    section?: string,
    field?: string
  ) => {
    const { name, value } = e.target;
    
    if (section && field) {
      setProfile(prev => ({
        ...prev,
        [section]: {
          ...(prev[section as keyof CompanyProfile] as object),
          [field]: value
        }
      }));
    } else {
      setProfile(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleBankChange = (value: string) => {
    setProfile(prev => ({
      ...prev,
      bankInfo: {
        ...prev.bankInfo,
        bank: value
      }
    }));
  };

  const handleAccountTypeChange = (value: string) => {
    setProfile(prev => ({
      ...prev,
      bankInfo: {
        ...prev.bankInfo,
        accountType: value
      }
    }));
  };

  const handleProvinceChange = (value: string) => {
    setProfile(prev => ({
      ...prev,
      address: {
        ...prev.address,
        province: value
      }
    }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setPreviewLogo("");
    setProfile(prev => ({ ...prev, logoUrl: "" }));
  };

  const handleSave = async () => {
    try {
      const profileToSave = { ...profile, logoUrl: previewLogo };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profileToSave));
      setProfile(profileToSave);

      toast({
        title: "Success",
        description: "Company profile updated successfully",
      });
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "Error",
        description: "Failed to save profile",
        variant: "destructive"
      });
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Company Profile</h1>
            <p className="text-muted-foreground">Manage your company information and settings</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/signup-wizard')}>Back to Wizard</Button>
            <Button onClick={handleSave} disabled={loading}>
                {loading ? 'Loading...' : 'Save Changes'}
            </Button>
          </div>
        </div>

        <div className="grid gap-6">
          <BasicInfoSection 
            profile={profile} 
            handleChange={handleChange} 
          />
          
          <ContactSection 
            profile={profile} 
            handleChange={handleChange} 
          />
          
          <AddressSection
            profile={profile}
            handleChange={handleChange}
            handleProvinceChange={handleProvinceChange}
          />
          
          <BankingSection
            profile={profile}
            handleChange={handleChange}
            handleBankChange={handleBankChange}
            handleAccountTypeChange={handleAccountTypeChange}
          />
          
          <LogoSection
            previewLogo={previewLogo}
            onLogoChange={handleLogoChange}
            onRemoveLogo={handleRemoveLogo}
          />
        </div>
      </div>
      <Chatbot />
    </MainLayout>
  );
};

export default CompanyProfilePage;
