import { useState, useEffect, useCallback } from "react";
import { MainLayout } from "@/components/Layout/MainLayout";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { DocumentTable } from "@/components/DocumentManagement/DocumentTable";
import { DocumentHeader } from "@/components/DocumentManagement/DocumentHeader";
import { DocumentSearch } from "@/components/DocumentManagement/DocumentSearch";
import { DocumentForm } from "@/components/DocumentManagement/DocumentForm";
import { Chatbot } from "@/components/Shared/Chatbot";
import { SalesDocument } from "@/types/sales";

// Extended interface for UI display including joined customer name
interface ExtendedSalesDocument extends SalesDocument {
  customer_name?: string;
  [key: string]: unknown; // For compatibility with DocumentTable
}

const DocumentManagement = () => {
  const [documents, setDocuments] = useState<ExtendedSalesDocument[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<ExtendedSalesDocument[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<ExtendedSalesDocument | null>(null);
  const [selectedDocumentType, setSelectedDocumentType] = useState<"invoice" | "quotation">("invoice");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('sales_documents')
        .select(`
          *,
          customers (
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedDocuments: ExtendedSalesDocument[] = (data || []).map(doc => ({
        ...doc,
        document_type: doc.document_type as "invoice" | "quotation",
        status: doc.status as "draft" | "sent" | "paid" | "overdue" | "void" | "accepted" | "rejected",
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

  const handlePostDocument = async (document: ExtendedSalesDocument) => {
    if (document.status !== 'draft') return;
    
    // Type narrowing to ensure it matches SalesDocument
    const salesDoc: SalesDocument = {
        id: document.id,
        user_id: document.user_id,
        customer_id: document.customer_id,
        document_type: document.document_type,
        document_number: document.document_number,
        issue_date: document.issue_date,
        due_date: document.due_date,
        valid_until: document.valid_until,
        status: document.status,
        subtotal: document.subtotal,
        tax_amount: document.tax_amount,
        total_amount: document.total_amount,
        terms_and_conditions: document.terms_and_conditions,
        notes: document.notes,
        created_at: document.created_at,
        updated_at: document.updated_at
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
