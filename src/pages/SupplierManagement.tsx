
import { useState, useEffect, useCallback } from "react";
import { MainLayout } from "@/components/Layout/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { printTable, exportToCSV, exportToJSON } from "@/utils/printExportUtils";
import { SupplierTable } from "@/components/SupplierManagement/SupplierTable";
import { SupplierForm } from "@/components/SupplierManagement/SupplierForm";
import { ViewSupplierDialog } from "@/components/SupplierManagement/ViewSupplierDialog";
import { SupplierHeader } from "@/components/SupplierManagement/SupplierHeader";
import { SupplierSearch } from "@/components/SupplierManagement/SupplierSearch";
import { DeleteConfirmationDialog } from "@/components/Shared/DeleteConfirmationDialog";
import { Chatbot } from "@/components/Shared/Chatbot";

// Define the Supplier type matching the one used in other components
interface LocalSupplier {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  vat_number?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  province?: string;
  postal_code?: string;
  country?: string;
  payment_terms?: number;
  credit_limit?: number;
  status: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

const SupplierManagement = () => {
  const [suppliers, setSuppliers] = useState<LocalSupplier[]>([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState<LocalSupplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  
  const [editingSupplier, setEditingSupplier] = useState<LocalSupplier | null>(null);
  const [viewingSupplier, setViewingSupplier] = useState<LocalSupplier | null>(null);
  const [deletingSupplier, setDeletingSupplier] = useState<LocalSupplier | null>(null);
  
  const { toast } = useToast();

  const fetchSuppliers = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const typedData = (data || []) as LocalSupplier[];
      setSuppliers(typedData);
      setFilteredSuppliers(typedData);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      toast({
        title: "Error",
        description: "Failed to fetch suppliers",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const filterSuppliers = useCallback(() => {
    let filtered = [...suppliers];

    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (supplier) =>
          supplier.name.toLowerCase().includes(lowerTerm) ||
          (supplier.email && supplier.email.toLowerCase().includes(lowerTerm)) ||
          (supplier.company && supplier.company.toLowerCase().includes(lowerTerm))
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((supplier) => supplier.status === statusFilter);
    }

    setFilteredSuppliers(filtered);
  }, [suppliers, searchTerm, statusFilter]);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  useEffect(() => {
    filterSuppliers();
  }, [filterSuppliers]);

  const handleCreateSupplier = () => {
    setEditingSupplier(null);
    setIsFormOpen(true);
  };

  const handleEditSupplier = (supplier: LocalSupplier) => {
    setEditingSupplier(supplier);
    setIsFormOpen(true);
  };

  const handleViewSupplier = (supplier: LocalSupplier) => {
    setViewingSupplier(supplier);
    setIsViewOpen(true);
  };

  const handleDeleteSupplier = (supplier: LocalSupplier) => {
    setDeletingSupplier(supplier);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingSupplier) return;

    try {
      const { error } = await supabase
        .from('suppliers')
        .delete()
        .eq('id', deletingSupplier.id);

      if (error) throw error;

      setSuppliers(prev => prev.filter(s => s.id !== deletingSupplier.id));
      
      toast({
        title: "Success",
        description: "Supplier deleted successfully",
      });
      setIsDeleteOpen(false);
      setDeletingSupplier(null);
    } catch (error) {
      console.error("Error deleting supplier:", error);
      toast({
        title: "Error",
        description: "Failed to delete supplier",
        variant: "destructive",
      });
    }
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setEditingSupplier(null);
    fetchSuppliers();
  };

  const handlePrint = () => {
    printTable('suppliers-table', 'Supplier List');
  };

  // Utility function to convert LocalSupplier to Record<string, unknown> for export
  const localSupplierToRecord = (supplier: LocalSupplier): Record<string, unknown> => ({
    id: supplier.id,
    name: supplier.name,
    email: supplier.email,
    phone: supplier.phone,
    company: supplier.company,
    vat_number: supplier.vat_number,
    status: supplier.status,
    created_at: supplier.created_at
  });

  const handleExportCSV = () => {
    const headers = ['Name', 'Company', 'Email', 'Phone', 'Status'];
    const dataToExport = filteredSuppliers.map(localSupplierToRecord);
    exportToCSV(dataToExport, 'suppliers-export', headers);
  };

  const handleExportJSON = () => {
    const dataToExport = filteredSuppliers.map(localSupplierToRecord);
    exportToJSON(dataToExport, 'suppliers-export');
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <SupplierHeader 
          suppliersCount={filteredSuppliers.length}
          onCreateSupplier={handleCreateSupplier}
          onPrint={handlePrint}
          onExportCSV={handleExportCSV}
          onExportJSON={handleExportJSON}
        />
        
        <Card>
          <CardContent className="p-6 space-y-6">
            <SupplierSearch 
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
            />
            
            <SupplierTable 
              suppliers={filteredSuppliers}
              loading={loading}
              onView={handleViewSupplier}
              onEdit={handleEditSupplier}
              onDelete={handleDeleteSupplier}
            />
          </CardContent>
        </Card>

        <SupplierForm 
          open={isFormOpen} 
          onClose={() => setIsFormOpen(false)} 
          onSuccess={handleFormSuccess}
          editingSupplier={editingSupplier}
        />

        <ViewSupplierDialog 
          open={isViewOpen}
          onClose={() => setIsViewOpen(false)}
          supplier={viewingSupplier}
        />

        <DeleteConfirmationDialog 
          open={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          onConfirm={handleConfirmDelete}
          title="Delete Supplier"
          description={`Are you sure you want to delete ${deletingSupplier?.name}? This action cannot be undone.`}
        />
        
        <Chatbot />
      </div>
    </MainLayout>
  );
};

export default SupplierManagement;
