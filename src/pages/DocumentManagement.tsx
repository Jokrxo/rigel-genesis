import { useState, useEffect, useCallback } from "react";
import { MainLayout } from "@/components/Layout/MainLayout";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { DocumentTable } from "@/components/DocumentManagement/DocumentTable";
import { DocumentHeader } from "@/components/DocumentManagement/DocumentHeader";
import { DocumentSearch } from "@/components/DocumentManagement/DocumentSearch";
import { DocumentForm } from "@/components/DocumentManagement/DocumentForm";
import { Chatbot } from "@/components/Shared/Chatbot";

interface LocalDocument {
  id: string;
  document_type: string;
  document_number: string;
  issue_date: string;
  due_date: string;
  customer_id: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  status: string;
  notes: string;
  created_at: string;
  terms_and_conditions?: string;
  valid_until?: string;
  [key: string]: unknown;
}

interface Document {
  id: string;
  customer_id: string;
  issue_date: string;
  due_date?: string;
  valid_until?: string;
  terms_and_conditions?: string;
  notes?: string;
  document_number: string;
  [key: string]: unknown;
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
      // Mock data for now since the documents table structure may not match
      const mockDocuments: LocalDocument[] = [
        {
          id: "1",
          document_type: "invoice",
          document_number: "INV-001",
          issue_date: "2024-01-15",
          due_date: "2024-02-15",
          customer_id: "cust1",
          subtotal: 1000,
          tax_amount: 150,
          total_amount: 1150,
          status: "sent",
          notes: "Payment terms: 30 days",
          created_at: new Date().toISOString(),
        },
        {
          id: "2",
          document_type: "quotation",
          document_number: "QUO-001",
          issue_date: "2024-01-10",
          due_date: "2024-01-25",
          customer_id: "cust2",
          subtotal: 2500,
          tax_amount: 375,
          total_amount: 2875,
          status: "draft",
          notes: "Quotation valid for 14 days",
          created_at: new Date().toISOString(),
        }
      ];
      
      setDocuments(mockDocuments);
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
