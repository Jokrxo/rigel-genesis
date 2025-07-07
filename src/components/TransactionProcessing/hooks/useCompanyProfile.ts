
import { useEffect, useState } from "react";
import { CompanyProfile, defaultProfile } from "@/components/CompanyProfile/types";

/**
 * Returns the company profile for the app.
 * Database fetching is disabled, as 'company_profiles' table does not exist in types.
 */
export function useCompanyProfile(open: boolean) {
  // Use static defaultProfile
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null);

  useEffect(() => {
    if (!open) return;
    // Directly set static data; in future, restore DB logic if table is real.
    setCompanyProfile(defaultProfile);
  }, [open]);

  return companyProfile;
}
