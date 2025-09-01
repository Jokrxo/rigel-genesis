import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Bank {
  id: string;
  name: string;
  logo: string;
}

// South African banks with correctly mapped logos based on your file names
const southAfricanBanks: Bank[] = [
  { id: "absa", name: "ABSA", logo: "/lovable-uploads/absa.jpg" },
  { id: "fnb", name: "First National Bank (FNB)", logo: "/lovable-uploads/fnb.jpg" },
  { id: "standard", name: "Standard Bank", logo: "/lovable-uploads/standard-bank.jpg" },
  { id: "nedbank", name: "Nedbank", logo: "/lovable-uploads/nedbank.jpg" },
  { id: "capitec", name: "Capitec Bank", logo: "/lovable-uploads/capitec-bank.jpg" },
  { id: "investec", name: "Investec", logo: "/lovable-uploads/investec.jpg" },
  { id: "discovery", name: "Discovery Bank", logo: "/lovable-uploads/discovery-bank.jpg" },
  { id: "african", name: "African Bank", logo: "/lovable-uploads/african-bank.jpg" },
  { id: "tyme", name: "TymeBank", logo: "/lovable-uploads/tyme-bank.jpg" },
  { id: "bidvest", name: "Bidvest Bank", logo: "/lovable-uploads/bidvest-bank.jpg" },
  { id: "sasfin", name: "Sasfin Bank", logo: "/lovable-uploads/sasfin.jpg" },
  { id: "ubank", name: "Ubank", logo: "/lovable-uploads/ubank.jpg" },
];

interface BankSelectorProps {
  onSelect: (bank: Bank) => void;
  selectedBankId?: string;
}

export const BankSelector = ({ onSelect, selectedBankId }: BankSelectorProps) => {
  const [open, setOpen] = useState(false);
  const [brokenLogos, setBrokenLogos] = useState<{ [id: string]: boolean }>({});
  const selectedBank = southAfricanBanks.find(bank => bank.id === selectedBankId);

  // Helper to check logo
  const renderLogoBox = (bank: Bank) => (
    <div className="h-8 w-12 flex items-center justify-center bg-background rounded border border-border">
      {!brokenLogos[bank.id] ? (
        <img
          src={bank.logo}
          alt={bank.name}
          className="h-6 w-10 object-contain rounded"
          onError={() =>
            setBrokenLogos((prev) => ({ ...prev, [bank.id]: true }))
          }
        />
      ) : (
        // Show blank box when logo is broken or missing (matches reference image)
        null
      )}
    </div>
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-12"
        >
          {selectedBank ? (
            <div className="flex items-center gap-3">
              {renderLogoBox(selectedBank)}
              <span>{selectedBank.name}</span>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="h-8 w-12 flex items-center justify-center bg-background rounded border border-border" />
              <span>Select your bank...</span>
            </div>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0 z-50">
        <Command>
          <CommandInput placeholder="Search bank..." />
          <CommandList>
            <CommandEmpty>No bank found.</CommandEmpty>
            <CommandGroup heading="South African Banks">
              {southAfricanBanks.map((bank) => (
                <CommandItem
                  key={bank.id}
                  value={bank.name}
                  onSelect={() => {
                    onSelect(bank);
                    setOpen(false);
                  }}
                  className="py-3"
                >
                  <div className="flex items-center gap-3 w-full">
                    {renderLogoBox(bank)}
                    <span className="font-medium">{bank.name}</span>
                  </div>
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      selectedBankId === bank.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
