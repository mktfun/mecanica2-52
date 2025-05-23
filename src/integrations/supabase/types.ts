export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      appointments: {
        Row: {
          client_id: string
          created_at: string
          end_time: string
          estimated_cost: number | null
          id: string
          lead_id: string | null
          mechanic_name: string
          notes: string | null
          organization_id: string
          service_description: string | null
          service_type: string
          start_time: string
          status: string
          updated_at: string
          vehicle_id: string
        }
        Insert: {
          client_id: string
          created_at?: string
          end_time: string
          estimated_cost?: number | null
          id?: string
          lead_id?: string | null
          mechanic_name: string
          notes?: string | null
          organization_id: string
          service_description?: string | null
          service_type: string
          start_time: string
          status?: string
          updated_at?: string
          vehicle_id: string
        }
        Update: {
          client_id?: string
          created_at?: string
          end_time?: string
          estimated_cost?: number | null
          id?: string
          lead_id?: string | null
          mechanic_name?: string
          notes?: string | null
          organization_id?: string
          service_description?: string | null
          service_type?: string
          start_time?: string
          status?: string
          updated_at?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          address: string | null
          city: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          notes: string | null
          organization_id: string
          phone: string | null
          postal_code: string | null
          state: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          organization_id: string
          phone?: string | null
          postal_code?: string | null
          state?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          organization_id?: string
          phone?: string | null
          postal_code?: string | null
          state?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          assigned_to: string | null
          client_id: string | null
          created_at: string
          email: string | null
          id: string
          last_interaction_at: string
          name: string
          notes: string | null
          organization_id: string | null
          phone: string
          potential_value: number | null
          service_interest: string | null
          source: string | null
          status: string
          status_changed_at: string
          updated_at: string
          vehicle_id: string | null
        }
        Insert: {
          assigned_to?: string | null
          client_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          last_interaction_at?: string
          name: string
          notes?: string | null
          organization_id?: string | null
          phone: string
          potential_value?: number | null
          service_interest?: string | null
          source?: string | null
          status?: string
          status_changed_at?: string
          updated_at?: string
          vehicle_id?: string | null
        }
        Update: {
          assigned_to?: string | null
          client_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          last_interaction_at?: string
          name?: string
          notes?: string | null
          organization_id?: string | null
          phone?: string
          potential_value?: number | null
          service_interest?: string | null
          source?: string | null
          status?: string
          status_changed_at?: string
          updated_at?: string
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          created_at: string | null
          organization_id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          organization_id: string
          role: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          organization_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      parts: {
        Row: {
          active: boolean | null
          category: string | null
          code: string | null
          created_at: string
          description: string | null
          id: string
          minimum_stock: number | null
          name: string
          organization_id: string
          price: number
          stock: number | null
          updated_at: string
        }
        Insert: {
          active?: boolean | null
          category?: string | null
          code?: string | null
          created_at?: string
          description?: string | null
          id?: string
          minimum_stock?: number | null
          name: string
          organization_id: string
          price?: number
          stock?: number | null
          updated_at?: string
        }
        Update: {
          active?: boolean | null
          category?: string | null
          code?: string | null
          created_at?: string
          description?: string | null
          id?: string
          minimum_stock?: number | null
          name?: string
          organization_id?: string
          price?: number
          stock?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      service_order_parts: {
        Row: {
          code: string | null
          created_at: string
          id: string
          name: string
          part_id: string | null
          price: number
          quantity: number
          service_order_id: string
        }
        Insert: {
          code?: string | null
          created_at?: string
          id?: string
          name: string
          part_id?: string | null
          price: number
          quantity?: number
          service_order_id: string
        }
        Update: {
          code?: string | null
          created_at?: string
          id?: string
          name?: string
          part_id?: string | null
          price?: number
          quantity?: number
          service_order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_order_parts_part_id_fkey"
            columns: ["part_id"]
            isOneToOne: false
            referencedRelation: "parts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_order_parts_service_order_id_fkey"
            columns: ["service_order_id"]
            isOneToOne: false
            referencedRelation: "service_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      service_order_photos: {
        Row: {
          created_at: string
          description: string | null
          id: string
          service_order_id: string
          url: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          service_order_id: string
          url: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          service_order_id?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_order_photos_service_order_id_fkey"
            columns: ["service_order_id"]
            isOneToOne: false
            referencedRelation: "service_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      service_order_services: {
        Row: {
          completed: boolean | null
          created_at: string
          description: string | null
          id: string
          name: string
          price: number
          quantity: number
          service_id: string | null
          service_order_id: string
        }
        Insert: {
          completed?: boolean | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          price: number
          quantity?: number
          service_id?: string | null
          service_order_id: string
        }
        Update: {
          completed?: boolean | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          price?: number
          quantity?: number
          service_id?: string | null
          service_order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_order_services_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_order_services_service_order_id_fkey"
            columns: ["service_order_id"]
            isOneToOne: false
            referencedRelation: "service_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      service_orders: {
        Row: {
          appointment_id: string | null
          client_id: string
          completed_at: string | null
          created_at: string
          description: string | null
          discount_amount: number | null
          discount_percent: number | null
          estimated_completion_date: string | null
          id: string
          labor_cost: number | null
          lead_id: string | null
          notes: string | null
          number: number
          organization_id: string
          recommendations: string | null
          status: string
          subtotal: number | null
          tax_amount: number | null
          tax_percent: number | null
          technician: string | null
          total: number | null
          updated_at: string
          vehicle_id: string
        }
        Insert: {
          appointment_id?: string | null
          client_id: string
          completed_at?: string | null
          created_at?: string
          description?: string | null
          discount_amount?: number | null
          discount_percent?: number | null
          estimated_completion_date?: string | null
          id?: string
          labor_cost?: number | null
          lead_id?: string | null
          notes?: string | null
          number?: number
          organization_id: string
          recommendations?: string | null
          status?: string
          subtotal?: number | null
          tax_amount?: number | null
          tax_percent?: number | null
          technician?: string | null
          total?: number | null
          updated_at?: string
          vehicle_id: string
        }
        Update: {
          appointment_id?: string | null
          client_id?: string
          completed_at?: string | null
          created_at?: string
          description?: string | null
          discount_amount?: number | null
          discount_percent?: number | null
          estimated_completion_date?: string | null
          id?: string
          labor_cost?: number | null
          lead_id?: string | null
          notes?: string | null
          number?: number
          organization_id?: string
          recommendations?: string | null
          status?: string
          subtotal?: number | null
          tax_amount?: number | null
          tax_percent?: number | null
          technician?: string | null
          total?: number | null
          updated_at?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_orders_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_orders_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_orders_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_orders_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          active: boolean | null
          category: string | null
          created_at: string
          description: string | null
          estimated_time: number | null
          id: string
          name: string
          organization_id: string
          price: number
          updated_at: string
        }
        Insert: {
          active?: boolean | null
          category?: string | null
          created_at?: string
          description?: string | null
          estimated_time?: number | null
          id?: string
          name: string
          organization_id: string
          price?: number
          updated_at?: string
        }
        Update: {
          active?: boolean | null
          category?: string | null
          created_at?: string
          description?: string | null
          estimated_time?: number | null
          id?: string
          name?: string
          organization_id?: string
          price?: number
          updated_at?: string
        }
        Relationships: []
      }
      vehicles: {
        Row: {
          client_id: string
          color: string | null
          created_at: string
          id: string
          make: string
          mileage: number | null
          model: string
          notes: string | null
          organization_id: string
          plate: string
          updated_at: string
          vin: string | null
          year: string | null
        }
        Insert: {
          client_id: string
          color?: string | null
          created_at?: string
          id?: string
          make: string
          mileage?: number | null
          model: string
          notes?: string | null
          organization_id: string
          plate: string
          updated_at?: string
          vin?: string | null
          year?: string | null
        }
        Update: {
          client_id?: string
          color?: string | null
          created_at?: string
          id?: string
          make?: string
          mileage?: number | null
          model?: string
          notes?: string | null
          organization_id?: string
          plate?: string
          updated_at?: string
          vin?: string | null
          year?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_my_organizations: {
        Args: Record<PropertyKey, never>
        Returns: string[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
