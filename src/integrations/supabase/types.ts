export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      bank_statements: {
        Row: {
          bank_id: string
          file_type: string
          file_url: string
          id: string
          processing_status: string | null
          result_json: Json | null
          upload_date: string | null
          user_id: string
        }
        Insert: {
          bank_id: string
          file_type: string
          file_url: string
          id?: string
          processing_status?: string | null
          result_json?: Json | null
          upload_date?: string | null
          user_id: string
        }
        Update: {
          bank_id?: string
          file_type?: string
          file_url?: string
          id?: string
          processing_status?: string | null
          result_json?: Json | null
          upload_date?: string | null
          user_id?: string
        }
        Relationships: []
      }
      countries: {
        Row: {
          capital_gains_tax_inclusion: number
          code: string
          corporate_tax_rate: number
          created_at: string
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          capital_gains_tax_inclusion?: number
          code: string
          corporate_tax_rate?: number
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          capital_gains_tax_inclusion?: number
          code?: string
          corporate_tax_rate?: number
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      customers: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          city: string | null
          company: string | null
          country: string | null
          created_at: string
          credit_limit: number | null
          email: string | null
          id: string
          name: string
          notes: string | null
          payment_terms: number | null
          phone: string | null
          postal_code: string | null
          province: string | null
          updated_at: string
          user_id: string
          vat_number: string | null
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          company?: string | null
          country?: string | null
          created_at?: string
          credit_limit?: number | null
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          payment_terms?: number | null
          phone?: string | null
          postal_code?: string | null
          province?: string | null
          updated_at?: string
          user_id: string
          vat_number?: string | null
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          company?: string | null
          country?: string | null
          created_at?: string
          credit_limit?: number | null
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          payment_terms?: number | null
          phone?: string | null
          postal_code?: string | null
          province?: string | null
          updated_at?: string
          user_id?: string
          vat_number?: string | null
        }
        Relationships: []
      }
      deferred_tax_categories: {
        Row: {
          applicable_tax_rate: number
          book_value: number
          category_type: string
          created_at: string
          deferred_tax_asset: number
          deferred_tax_liability: number
          description: string
          entity_name: string | null
          id: string
          notes: string | null
          project_id: string
          recognition_criteria_met: boolean
          reversal_pattern: string | null
          tax_value: number
          temporary_difference: number
          updated_at: string
        }
        Insert: {
          applicable_tax_rate: number
          book_value?: number
          category_type: string
          created_at?: string
          deferred_tax_asset?: number
          deferred_tax_liability?: number
          description: string
          entity_name?: string | null
          id?: string
          notes?: string | null
          project_id: string
          recognition_criteria_met?: boolean
          reversal_pattern?: string | null
          tax_value?: number
          temporary_difference?: number
          updated_at?: string
        }
        Update: {
          applicable_tax_rate?: number
          book_value?: number
          category_type?: string
          created_at?: string
          deferred_tax_asset?: number
          deferred_tax_liability?: number
          description?: string
          entity_name?: string | null
          id?: string
          notes?: string | null
          project_id?: string
          recognition_criteria_met?: boolean
          reversal_pattern?: string | null
          tax_value?: number
          temporary_difference?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "deferred_tax_categories_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "deferred_tax_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      deferred_tax_movements: {
        Row: {
          category_id: string | null
          created_at: string
          deferred_tax_asset_movement: number
          deferred_tax_liability_movement: number
          description: string | null
          id: string
          loss_id: string | null
          movement_date: string
          movement_type: string
          project_id: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          deferred_tax_asset_movement?: number
          deferred_tax_liability_movement?: number
          description?: string | null
          id?: string
          loss_id?: string | null
          movement_date: string
          movement_type: string
          project_id: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          deferred_tax_asset_movement?: number
          deferred_tax_liability_movement?: number
          description?: string | null
          id?: string
          loss_id?: string | null
          movement_date?: string
          movement_type?: string
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deferred_tax_movements_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "deferred_tax_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deferred_tax_movements_loss_id_fkey"
            columns: ["loss_id"]
            isOneToOne: false
            referencedRelation: "tax_loss_carry_forwards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deferred_tax_movements_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "deferred_tax_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      deferred_tax_projects: {
        Row: {
          country_id: string
          created_at: string
          id: string
          multi_entity: boolean
          name: string
          reporting_currency: string
          status: string
          tax_year: number
          updated_at: string
          user_id: string
        }
        Insert: {
          country_id: string
          created_at?: string
          id?: string
          multi_entity?: boolean
          name: string
          reporting_currency?: string
          status?: string
          tax_year: number
          updated_at?: string
          user_id: string
        }
        Update: {
          country_id?: string
          created_at?: string
          id?: string
          multi_entity?: boolean
          name?: string
          reporting_currency?: string
          status?: string
          tax_year?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deferred_tax_projects_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
        ]
      }
      document_line_items: {
        Row: {
          created_at: string
          description: string
          discount_percentage: number | null
          document_id: string
          id: string
          line_total: number
          product_id: string | null
          quantity: number
          sort_order: number | null
          tax_rate: number | null
          unit_price: number
        }
        Insert: {
          created_at?: string
          description: string
          discount_percentage?: number | null
          document_id: string
          id?: string
          line_total?: number
          product_id?: string | null
          quantity?: number
          sort_order?: number | null
          tax_rate?: number | null
          unit_price?: number
        }
        Update: {
          created_at?: string
          description?: string
          discount_percentage?: number | null
          document_id?: string
          id?: string
          line_total?: number
          product_id?: string | null
          quantity?: number
          sort_order?: number | null
          tax_rate?: number | null
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "document_line_items_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_line_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          created_at: string
          customer_id: string | null
          document_number: string
          document_type: string
          due_date: string | null
          id: string
          issue_date: string
          notes: string | null
          status: string
          subtotal: number
          tax_amount: number
          terms_and_conditions: string | null
          total_amount: number
          updated_at: string
          user_id: string
          valid_until: string | null
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          document_number: string
          document_type: string
          due_date?: string | null
          id?: string
          issue_date?: string
          notes?: string | null
          status?: string
          subtotal?: number
          tax_amount?: number
          terms_and_conditions?: string | null
          total_amount?: number
          updated_at?: string
          user_id: string
          valid_until?: string | null
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          document_number?: string
          document_type?: string
          due_date?: string | null
          id?: string
          issue_date?: string
          notes?: string | null
          status?: string
          subtotal?: number
          tax_amount?: number
          terms_and_conditions?: string | null
          total_amount?: number
          updated_at?: string
          user_id?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: string | null
          cost_price: number | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          quantity_on_hand: number | null
          reorder_level: number | null
          sku: string | null
          tax_rate: number | null
          unit_of_measure: string | null
          unit_price: number
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          cost_price?: number | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          quantity_on_hand?: number | null
          reorder_level?: number | null
          sku?: string | null
          tax_rate?: number | null
          unit_of_measure?: string | null
          unit_price?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          cost_price?: number | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          quantity_on_hand?: number | null
          reorder_level?: number | null
          sku?: string | null
          tax_rate?: number | null
          unit_of_measure?: string | null
          unit_price?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      statement_audit: {
        Row: {
          created_at: string | null
          event: string
          id: string
          statement_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          event: string
          id?: string
          statement_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          event?: string
          id?: string
          statement_id?: string
          user_id?: string
        }
        Relationships: []
      }
      suppliers: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          city: string | null
          company: string | null
          country: string | null
          created_at: string
          credit_limit: number | null
          email: string | null
          id: string
          name: string
          notes: string | null
          payment_terms: number | null
          phone: string | null
          postal_code: string | null
          province: string | null
          status: string
          updated_at: string
          user_id: string
          vat_number: string | null
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          company?: string | null
          country?: string | null
          created_at?: string
          credit_limit?: number | null
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          payment_terms?: number | null
          phone?: string | null
          postal_code?: string | null
          province?: string | null
          status?: string
          updated_at?: string
          user_id: string
          vat_number?: string | null
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          company?: string | null
          country?: string | null
          created_at?: string
          credit_limit?: number | null
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          payment_terms?: number | null
          phone?: string | null
          postal_code?: string | null
          province?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          vat_number?: string | null
        }
        Relationships: []
      }
      tax_loss_carry_forwards: {
        Row: {
          created_at: string
          deferred_tax_asset: number
          entity_name: string | null
          expiry_year: number | null
          id: string
          loss_amount: number
          loss_type: string
          notes: string | null
          origination_year: number
          project_id: string
          updated_at: string
          utilization_probability: number
        }
        Insert: {
          created_at?: string
          deferred_tax_asset?: number
          entity_name?: string | null
          expiry_year?: number | null
          id?: string
          loss_amount: number
          loss_type: string
          notes?: string | null
          origination_year: number
          project_id: string
          updated_at?: string
          utilization_probability?: number
        }
        Update: {
          created_at?: string
          deferred_tax_asset?: number
          entity_name?: string | null
          expiry_year?: number | null
          id?: string
          loss_amount?: number
          loss_type?: string
          notes?: string | null
          origination_year?: number
          project_id?: string
          updated_at?: string
          utilization_probability?: number
        }
        Relationships: [
          {
            foreignKeyName: "tax_loss_carry_forwards_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "deferred_tax_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number | null
          category: string | null
          date: string | null
          description: string | null
          id: string
          metadata: Json | null
          statement_id: string
          type: string | null
          user_id: string
        }
        Insert: {
          amount?: number | null
          category?: string | null
          date?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          statement_id: string
          type?: string | null
          user_id: string
        }
        Update: {
          amount?: number | null
          category?: string | null
          date?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          statement_id?: string
          type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_statement_id"
            columns: ["statement_id"]
            isOneToOne: false
            referencedRelation: "bank_statements"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
