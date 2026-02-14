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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      availability: {
        Row: {
          airbnb_uid: string | null
          available: boolean | null
          booking_id: string | null
          date: string
          min_nights_override: number | null
          price_override: number | null
          property_id: string
          source: string | null
        }
        Insert: {
          airbnb_uid?: string | null
          available?: boolean | null
          booking_id?: string | null
          date: string
          min_nights_override?: number | null
          price_override?: number | null
          property_id: string
          source?: string | null
        }
        Update: {
          airbnb_uid?: string | null
          available?: boolean | null
          booking_id?: string | null
          date?: string
          min_nights_override?: number | null
          price_override?: number | null
          property_id?: string
          source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "availability_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "availability_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_contracts: {
        Row: {
          accepted_at: string | null
          booking_id: string
          contract_html: string
          created_at: string | null
          id: string
          ip_address: string | null
        }
        Insert: {
          accepted_at?: string | null
          booking_id: string
          contract_html: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
        }
        Update: {
          accepted_at?: string | null
          booking_id?: string
          contract_html?: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "booking_contracts_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          base_price_per_night: number
          check_in: string
          check_out: string
          cleaning_fee: number | null
          contract_accepted_at: string | null
          created_at: string | null
          discount_amount: number | null
          discount_reason: string | null
          guest_email: string
          guest_name: string
          guest_phone: string | null
          guests_count: number | null
          id: string
          internal_notes: string | null
          nights: number | null
          paid_at: string | null
          property_id: string
          source: string | null
          special_requests: string | null
          status: string | null
          stripe_payment_intent: string | null
          stripe_session_id: string | null
          total_price: number
          tourist_tax_total: number | null
          updated_at: string | null
        }
        Insert: {
          base_price_per_night: number
          check_in: string
          check_out: string
          cleaning_fee?: number | null
          contract_accepted_at?: string | null
          created_at?: string | null
          discount_amount?: number | null
          discount_reason?: string | null
          guest_email: string
          guest_name: string
          guest_phone?: string | null
          guests_count?: number | null
          id?: string
          internal_notes?: string | null
          nights?: number | null
          paid_at?: string | null
          property_id: string
          source?: string | null
          special_requests?: string | null
          status?: string | null
          stripe_payment_intent?: string | null
          stripe_session_id?: string | null
          total_price: number
          tourist_tax_total?: number | null
          updated_at?: string | null
        }
        Update: {
          base_price_per_night?: number
          check_in?: string
          check_out?: string
          cleaning_fee?: number | null
          contract_accepted_at?: string | null
          created_at?: string | null
          discount_amount?: number | null
          discount_reason?: string | null
          guest_email?: string
          guest_name?: string
          guest_phone?: string | null
          guests_count?: number | null
          id?: string
          internal_notes?: string | null
          nights?: number | null
          paid_at?: string | null
          property_id?: string
          source?: string | null
          special_requests?: string | null
          status?: string | null
          stripe_payment_intent?: string | null
          stripe_session_id?: string | null
          total_price?: number
          tourist_tax_total?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      contract_templates: {
        Row: {
          active: boolean | null
          body_html: string
          created_at: string | null
          id: string
          language: string | null
          property_id: string | null
          title: string
        }
        Insert: {
          active?: boolean | null
          body_html?: string
          created_at?: string | null
          id?: string
          language?: string | null
          property_id?: string | null
          title?: string
        }
        Update: {
          active?: boolean | null
          body_html?: string
          created_at?: string | null
          id?: string
          language?: string | null
          property_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "contract_templates_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      fx_rates: {
        Row: {
          base_currency: string
          fetched_at: string | null
          rate: number
          target_currency: string
        }
        Insert: {
          base_currency?: string
          fetched_at?: string | null
          rate: number
          target_currency: string
        }
        Update: {
          base_currency?: string
          fetched_at?: string | null
          rate?: number
          target_currency?: string
        }
        Relationships: []
      }
      ical_sync_log: {
        Row: {
          error_message: string | null
          events_created: number | null
          events_found: number | null
          events_updated: number | null
          id: string
          property_id: string | null
          status: string | null
          synced_at: string | null
        }
        Insert: {
          error_message?: string | null
          events_created?: number | null
          events_found?: number | null
          events_updated?: number | null
          id?: string
          property_id?: string | null
          status?: string | null
          synced_at?: string | null
        }
        Update: {
          error_message?: string | null
          events_created?: number | null
          events_found?: number | null
          events_updated?: number | null
          id?: string
          property_id?: string | null
          status?: string | null
          synced_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ical_sync_log_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      inquiries: {
        Row: {
          created_at: string | null
          email: string
          id: string
          message: string | null
          name: string
          phone: string | null
          property_id: string | null
          status: string | null
          subject: string | null
          type: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          message?: string | null
          name: string
          phone?: string | null
          property_id?: string | null
          status?: string | null
          subject?: string | null
          type?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          message?: string | null
          name?: string
          phone?: string | null
          property_id?: string | null
          status?: string | null
          subject?: string | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inquiries_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_settings: {
        Row: {
          currency: string | null
          id: string
          methods_enabled: Json | null
          stripe_publishable_key: string | null
          updated_at: string | null
        }
        Insert: {
          currency?: string | null
          id?: string
          methods_enabled?: Json | null
          stripe_publishable_key?: string | null
          updated_at?: string | null
        }
        Update: {
          currency?: string | null
          id?: string
          methods_enabled?: Json | null
          stripe_publishable_key?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      price_suggestions: {
        Row: {
          created_at: string | null
          current_price: number
          date: string
          id: string
          occupancy_rate: number | null
          property_id: string | null
          reason: string | null
          status: string | null
          suggested_price: number
        }
        Insert: {
          created_at?: string | null
          current_price: number
          date: string
          id?: string
          occupancy_rate?: number | null
          property_id?: string | null
          reason?: string | null
          status?: string | null
          suggested_price: number
        }
        Update: {
          created_at?: string | null
          current_price?: number
          date?: string
          id?: string
          occupancy_rate?: number | null
          property_id?: string | null
          reason?: string | null
          status?: string | null
          suggested_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "price_suggestions_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      promo_codes: {
        Row: {
          active: boolean | null
          code: string
          created_at: string | null
          current_uses: number | null
          discount_amount: number | null
          discount_percent: number | null
          id: string
          max_uses: number | null
          property_id: string | null
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          active?: boolean | null
          code: string
          created_at?: string | null
          current_uses?: number | null
          discount_amount?: number | null
          discount_percent?: number | null
          id?: string
          max_uses?: number | null
          property_id?: string | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          active?: boolean | null
          code?: string
          created_at?: string | null
          current_uses?: number | null
          discount_amount?: number | null
          discount_percent?: number | null
          id?: string
          max_uses?: number | null
          property_id?: string | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "promo_codes_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      properties: {
        Row: {
          airbnb_ical_url: string | null
          airbnb_link: string | null
          airbnb_rating: number | null
          airbnb_reviews_count: number | null
          amenities: string[]
          architect_links: Json | null
          architect_location: string | null
          architect_name: string | null
          architect_year: number | null
          area_sqm: number | null
          bathrooms: number | null
          bedrooms: number | null
          capacity: number | null
          check_in_time: string | null
          check_out_time: string | null
          cleaning_fee: number | null
          country: string
          created_at: string
          currency: string
          description: string
          display_order: number
          hero_image: string | null
          house_rules: Json | null
          ical_export_token: string | null
          id: string
          latitude: number | null
          location: string
          long_description: string | null
          longitude: number | null
          min_nights: number | null
          name: string
          parking_info: string | null
          price_per_night: number | null
          region: string
          seo_description: string | null
          seo_title: string | null
          slug: string
          status: string
          tags: string[]
          tourist_tax_per_person: number | null
          updated_at: string
          weekend_price: number | null
        }
        Insert: {
          airbnb_ical_url?: string | null
          airbnb_link?: string | null
          airbnb_rating?: number | null
          airbnb_reviews_count?: number | null
          amenities?: string[]
          architect_links?: Json | null
          architect_location?: string | null
          architect_name?: string | null
          architect_year?: number | null
          area_sqm?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          capacity?: number | null
          check_in_time?: string | null
          check_out_time?: string | null
          cleaning_fee?: number | null
          country?: string
          created_at?: string
          currency?: string
          description?: string
          display_order?: number
          hero_image?: string | null
          house_rules?: Json | null
          ical_export_token?: string | null
          id?: string
          latitude?: number | null
          location?: string
          long_description?: string | null
          longitude?: number | null
          min_nights?: number | null
          name: string
          parking_info?: string | null
          price_per_night?: number | null
          region?: string
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          status?: string
          tags?: string[]
          tourist_tax_per_person?: number | null
          updated_at?: string
          weekend_price?: number | null
        }
        Update: {
          airbnb_ical_url?: string | null
          airbnb_link?: string | null
          airbnb_rating?: number | null
          airbnb_reviews_count?: number | null
          amenities?: string[]
          architect_links?: Json | null
          architect_location?: string | null
          architect_name?: string | null
          architect_year?: number | null
          area_sqm?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          capacity?: number | null
          check_in_time?: string | null
          check_out_time?: string | null
          cleaning_fee?: number | null
          country?: string
          created_at?: string
          currency?: string
          description?: string
          display_order?: number
          hero_image?: string | null
          house_rules?: Json | null
          ical_export_token?: string | null
          id?: string
          latitude?: number | null
          location?: string
          long_description?: string | null
          longitude?: number | null
          min_nights?: number | null
          name?: string
          parking_info?: string | null
          price_per_night?: number | null
          region?: string
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          status?: string
          tags?: string[]
          tourist_tax_per_person?: number | null
          updated_at?: string
          weekend_price?: number | null
        }
        Relationships: []
      }
      property_images: {
        Row: {
          alt_text: string | null
          created_at: string
          display_order: number
          id: string
          image_url: string
          property_id: string
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          display_order?: number
          id?: string
          image_url: string
          property_id: string
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          display_order?: number
          id?: string
          image_url?: string
          property_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_images_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_pois: {
        Row: {
          created_at: string
          display_order: number
          emoji: string | null
          id: string
          label: string
          latitude: number
          longitude: number
          property_id: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          emoji?: string | null
          id?: string
          label: string
          latitude: number
          longitude: number
          property_id: string
        }
        Update: {
          created_at?: string
          display_order?: number
          emoji?: string | null
          id?: string
          label?: string
          latitude?: number
          longitude?: number
          property_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_pois_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          created_at: string
          guest_location: string | null
          guest_name: string
          id: string
          property_id: string
          rating: number
          review_text: string
          stay_date: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          guest_location?: string | null
          guest_name: string
          id?: string
          property_id: string
          rating?: number
          review_text: string
          stay_date?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          guest_location?: string | null
          guest_name?: string
          id?: string
          property_id?: string
          rating?: number
          review_text?: string
          stay_date?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      seasonal_pricing: {
        Row: {
          created_at: string | null
          end_date: string
          id: string
          min_nights: number | null
          name: string
          price_per_night: number
          property_id: string
          start_date: string
        }
        Insert: {
          created_at?: string | null
          end_date: string
          id?: string
          min_nights?: number | null
          name: string
          price_per_night: number
          property_id: string
          start_date: string
        }
        Update: {
          created_at?: string | null
          end_date?: string
          id?: string
          min_nights?: number | null
          name?: string
          price_per_night?: number
          property_id?: string
          start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "seasonal_pricing_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      site_content: {
        Row: {
          content_en: string | null
          content_fr: string | null
          content_type: string | null
          id: string
          page: string
          section: string
          updated_at: string | null
        }
        Insert: {
          content_en?: string | null
          content_fr?: string | null
          content_type?: string | null
          id?: string
          page: string
          section: string
          updated_at?: string | null
        }
        Update: {
          content_en?: string | null
          content_fr?: string | null
          content_type?: string | null
          id?: string
          page?: string
          section?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "user"
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
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
