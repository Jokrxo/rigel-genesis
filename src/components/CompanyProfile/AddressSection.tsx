
import { MapPin } from "lucide-react";
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

interface AddressSectionProps {
  profile: CompanyProfile;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    section?: string,
    field?: string
  ) => void;
  handleProvinceChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export const AddressSection = ({ profile, handleChange, handleProvinceChange }: AddressSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Address Information</CardTitle>
        <CardDescription>
          Enter your company's physical address details
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="street">Street Address</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="street"
                name="street"
                className="pl-10"
                value={profile.address.street}
                onChange={(e) => handleChange(e, "address", "street")}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              name="city"
              value={profile.address.city}
              onChange={(e) => handleChange(e, "address", "city")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="postalCode">Postal Code</Label>
            <Input
              id="postalCode"
              name="postalCode"
              value={profile.address.postalCode}
              onChange={(e) => handleChange(e, "address", "postalCode")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="province">Province</Label>
            <select
              id="province"
              name="province"
              className="financial-input"
              value={profile.address.province}
              onChange={handleProvinceChange}
            >
              <option value="Eastern Cape">Eastern Cape</option>
              <option value="Free State">Free State</option>
              <option value="Gauteng">Gauteng</option>
              <option value="KwaZulu-Natal">KwaZulu-Natal</option>
              <option value="Limpopo">Limpopo</option>
              <option value="Mpumalanga">Mpumalanga</option>
              <option value="North West">North West</option>
              <option value="Northern Cape">Northern Cape</option>
              <option value="Western Cape">Western Cape</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              name="country"
              value={profile.address.country}
              onChange={(e) => handleChange(e, "address", "country")}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
