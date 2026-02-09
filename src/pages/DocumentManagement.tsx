import { useState, useEffect, useCallback } from "react";
import { MainLayout } from "@/components/Layout/MainLayout";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { DocumentTable, TableDocument } from "@/components/DocumentManagement/DocumentTable";
import { DocumentHeader } from "@/components/DocumentManagement/DocumentHeader";
import { DocumentSearch } from "@/components/DocumentManagement/DocumentSearch";
import { DocumentForm } from "@/components/DocumentManagement/DocumentForm";
import { Chatbot } from "@/components/Shared/Chatbot";
import { postInvoice } from "@/lib/accounting";
import { auditLogger } from "@/lib/audit-logger";
import { PermissionGuard } from "@/components/Shared/PermissionGuard";
import { SalesDocument } from "@/types/sales";

// Local document interface matching the database schema
interface LocalDocument extends TableDocument {
  id: string;
  document_number: string;
  document_type: 'invoice' | 'quotation' | 'credit_note';
  customer_id?: string;
  issue_date: string;
  due_date?: string;
  valid_until?: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  status: string;
  terms_and_conditions?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  customer_name?: string;
}

const DocumentManagement = () => {
  const [documents, setDocuments] = useState<LocalDocument[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<LocalDocument[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<LocalDocument | null>(null);
  const [selectedDocumentType, setSelectedDocumentType] = useState<"invoice" | "quotation">("invoice");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('user_id', user.id)
        .single();

      if (!profile?.company_id) return;
      
      const { data, error } = await supabase
        .from('sales_documents')
        .select(`
          *,
          customers (
            name
          )
        `)
        .eq('company_id', profile.company_id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedDocuments: LocalDocument[] = (data || []).map((doc) => ({
        ...doc,
        document_type: doc.document_type as "invoice" | "quotation" | "credit_note",
        status: doc.status,
        customer_name: doc.customers?.name || 'Unknown Customer'
      }));
      
      setDocuments(formattedDocuments);
    } catch (error) {
      console.error("Error fetching documents:", error);
      toast({
        title: "Error",
        description: "Failed to fetch documents",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const filterDocuments = useCallback(() => {
    let filtered = [...documents];

    if (searchTerm) {
      filtered = filtered.filter(
        (doc) =>
          doc.document_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (doc.notes && doc.notes.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((doc) => doc.status === statusFilter);
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter((doc) => doc.document_type === typeFilter);
    }

    setFilteredDocuments(filtered);
  }, [documents, searchTerm, statusFilter, typeFilter]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  useEffect(() => {
    filterDocuments();
  }, [filterDocuments]);

  const handleCreateDocument = () => {
    setEditingDocument(null);
    setIsFormOpen(true);
  };

  const handleEditDocument = (document: TableDocument) => {
    const localDoc = document as LocalDocument;
    setEditingDocument(localDoc);
    setSelectedDocumentType(localDoc.document_type as "invoice" | "quotation");
    setIsFormOpen(true);
  };

  const handleDeleteDocument = async (id: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('user_id', user.id)
        .single();

      if (!profile?.company_id) return;

      const { error } = await supabase
        .from('sales_documents')
        .delete()
        .eq('id', id)
        .eq('company_id', profile.company_id);

      if (error) throw error;

      await auditLogger.log({
        action: 'DELETE_DOCUMENT',
        entityType: 'document',
        entityId: id,
        details: {}
      });

      setDocuments(prev => prev.filter(doc => doc.id !== id));
      
      toast({
        title: "Success",
        description: "Document deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting document:", error);
      toast({
        title: "Error",
        description: "Failed to delete document",
        variant: "destructive",
      });
    }
  };

  const handlePostDocument = async (document: TableDocument) => {
    const localDoc = document as LocalDocument;
    if (localDoc.status !== 'draft') return;
    
    // Convert to the format expected by postInvoice
    const salesDoc: SalesDocument = {
      id: localDoc.id,
      user_id: localDoc.user_id,
      customer_id: localDoc.customer_id || '',
      document_type: localDoc.document_type,
      document_number: localDoc.document_number,
      document_date: localDoc.issue_date,
      line_items: [],
      transaction_type: 'service', // Default or derived
      sale_type: 'credit', // Default or derived
      subtotal: localDoc.subtotal || 0,
      vat_total: localDoc.tax_amount || 0,
      grand_total: localDoc.total_amount || 0,
      status: localDoc.status as SalesDocument['status'],
      created_at: localDoc.created_at,
      updated_at: localDoc.updated_at
    };

    try {
      await postInvoice(salesDoc);
      
      toast({
        title: "Success",
        description: "Document posted and journal entry created",
      });
      
      fetchDocuments();
    } catch (error) {
      console.error("Error posting document:", error);
      toast({
        title: "Error",
        description: "Failed to post document",
        variant: "destructive",
      });
    }
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setEditingDocument(null);
    fetchDocuments();
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <DocumentHeader 
          onCreateDocument={handleCreateDocument}
          onDocumentTypeChange={(type) => setSelectedDocumentType(type as "invoice" | "quotation")}
          selectedDocumentType={selectedDocumentType}
        />

        <DocumentSearch
          searchTerm={searchTerm}
          statusFilter={statusFilter}
          typeFilter={typeFilter}
          onSearchChange={setSearchTerm}
          onStatusFilterChange={setStatusFilter}
          onTypeFilterChange={setTypeFilter}
        />

        <DocumentTable
          documents={filteredDocuments}
          loading={loading}
          onEdit={handleEditDocument}
          onDelete={handleDeleteDocument}
          onPost={handlePostDocument}
        />

        <DocumentForm
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
          onSuccess={handleFormSuccess}
          editingDocument={editingDocument}
          documentType={selectedDocumentType}
        />
      </div>
      <Chatbot />
    </MainLayout>
  );
};

export default DocumentManagement;
