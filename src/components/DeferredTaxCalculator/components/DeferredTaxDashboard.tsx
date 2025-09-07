import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Download, Settings, Plus, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { DeferredTaxProject, DeferredTaxCategory, TaxLossCarryForward, DeferredTaxSummary, CategoryType } from '../types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DeferredTaxDashboardProps {
  project: DeferredTaxProject;
  onBack: () => void;
}

export const DeferredTaxDashboard: React.FC<DeferredTaxDashboardProps> = ({
  project,
  onBack,
}) => {
  const [categories, setCategories] = useState<DeferredTaxCategory[]>([]);
  const [taxLosses, setTaxLosses] = useState<TaxLossCarryForward[]>([]);
  const [summary, setSummary] = useState<DeferredTaxSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();

  const fetchProjectData = async () => {
    setLoading(true);
    try {
      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('deferred_tax_categories')
        .select('*')
        .eq('project_id', project.id)
        .order('created_at');

      if (categoriesError) throw categoriesError;

      // Fetch tax losses
      const { data: lossesData, error: lossesError } = await supabase
        .from('tax_loss_carry_forwards')
        .select('*')
        .eq('project_id', project.id)
        .order('created_at');

      if (lossesError) throw lossesError;

      setCategories((categoriesData || []) as DeferredTaxCategory[]);
      setTaxLosses((lossesData || []) as TaxLossCarryForward[]);

      // Calculate summary
      calculateSummary((categoriesData || []) as DeferredTaxCategory[], (lossesData || []) as TaxLossCarryForward[]);
    } catch (error) {
      console.error('Error fetching project data:', error);
      toast({
        title: "Error",
        description: "Failed to load project data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateSummary = (cats: DeferredTaxCategory[], losses: TaxLossCarryForward[]) => {
    const totalDTA = cats.reduce((sum, cat) => sum + cat.deferred_tax_asset, 0) +
                     losses.reduce((sum, loss) => sum + loss.deferred_tax_asset, 0);
    const totalDTL = cats.reduce((sum, cat) => sum + cat.deferred_tax_liability, 0);

    const byCategory: { category_type: CategoryType; dta: number; dtl: number; }[] = Object.values(
      cats.reduce((acc: Record<string, { category_type: CategoryType; dta: number; dtl: number; }>, cat) => {
        if (!acc[cat.category_type]) {
          acc[cat.category_type] = {
            category_type: cat.category_type,
            dta: 0,
            dtl: 0,
          };
        }
        acc[cat.category_type].dta += cat.deferred_tax_asset;
        acc[cat.category_type].dtl += cat.deferred_tax_liability;
        return acc;
      }, {})
    );

    // Add tax losses to the summary
    if (losses.length > 0) {
      byCategory.push({
        category_type: 'tax_losses' as const,
        dta: losses.reduce((sum, loss) => sum + loss.deferred_tax_asset, 0),
        dtl: 0,
      });
    }

    const byEntity: { entity_name: string; dta: number; dtl: number; }[] = project.multi_entity 
      ? Object.values(
          [...cats, ...losses].reduce((acc: Record<string, { entity_name: string; dta: number; dtl: number; }>, item) => {
            const entityName = item.entity_name || 'Main Entity';
            if (!acc[entityName]) {
              acc[entityName] = { entity_name: entityName, dta: 0, dtl: 0 };
            }
            acc[entityName].dta += 'deferred_tax_asset' in item ? item.deferred_tax_asset : 0;
            acc[entityName].dtl += 'deferred_tax_liability' in item ? item.deferred_tax_liability : 0;
            return acc;
          }, {})
        )
      : [];

    setSummary({
      total_dta: totalDTA,
      total_dtl: totalDTL,
      net_position: totalDTA - totalDTL,
      by_category: byCategory,
      by_entity: byEntity,
    });
  };

  useEffect(() => {
    fetchProjectData();
  }, [project.id]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: project.reporting_currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getCategoryTypeLabel = (type: string) => {
    const labels = {
      temporary_taxable: 'Temporary Taxable',
      temporary_deductible: 'Temporary Deductible',
      tax_losses: 'Tax Loss Carry Forwards',
      initial_recognition: 'Initial Recognition',
      uncertain_positions: 'Uncertain Tax Positions',
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getNetPositionIcon = (netPosition: number) => {
    if (netPosition > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (netPosition < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-muted rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <Button variant="ghost" onClick={onBack} className="flex items-center gap-2 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Projects
          </Button>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">{project.name}</h1>
            <Badge variant="secondary" className="text-sm">
              {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            {project.country?.name} • Tax Year {project.tax_year} • {project.reporting_currency}
            {project.multi_entity && ' • Multi-Entity'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total DTA
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(summary.total_dta)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total DTL
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(summary.total_dtl)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Net Position
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {getNetPositionIcon(summary.net_position)}
                <span className="text-2xl font-bold">
                  {formatCurrency(Math.abs(summary.net_position))}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {summary.net_position > 0 ? 'Net Asset' : summary.net_position < 0 ? 'Net Liability' : 'Balanced'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {categories.length + taxLosses.length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {categories.length} categories, {taxLosses.length} tax losses
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="losses">Tax Losses</TabsTrigger>
          <TabsTrigger value="movements">Movements</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {summary && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* By Category Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Breakdown by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {summary.by_category.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-muted/50 rounded">
                        <div>
                          <p className="font-medium">{getCategoryTypeLabel(item.category_type)}</p>
                          <p className="text-sm text-muted-foreground">
                            DTA: {formatCurrency(item.dta)} | DTL: {formatCurrency(item.dtl)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">
                            {formatCurrency(item.dta - item.dtl)}
                          </p>
                          <p className="text-xs text-muted-foreground">Net</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* By Entity Breakdown (if multi-entity) */}
              {project.multi_entity && summary.by_entity.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Breakdown by Entity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {summary.by_entity.map((item, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-muted/50 rounded">
                          <div>
                            <p className="font-medium">{item.entity_name}</p>
                            <p className="text-sm text-muted-foreground">
                              DTA: {formatCurrency(item.dta)} | DTL: {formatCurrency(item.dtl)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">
                              {formatCurrency(item.dta - item.dtl)}
                            </p>
                            <p className="text-xs text-muted-foreground">Net</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Deferred Tax Categories</h3>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </div>

          {categories.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <p className="text-muted-foreground mb-4">No categories created yet</p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Category
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {categories.map((category) => (
                <Card key={category.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{category.description}</CardTitle>
                        <CardDescription>
                          {getCategoryTypeLabel(category.category_type)}
                          {category.entity_name && ` • ${category.entity_name}`}
                        </CardDescription>
                      </div>
                      <Badge variant={category.recognition_criteria_met ? "default" : "secondary"}>
                        {category.recognition_criteria_met ? "Recognized" : "Not Recognized"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Book Value</p>
                        <p className="font-semibold">{formatCurrency(category.book_value)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Tax Value</p>
                        <p className="font-semibold">{formatCurrency(category.tax_value)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">DTA</p>
                        <p className="font-semibold text-green-600">{formatCurrency(category.deferred_tax_asset)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">DTL</p>
                        <p className="font-semibold text-red-600">{formatCurrency(category.deferred_tax_liability)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="losses" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Tax Loss Carry Forwards</h3>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Tax Loss
            </Button>
          </div>

          {taxLosses.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <p className="text-muted-foreground mb-4">No tax losses recorded yet</p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Tax Loss
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {taxLosses.map((loss) => (
                <Card key={loss.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">
                          {loss.loss_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </CardTitle>
                        <CardDescription>
                          Origination: {loss.origination_year}
                          {loss.expiry_year && ` • Expires: ${loss.expiry_year}`}
                          {loss.entity_name && ` • ${loss.entity_name}`}
                        </CardDescription>
                      </div>
                      <Badge variant="outline">
                        {loss.utilization_probability}% Probable
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Loss Amount</p>
                        <p className="font-semibold">{formatCurrency(loss.loss_amount)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">DTA Recognized</p>
                        <p className="font-semibold text-green-600">{formatCurrency(loss.deferred_tax_asset)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Effective Rate</p>
                        <p className="font-semibold">
                          {loss.loss_amount > 0 ? ((loss.deferred_tax_asset / loss.loss_amount) * 100).toFixed(1) : 0}%
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="movements" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Deferred Tax Movements</h3>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Movement
            </Button>
          </div>

          <Card className="text-center py-12">
            <CardContent>
              <p className="text-muted-foreground mb-4">Movement tracking coming soon</p>
              <p className="text-sm text-muted-foreground">
                This will show opening balances, current year movements, and closing balances
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};