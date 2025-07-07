
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CompanyProfile } from "./types";

interface BankingSectionProps {
  profile: CompanyProfile;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    section?: string,
    field?: string
  ) => void;
  handleBankChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleAccountTypeChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export const BankingSection = ({ 
  profile, 
  handleChange,
  handleBankChange,
  handleAccountTypeChange 
}: BankingSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Banking Information</CardTitle>
        <CardDescription>
          Enter your company's banking details for invoices
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="bank">Bank Name</Label>
            <select
              id="bank"
              name="bank"
              className="financial-input"
              value={profile.bankInfo.bank}
              onChange={handleBankChange}
            >
              <option value="ABSA">ABSA</option>
              <option value="Capitec Bank">Capitec Bank</option>
              <option value="First National Bank">First National Bank</option>
              <option value="Nedbank">Nedbank</option>
              <option value="Standard Bank">Standard Bank</option>
              <option value="Investec">Investec</option>
              <option value="Discovery Bank">Discovery Bank</option>
              <option value="TymeBank">TymeBank</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="accountType">Account Type</Label>
            <select
              id="accountType"
              name="accountType"
              className="financial-input"
              value={profile.bankInfo.accountType}
              onChange={handleAccountTypeChange}
            >
              <option value="Current Account">Current Account</option>
              <option value="Business Account">Business Account</option>
              <option value="Savings Account">Savings Account</option>
              <option value="Cheque Account">Cheque Account</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="accountNumber">Account Number</Label>
            <Input
              id="accountNumber"
              name="accountNumber"
              value={profile.bankInfo.accountNumber}
              onChange={(e) => handleChange(e, "bankInfo", "accountNumber")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="branchCode">Branch Code</Label>
            <Input
              id="branchCode"
              name="branchCode"
              value={profile.bankInfo.branchCode}
              onChange={(e) => handleChange(e, "bankInfo", "branchCode")}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
