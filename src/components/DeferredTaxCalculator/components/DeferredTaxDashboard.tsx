
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Download, Settings, Plus, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { DeferredTaxProject, DeferredTaxCategory, TaxLossCarryForward, DeferredTaxSummary, CategoryType, DeferredTaxMovement } from '../types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CategoryForm } from './CategoryForm';
import { TaxLossForm } from './TaxLossForm';

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
  const [movements, setMovements] = useState<DeferredTaxMovement[]>([]);
  const [summary, setSummary] = useState<DeferredTaxSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  const [isCategoryFormOpen, setIsCategoryFormOpen] = useState(false);
  const [isTaxLossFormOpen, setIsTaxLossFormOpen] = useState(false);
  
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
      
      // Fetch movements
      const { data: movementsData, error: movementsError } = await supabase
        .from('deferred_tax_movements')
        .select('*')
        .eq('project_id', project.id)
        .order('movement_date', { ascending: false });
        
      if (movementsError) {
          console.warn("Movements table might not exist or error fetching:", movementsError);
      }

      setCategories((categoriesData || []) as DeferredTaxCategory[]);
      setTaxLosses((lossesData || []) as TaxLossCarryForward[]);
      setMovements((movementsData || []) as DeferredTaxMovement[]);

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

  const handleAddCategory = async (data: Omit<DeferredTaxCategory, 'id' | 'created_at' | 'updated_at' | 'project_id'>) => {
    try {
      // Insert category
      const { data: newCategory, error } = await supabase
        .from('deferred_tax_categories')
        .insert({
          ...data,
          project_id: project.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Create movement record
      const { error: movementError } = await supabase
        .from('deferred_tax_movements')
        .insert({
          project_id: project.id,
          category_id: newCategory.id,
          movement_type: 'origination',
          deferred_tax_asset_movement: data.deferred_tax_asset,
          deferred_tax_liability_movement: data.deferred_tax_liability,
          movement_date: new Date().toISOString(),
          description: `Initial recognition of ${data.description}`,
        });

      if (movementError) console.warn('Failed to create movement record:', movementError);

      toast({
        title: "Success",
        description: "Category added successfully",
      });
      fetchProjectData();
    } catch (error) {
      console.error('Error adding category:', error);
      toast({
        title: "Error",
        description: "Failed to add category",
        variant: "destructive",
      });
    }
  };

  const handleAddTaxLoss = async (data: Omit<TaxLossCarryForward, 'id' | 'created_at' | 'updated_at' | 'project_id'>) => {
    try {
      // Insert tax loss
      const { data: newLoss, error } = await supabase
        .from('tax_loss_carry_forwards')
        .insert({
          ...data,
          project_id: project.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Create movement record
      const { error: movementError } = await supabase
        .from('deferred_tax_movements')
        .insert({
          project_id: project.id,
          loss_id: newLoss.id,
          movement_type: 'origination',
          deferred_tax_asset_movement: data.deferred_tax_asset,
          deferred_tax_liability_movement: 0,
          movement_date: new Date().toISOString(),
          description: `Recognition of tax loss ${data.loss_type}`,
        });

      if (movementError) console.warn('Failed to create movement record:', movementError);

      toast({
        title: "Success",
        description: "Tax loss added successfully",
      });
      fetchProjectData();
    } catch (error) {
      console.error('Error adding tax loss:', error);
      toast({
        title: "Error",
        description: "Failed to add tax loss",
        variant: "destructive",
      });
    }
  };

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
            Export Report
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="categories">Categories (IAS 12)</TabsTrigger>
          <TabsTrigger value="tax_losses">Tax Losses</TabsTrigger>
          <TabsTrigger value="movements">Movements</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Deferred Tax Assets</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(summary?.total_dta || 0)}</div>
                <p className="text-xs text-muted-foreground">
                  Deductible temporary differences & tax losses
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Deferred Tax Liabilities</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(summary?.total_dtl || 0)}</div>
                <p className="text-xs text-muted-foreground">
                  Taxable temporary differences
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Net Position</CardTitle>
                {getNetPositionIcon(summary?.net_position || 0)}
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${
                  (summary?.net_position || 0) > 0 ? 'text-green-600' : (summary?.net_position || 0) < 0 ? 'text-red-600' : ''
                }`}>
                  {formatCurrency(summary?.net_position || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {(summary?.net_position || 0) > 0 ? 'Net Deferred Tax Asset' : 'Net Deferred Tax Liability'}
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="categories">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Temporary Differences</CardTitle>
                <CardDescription>Breakdown by IAS 12 categories</CardDescription>
              </div>
              <Button size="sm" onClick={() => setIsCategoryFormOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Carrying Amount</TableHead>
                    <TableHead className="text-right">Tax Base</TableHead>
                    <TableHead className="text-right">Temp. Difference</TableHead>
                    <TableHead className="text-right">Tax Rate</TableHead>
                    <TableHead className="text-right">DT Asset</TableHead>
                    <TableHead className="text-right">DT Liability</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((cat) => (
                    <TableRow key={cat.id}>
                      <TableCell className="font-medium">
                        {getCategoryTypeLabel(cat.category_type)}
                        {cat.entity_name && <span className="block text-xs text-muted-foreground">{cat.entity_name}</span>}
                        <span className="block text-xs text-muted-foreground">{cat.description}</span>
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(cat.book_value)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(cat.tax_value)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(cat.temporary_difference)}</TableCell>
                      <TableCell className="text-right">{(cat.applicable_tax_rate * 100).toFixed(1)}%</TableCell>
                      <TableCell className="text-right text-green-600">
                        {cat.deferred_tax_asset > 0 ? formatCurrency(cat.deferred_tax_asset) : '-'}
                      </TableCell>
                      <TableCell className="text-right text-red-600">
                        {cat.deferred_tax_liability > 0 ? formatCurrency(cat.deferred_tax_liability) : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                  {categories.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                        No categories defined. Click "Add Category" to start.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tax_losses">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Unused Tax Losses</CardTitle>
                <CardDescription>Tax loss carry forwards and credits</CardDescription>
              </div>
              <Button size="sm" onClick={() => setIsTaxLossFormOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Tax Loss
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Origination Year</TableHead>
                    <TableHead>Expiry Year</TableHead>
                    <TableHead className="text-right">Loss Amount</TableHead>
                    <TableHead className="text-right">Probability</TableHead>
                    <TableHead className="text-right">DT Asset Recognized</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {taxLosses.map((loss) => (
                    <TableRow key={loss.id}>
                      <TableCell className="font-medium">
                        {loss.loss_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        {loss.entity_name && <span className="block text-xs text-muted-foreground">{loss.entity_name}</span>}
                      </TableCell>
                      <TableCell>{loss.origination_year}</TableCell>
                      <TableCell>{loss.expiry_year || 'Indefinite'}</TableCell>
                      <TableCell className="text-right">{formatCurrency(loss.loss_amount)}</TableCell>
                      <TableCell className="text-right">{(loss.utilization_probability * 100).toFixed(0)}%</TableCell>
                      <TableCell className="text-right text-green-600">
                        {formatCurrency(loss.deferred_tax_asset)}
                      </TableCell>
                    </TableRow>
                  ))}
                  {taxLosses.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        No tax losses recorded.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="movements">
          <Card>
            <CardHeader>
              <CardTitle>Deferred Tax Movements</CardTitle>
              <CardDescription>Reconciliation of opening and closing balances</CardDescription>
            </CardHeader>
            <CardContent>
               <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Asset Mvmt</TableHead>
                    <TableHead className="text-right">Liability Mvmt</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {movements.map((mv) => (
                    <TableRow key={mv.id}>
                      <TableCell>{new Date(mv.movement_date).toLocaleDateString()}</TableCell>
                      <TableCell>{mv.description || '-'}</TableCell>
                      <TableCell>{mv.movement_type.replace('_', ' ')}</TableCell>
                      <TableCell className={`text-right ${mv.deferred_tax_asset_movement >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(mv.deferred_tax_asset_movement)}
                      </TableCell>
                      <TableCell className={`text-right ${mv.deferred_tax_liability_movement >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {formatCurrency(mv.deferred_tax_liability_movement)}
                      </TableCell>
                    </TableRow>
                  ))}
                   {movements.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        No movements recorded.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <CategoryForm 
        open={isCategoryFormOpen} 
        onOpenChange={setIsCategoryFormOpen}
        onSubmit={handleAddCategory}
        defaultTaxRate={project.country?.corporate_tax_rate}
        isMultiEntity={project.multi_entity}
      />

      <TaxLossForm 
        open={isTaxLossFormOpen} 
        onOpenChange={setIsTaxLossFormOpen}
        onSubmit={handleAddTaxLoss}
        defaultTaxRate={project.country?.corporate_tax_rate}
        isMultiEntity={project.multi_entity}
      />
    </div>
  );
};
