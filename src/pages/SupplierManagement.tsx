import { useState, useEffect } from "react";
import { MainLayout } from "@/components/Layout/MainLayout";
import { useToast } from "@/hooks/use-toast";
import { SupplierTable } from "@/components/SupplierManagement/SupplierTable";
import { SupplierHeader } from "@/components/SupplierManagement/SupplierHeader";
import { SupplierSearch } from "@/components/SupplierManagement/SupplierSearch";
import { SupplierForm } from "@/components/SupplierManagement/SupplierForm";
import { ViewSupplierDialog } from "@/components/SupplierManagement/ViewSupplierDialog";
import { DeleteConfirmationDialog } from "@/components/Shared/DeleteConfirmationDialog";
import { Chatbot } from "@/components/Shared/Chatbot";
import { printTable, exportToCSV, exportToJSON } from "@/utils/printExportUtils";

interface LocalSupplier {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  contact_person: string;
  tax_number: string;
  payment_terms: number;
  status: string;
  created_at: string;
  updated_at: string;
}

const SupplierManagement = () => {
  const [suppliers, setSuppliers] = useState<LocalSupplier[]>([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState<LocalSupplier[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<LocalSupplier | null>(null);
  const [viewingSupplier, setViewingSupplier] = useState<LocalSupplier | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingSupplier, setDeletingSupplier] = useState<LocalSupplier | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSuppliers();
  }, []);

  useEffect(() => {
    filterSuppliers();
  }, [suppliers, searchTerm, statusFilter]);

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const mockSuppliers: LocalSupplier[] = [
        {
          id: "1",
          name: "ABC Office Supplies",
          email: "orders@abcoffice.com",
          phone: "+27 11 123 4567",
          address: "123 Business Park, Johannesburg",
          contact_person: "John Smith",
          tax_number: "VAT12345678",
          payment_terms: 30,
          status: "active",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "2", 
          name: "Tech Solutions Ltd",
          email: "info@techsolutions.co.za",
          phone: "+27 21 987 6543",
          address: "456 Innovation Street, Cape Town",
          contact_person: "Sarah Johnson",
          tax_number: "VAT87654321",
          payment_terms: 15,
          status: "active",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      ];
      
      setSuppliers(mockSuppliers);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      toast({
        title: "Error",
        description: "Failed to fetch suppliers",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterSuppliers = () => {
    let filtered = [...suppliers];

    if (searchTerm) {
      filtered = filtered.filter(
        (supplier) =>
          supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          supplier.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          supplier.contact_person.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((supplier) => supplier.status === statusFilter);
    }

    setFilteredSuppliers(filtered);
  };

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

  // Utility function to convert LocalSupplier to Record<string, unknown>
  const localSupplierToRecord = (supplier: LocalSupplier): Record<string, unknown> => ({
    id: supplier.id,
    name: supplier.name,
    email: supplier.email,
    phone: supplier.phone,
    address: supplier.address,
    contact_person: supplier.contact_person,
    tax_number: supplier.tax_number,
    payment_terms: supplier.payment_terms,
    status: supplier.status,
    created_at: supplier.created_at,
    updated_at: supplier.updated_at,
  });

  const handleExportCSV = () => {
    const headers = ['Name', 'Contact Person', 'Email', 'Phone', 'Payment Terms', 'Status'];
    exportToCSV(filteredSuppliers.map(localSupplierToRecord), 'suppliers', headers);
  };

  const handleExportJSON = () => {
    exportToJSON(filteredSuppliers.map(localSupplierToRecord), 'suppliers');
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <SupplierHeader 
          onCreateSupplier={handleCreateSupplier}
          onPrint={handlePrint}
          onExportCSV={handleExportCSV}
          onExportJSON={handleExportJSON}
          suppliersCount={filteredSuppliers.length}
        />

        <SupplierSearch
          searchTerm={searchTerm}
          statusFilter={statusFilter}
          onSearchChange={setSearchTerm}
          onStatusFilterChange={setStatusFilter}
        />

        <SupplierTable
          suppliers={filteredSuppliers}
          loading={loading}
          onView={handleViewSupplier}
          onEdit={handleEditSupplier}
          onDelete={handleDeleteSupplier}
        />

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
      </div>
      <Chatbot />
    </MainLayout>
  );
};

export default SupplierManagement;
