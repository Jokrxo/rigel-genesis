
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CompanyProfile } from "./types";

interface BankingSectionProps {
  profile: CompanyProfile;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    section?: string,
    field?: string
  ) => void;
  handleBankChange: (value: string) => void;
  handleAccountTypeChange: (value: string) => void;
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
            <Select value={profile.bankInfo.bank} onValueChange={handleBankChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select bank" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ABSA">ABSA</SelectItem>
                <SelectItem value="Capitec Bank">Capitec Bank</SelectItem>
                <SelectItem value="First National Bank">First National Bank</SelectItem>
                <SelectItem value="Nedbank">Nedbank</SelectItem>
                <SelectItem value="Standard Bank">Standard Bank</SelectItem>
                <SelectItem value="Investec">Investec</SelectItem>
                <SelectItem value="Discovery Bank">Discovery Bank</SelectItem>
                <SelectItem value="TymeBank">TymeBank</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="accountType">Account Type</Label>
            <Select value={profile.bankInfo.accountType} onValueChange={handleAccountTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select account type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Current Account">Current Account</SelectItem>
                <SelectItem value="Business Account">Business Account</SelectItem>
                <SelectItem value="Savings Account">Savings Account</SelectItem>
                <SelectItem value="Cheque Account">Cheque Account</SelectItem>
              </SelectContent>
            </Select>
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
