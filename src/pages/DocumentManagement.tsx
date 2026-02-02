import { useState, useEffect, useCallback } from "react";
import { MainLayout } from "@/components/Layout/MainLayout";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { DocumentTable } from "@/components/DocumentManagement/DocumentTable";
import { DocumentHeader } from "@/components/DocumentManagement/DocumentHeader";
import { DocumentSearch } from "@/components/DocumentManagement/DocumentSearch";
import { DocumentForm } from "@/components/DocumentManagement/DocumentForm";
import { Chatbot } from "@/components/Shared/Chatbot";
import { postInvoice } from "@/lib/accounting";

// Local document interface matching the database schema
interface LocalDocument {
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
      
      const { data, error } = await (supabase
        .from('sales_documents') as any)
        .select(`
          *,
          customers (
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedDocuments: LocalDocument[] = ((data || []) as any[]).map((doc: any) => ({
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

  const handleEditDocument = (document: LocalDocument) => {
    setEditingDocument(document);
    setSelectedDocumentType(document.document_type as "invoice" | "quotation");
    setIsFormOpen(true);
  };

  const handleDeleteDocument = async (id: string) => {
    try {
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

  const handlePostDocument = async (document: any) => {
    if (document.status !== 'draft') return;
    
    // Convert to the format expected by postInvoice
    const salesDoc = {
      id: document.id,
      user_id: document.user_id,
      customer_id: document.customer_id,
      document_type: document.document_type,
      document_number: document.document_number,
      document_date: document.issue_date,
      line_items: [],
      subtotal: document.subtotal || 0,
      vat_total: document.tax_amount || 0,
      grand_total: document.total_amount || 0,
      status: document.status,
      created_at: document.created_at,
      updated_at: document.updated_at
    };

    try {
      await postInvoice(salesDoc as any);
      
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
          documents={filteredDocuments as any}
          loading={loading}
          onEdit={handleEditDocument as any}
          onDelete={handleDeleteDocument}
          onPost={handlePostDocument}
        />

        <DocumentForm
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
          onSuccess={handleFormSuccess}
          editingDocument={editingDocument as any}
          documentType={selectedDocumentType}
        />
      </div>
      <Chatbot />
    </MainLayout>
  );
};

export default DocumentManagement;
