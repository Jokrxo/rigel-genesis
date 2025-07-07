export interface CompanyProfile {
  name: string;
  registrationNumber: string;
  vatNumber: string;
  foundedDate: string;
  address: {
    street: string;
    city: string;
    postalCode: string;
    province: string;
    country: string;
  };
  contactInfo: {
    phone: string;
    email: string;
    website: string;
  };
  bankInfo: {
    bank: string;
    accountNumber: string;
    branchCode: string;
    accountType: string;
  };
  logoUrl?: string;
  description: string;
}

export const defaultProfile: CompanyProfile = {
  name: "SA Financial Solutions",
  registrationNumber: "2020/123456/07",
  vatNumber: "4560123456",
  foundedDate: "2020-01-15",
  address: {
    street: "123 Financial Avenue",
    city: "Cape Town",
    postalCode: "8001",
    province: "Western Cape",
    country: "South Africa",
  },
  contactInfo: {
    phone: "021 555 1234",
    email: "info@safinancials.co.za",
    website: "www.safinancials.co.za",
  },
  bankInfo: {
    bank: "First National Bank",
    accountNumber: "62345678910",
    branchCode: "250655",
    accountType: "Business Account",
  },
  logoUrl: "/lovable-uploads/globe.png",
  description:
    "A leading financial solutions provider based in South Africa. We specialize in accounting, taxation, and financial management services for SMEs across various industries.",
};
