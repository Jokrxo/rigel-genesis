
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
import { supabase } from "@/integrations/supabase/client";

const CompanyProfilePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [previewLogo, setPreviewLogo] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [entityId, setEntityId] = useState<string | null>(null);
  
  const [profile, setProfile] = useState<CompanyProfile>(defaultProfile);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('entities').select('*').limit(1).single();
      
      if (error) {
        // If no rows, use default
        if (error.code === 'PGRST116') return; 
        console.error('Error fetching profile:', error);
        return;
      }

      if (data) {
        setEntityId(data.id);
        
        // Parse address
        let addressObj = defaultProfile.address;
        if (data.address) {
            try {
                const parsed = JSON.parse(data.address);
                if (typeof parsed === 'object') addressObj = { ...addressObj, ...parsed };
            } catch {
                // If simple string, assume street
                addressObj = { ...addressObj, street: data.address };
            }
        }

        // Parse contact info
        let contactObj = defaultProfile.contactInfo;
        if (data.contact_info) {
             const parsed = typeof data.contact_info === 'string' ? JSON.parse(data.contact_info) : data.contact_info;
             contactObj = { ...contactObj, ...parsed };
        }

        // Parse bank info
        let bankObj = defaultProfile.bankInfo;
        if (data.bank_info) {
             const parsed = typeof data.bank_info === 'string' ? JSON.parse(data.bank_info) : data.bank_info;
             bankObj = { ...bankObj, ...parsed };
        }

        setProfile({
            name: data.name || '',
            registrationNumber: data.registration_number || '',
            vatNumber: data.vat_number || '',
            foundedDate: data.founded_date ? new Date(data.founded_date).toISOString().split('T')[0] : '',
            ownership: data.ownership as any || 'sole',
            inventorySystem: (data.inventory_system as any) || 'periodic',
            description: data.description || '',
            address: addressObj,
            contactInfo: contactObj,
            bankInfo: bankObj,
            logoUrl: data.logo_url || ''
        });
        
        if (data.logo_url) setPreviewLogo(data.logo_url);
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
        // In a real app, upload to storage here and set logoUrl
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
        const dbEntity = {
            name: profile.name,
            registration_number: profile.registrationNumber,
            vat_number: profile.vatNumber,
            founded_date: profile.foundedDate || null,
            ownership: profile.ownership,
            inventory_system: profile.inventorySystem,
            description: profile.description,
            address: JSON.stringify(profile.address),
            contact_info: profile.contactInfo, // Supabase handles JSON object if column is JSON
            bank_info: profile.bankInfo,
            logo_url: profile.logoUrl
        };

        let result;
        if (entityId) {
            result = await supabase.from('entities').update(dbEntity).eq('id', entityId);
        } else {
            result = await supabase.from('entities').insert(dbEntity);
        }

        if (result.error) throw result.error;

        toast({
            title: "Success",
            description: "Company profile updated successfully",
        });
        
        // Refresh to get ID if inserted
        if (!entityId) fetchProfile();

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
