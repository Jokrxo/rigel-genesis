
import { MainLayout } from "@/components/Layout/MainLayout";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Building, Plus, Search, Edit, Trash2, Printer, Download, TrendingDown, Eye } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Chatbot } from "@/components/Shared/Chatbot";
import { AssetDisposalWizard } from "@/components/Assets/AssetDisposalWizard";
import { AssetFormDialog, AssetFormData, Asset } from "@/components/Assets/AssetFormDialog";
import { ViewAssetDialog } from "@/components/Assets/ViewAssetDialog";
import { DeleteConfirmationDialog } from "@/components/Shared/DeleteConfirmationDialog";
import { useToast } from "@/hooks/use-toast";

const STORAGE_KEY = 'rigel_assets';

const AssetManagement = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewingAsset, setViewingAsset] = useState<Asset | null>(null);
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingAsset, setDeletingAsset] = useState<Asset | null>(null);

  const [disposalAssetId, setDisposalAssetId] = useState<string | null>(null);

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setAssets(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error fetching assets:', error);
      toast({
        title: "Error",
        description: "Failed to fetch assets",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveAssets = (newAssets: Asset[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newAssets));
    setAssets(newAssets);
  };

  const handleViewAsset = (asset: Asset) => {
    setViewingAsset(asset);
    setIsViewOpen(true);
  };

  const handleEditAsset = (asset: Asset) => {
    setEditingAsset(asset);
    setIsEditOpen(true);
  };

  const handleDeleteAsset = (asset: Asset) => {
    setDeletingAsset(asset);
    setIsDeleteOpen(true);
  };

  const handleCreateAsset = async (data: AssetFormData) => {
    try {
      const newAsset: Asset = {
        id: crypto.randomUUID(),
        name: data.name || '',
        category: data.category || '',
        purchase_date: data.purchase_date || new Date().toISOString().split('T')[0],
        purchase_price: data.purchase_price || 0,
        current_value: data.current_value || 0,
        depreciation_rate: data.depreciation_rate || 0,
        useful_life: data.useful_life || 0,
        location: data.location || '',
        created_at: new Date().toISOString(),
      };

      const newAssets = [newAsset, ...assets];
      saveAssets(newAssets);

      toast({
        title: "Success",
        description: "Asset created successfully",
      });
      setIsCreateOpen(false);
    } catch (error) {
      console.error('Error creating asset:', error);
      toast({
        title: "Error",
        description: "Failed to create asset",
        variant: "destructive",
      });
    }
  };

  const handleUpdateAsset = async (data: AssetFormData) => {
    if (!editingAsset) return;

    try {
      const updatedAssets = assets.map(a => 
        a.id === editingAsset.id ? { 
          ...a, 
          name: data.name || a.name,
          category: data.category || a.category,
          purchase_date: data.purchase_date || a.purchase_date,
          purchase_price: data.purchase_price ?? a.purchase_price,
          current_value: data.current_value ?? a.current_value,
          depreciation_rate: data.depreciation_rate ?? a.depreciation_rate,
          useful_life: data.useful_life ?? a.useful_life,
          location: data.location || a.location,
        } : a
      );
      saveAssets(updatedAssets);

      toast({
        title: "Success",
        description: "Asset updated successfully",
      });
      setIsEditOpen(false);
      setEditingAsset(null);
    } catch (error) {
      console.error('Error updating asset:', error);
      toast({
        title: "Error",
        description: "Failed to update asset",
        variant: "destructive",
      });
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingAsset) return;

    try {
      const filteredAssets = assets.filter(a => a.id !== deletingAsset.id);
      saveAssets(filteredAssets);

      toast({
        title: "Success",
        description: "Asset deleted successfully",
      });
      setIsDeleteOpen(false);
      setDeletingAsset(null);
    } catch (error) {
      console.error('Error deleting asset:', error);
      toast({
        title: "Error",
        description: "Failed to delete asset",
        variant: "destructive",
      });
    }
  };

  const filteredAssets = assets.filter(asset =>
    asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalAssetsValue = assets.reduce((sum, asset) => sum + (asset.purchase_price || 0), 0);
  const currentTotalValue = assets.reduce((sum, asset) => sum + (asset.current_value || 0), 0);
  const annualDepreciation = assets.reduce((sum, asset) => sum + ((asset.purchase_price || 0) * (asset.depreciation_rate || 0) / 100), 0);
  const uniqueCategories = new Set(assets.map(a => a.category)).size;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(value);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Asset Management</h1>
            <p className="text-muted-foreground">Monitor business assets, depreciation, and asset performance</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline">
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Asset
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Assets Cost</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalAssetsValue)}</div>
              <p className="text-xs text-muted-foreground">Historical cost</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Value</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(currentTotalValue)}</div>
              <p className="text-xs text-muted-foreground">Net book value</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Annual Depreciation</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(annualDepreciation)}</div>
              <p className="text-xs text-muted-foreground">Estimated per year</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Asset Categories</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{uniqueCategories}</div>
              <p className="text-xs text-muted-foreground">Active categories</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search assets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Assets ({filteredAssets.length})
            </CardTitle>
            <CardDescription>Track asset values, depreciation, and performance</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Asset Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Purchase Date</TableHead>
                    <TableHead>Purchase Price</TableHead>
                    <TableHead>Current Value</TableHead>
                    <TableHead>Depreciation Rate</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">Loading assets...</TableCell>
                    </TableRow>
                  ) : filteredAssets.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">No assets found</TableCell>
                    </TableRow>
                  ) : (
                    filteredAssets.map((asset) => (
                      <TableRow key={asset.id}>
                        <TableCell className="font-medium">{asset.name}</TableCell>
                        <TableCell><Badge variant="outline">{asset.category || '-'}</Badge></TableCell>
                        <TableCell>{new Date(asset.purchase_date).toLocaleDateString()}</TableCell>
                        <TableCell>R{asset.purchase_price.toFixed(2)}</TableCell>
                        <TableCell>R{asset.current_value.toFixed(2)}</TableCell>
                        <TableCell>{asset.depreciation_rate}% p.a.</TableCell>
                        <TableCell>{asset.location || '-'}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleViewAsset(asset)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleEditAsset(asset)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteAsset(asset)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <ViewAssetDialog
        open={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        asset={viewingAsset}
      />

      <AssetFormDialog
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateAsset}
        editingAsset={null}
      />

      <AssetFormDialog
        open={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSubmit={handleUpdateAsset}
        editingAsset={editingAsset}
      />

      <DeleteConfirmationDialog
        open={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Asset"
        description={`Are you sure you want to delete ${deletingAsset?.name}? This action cannot be undone.`}
      />

      {disposalAssetId && (
        <AssetDisposalWizard assetId={disposalAssetId} open={Boolean(disposalAssetId)} onClose={() => setDisposalAssetId(null)} />
      )}
      <Chatbot />
    </MainLayout>
  );
};

export default AssetManagement;
