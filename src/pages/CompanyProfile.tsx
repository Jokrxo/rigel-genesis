
import { useState, useEffect } from "react";
import { MainLayout } from "@/components/Layout/MainLayout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { BasicInfoSection } from "@/components/CompanyProfile/BasicInfoSection";
import { ContactSection } from "@/components/CompanyProfile/ContactSection";
import { AddressSection } from "@/components/CompanyProfile/AddressSection";
import { BankingSection } from "@/components/CompanyProfile/BankingSection";
import { LogoSection } from "@/components/CompanyProfile/LogoSection";
import { CompanyProfile } from "@/components/CompanyProfile/types";
import { Chatbot } from "@/components/Shared/Chatbot";

const CompanyProfilePage = () => {
  const { toast } = useToast();
  const [previewLogo, setPreviewLogo] = useState<string>("");
  
  const [profile, setProfile] = useState<CompanyProfile>({
    name: "",
    registrationNumber: "",
    vatNumber: "",
    foundedDate: "",
    description: "",
    contactInfo: {
      phone: "",
      email: "",
      website: "",
    },
    address: {
      street: "",
      city: "",
      province: "Gauteng",
      postalCode: "",
      country: "South Africa",
    },
    bankInfo: {
      bank: "ABSA",
      accountType: "Current Account",
      accountNumber: "",
      branchCode: "",
    },
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
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

  const handleBankChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    setProfile(prev => ({
      ...prev,
      bankInfo: {
        ...prev.bankInfo,
        bank: value
      }
    }));
  };

  const handleAccountTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    setProfile(prev => ({
      ...prev,
      bankInfo: {
        ...prev.bankInfo,
        accountType: value
      }
    }));
  };

  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
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
  };

  const handleSave = () => {
    toast({
      title: "Success",
      description: "Company profile updated successfully",
    });
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Company Profile</h1>
            <p className="text-muted-foreground">Manage your company information and settings</p>
          </div>
          <Button onClick={handleSave}>Save Changes</Button>
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
