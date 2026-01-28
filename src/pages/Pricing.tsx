
import { MainLayout } from "@/components/Layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";

interface PricingTier {
  name: string;
  description: string;
  price: string;
  currency: string;
  billingCycle: string;
  features: string[];
  buttonText: string;
  buttonVariant: "default" | "outline";
  highlighted?: boolean;
}

const pricingTiers: PricingTier[] = [
  {
    name: "Bronze",
    description: "Essential tools for small businesses",
    price: "299",
    currency: "R",
    billingCycle: "/month",
    features: [
      "Basic financial statements",
      "Limited transactions (100/month)",
      "Single user access",
      "Email support",
      "Basic tax calculator"
    ],
    buttonText: "Get Started",
    buttonVariant: "outline"
  },
  {
    name: "Silver",
    description: "Perfect for growing businesses",
    price: "499",
    currency: "R",
    billingCycle: "/month",
    features: [
      "All Bronze features",
      "Advanced financial statements",
      "500 transactions/month",
      "2 user accounts",
      "Basic inventory management",
      "Email & phone support"
    ],
    buttonText: "Get Started",
    buttonVariant: "outline"
  },
  {
    name: "Gold",
    description: "Comprehensive solution for established businesses",
    price: "550",
    currency: "R",
    billingCycle: "/month",
    features: [
      "All Silver features",
      "Unlimited transactions",
      "5 user accounts",
      "Full tax management system",
      "Advanced inventory management",
      "Priority support",
      "Data export functionality"
    ],
    buttonText: "Get Started",
    buttonVariant: "default",
    highlighted: true
  },
  {
    name: "Platinum",
    description: "Advanced features for larger businesses",
    price: "1,499",
    currency: "R",
    billingCycle: "/month",
    features: [
      "All Gold features",
      "Unlimited users",
      "Custom branding",
      "API access",
      "Advanced analytics",
      "Dedicated account manager",
      "Bulk document processing"
    ],
    buttonText: "Contact Sales",
    buttonVariant: "outline"
  },
  {
    name: "Diamond",
    description: "Enterprise-grade solution with custom pricing",
    price: "Custom",
    currency: "",
    billingCycle: "",
    features: [
      "All Platinum features",
      "Custom integrations",
      "On-premise deployment option",
      "White-labeling",
      "24/7 premium support",
      "Training sessions",
      "Tailored financial reporting"
    ],
    buttonText: "Contact Sales",
    buttonVariant: "outline"
  }
];

const Pricing = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Pricing Plans</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto text-justify">
            Choose the perfect plan for your business needs. All plans include access to the Rigel platform.
            Payment can be made via Paytiko.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {pricingTiers.map((tier) => (
            <Card 
              key={tier.name} 
              className={cn(
                "flex flex-col", 
                tier.highlighted 
                  ? "border-primary shadow-lg shadow-primary/20 relative overflow-hidden" 
                  : ""
              )}
            >
              {tier.highlighted && (
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-bl-lg">
                  Most Popular
                </div>
              )}
              <CardHeader>
                <CardTitle>{tier.name}</CardTitle>
                <CardDescription>{tier.description}</CardDescription>
                <div className="mt-4">
                  <div className="flex items-baseline">
                    <span className="text-3xl font-bold">{tier.currency}{tier.price}</span>
                    <span className="ml-1 text-sm text-muted-foreground">{tier.billingCycle}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-2">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start">
                      <Check className="h-5 w-5 text-primary mr-2 shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  variant={tier.buttonVariant}
                  className={cn("w-full", tier.highlighted ? "bg-primary hover:bg-primary/90 text-primary-foreground" : "")}
                >
                  {tier.buttonText}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-sm text-muted-foreground">
            All prices are in South African Rand (ZAR). VAT included where applicable.
          </p>
          <p className="text-sm text-muted-foreground mt-1 text-justify">
            Need a custom solution? <a href="mailto:luthando@stella-lumen.com" className="text-primary hover:underline">Contact our sales team</a>
          </p>
        </div>
      </div>
    </MainLayout>
  );
};

// Helper function for conditional className merging
const cn = (...classes: (string | boolean | undefined)[]) => {
  return classes.filter(Boolean).join(' ');
};

export default Pricing;
