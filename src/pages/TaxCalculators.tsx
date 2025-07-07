
import { MainLayout } from "@/components/Layout/MainLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import VATCalculator from "@/components/TaxCalculators/VATCalculator";
import IncomeTaxCalculator from "@/components/TaxCalculators/IncomeTaxCalculator";
import DeferredTaxCalculator from "@/components/TaxCalculators/DeferredTaxCalculator";
import DepreciationCalculator from "@/components/TaxCalculators/DepreciationCalculator";
import { Calculator, Receipt, TrendingUp, Package } from "lucide-react";
import { Chatbot } from "@/components/Shared/Chatbot";

const TaxCalculators = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Tax Calculators</h1>
          <p className="text-muted-foreground">
            Calculate VAT, income tax, deferred tax, and depreciation
          </p>
        </div>

        <Tabs defaultValue="vat" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="vat" className="flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              VAT Calculator
            </TabsTrigger>
            <TabsTrigger value="income" className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Income Tax
            </TabsTrigger>
            <TabsTrigger value="deferred" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Deferred Tax
            </TabsTrigger>
            <TabsTrigger value="depreciation" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Depreciation
            </TabsTrigger>
          </TabsList>

          <TabsContent value="vat">
            <Card>
              <CardHeader>
                <CardTitle>VAT Calculator</CardTitle>
                <CardDescription>
                  Calculate Value Added Tax for your transactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <VATCalculator />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="income">
            <Card>
              <CardHeader>
                <CardTitle>Income Tax Calculator</CardTitle>
                <CardDescription>
                  Calculate income tax based on South African tax tables
                </CardDescription>
              </CardHeader>
              <CardContent>
                <IncomeTaxCalculator />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="deferred">
            <Card>
              <CardHeader>
                <CardTitle>Deferred Tax Calculator</CardTitle>
                <CardDescription>
                  Calculate deferred tax assets and liabilities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DeferredTaxCalculator />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="depreciation">
            <Card>
              <CardHeader>
                <CardTitle>Depreciation Calculator</CardTitle>
                <CardDescription>
                  Calculate asset depreciation using different methods
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DepreciationCalculator />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <Chatbot />
    </MainLayout>
  );
};

export default TaxCalculators;
