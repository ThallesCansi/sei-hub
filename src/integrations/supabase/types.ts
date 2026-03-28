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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      academic_terms: {
        Row: {
          created_at: string
          end_date: string
          id: string
          is_current: boolean
          label: string
          start_date: string
        }
        Insert: {
          created_at?: string
          end_date: string
          id?: string
          is_current?: boolean
          label: string
          start_date: string
        }
        Update: {
          created_at?: string
          end_date?: string
          id?: string
          is_current?: boolean
          label?: string
          start_date?: string
        }
        Relationships: []
      }
      attachments: {
        Row: {
          created_at: string
          file_name: string
          id: string
          mime_type: string
          post_id: string
          size_bytes: number
          storage_path: string
        }
        Insert: {
          created_at?: string
          file_name: string
          id?: string
          mime_type: string
          post_id: string
          size_bytes: number
          storage_path: string
        }
        Update: {
          created_at?: string
          file_name?: string
          id?: string
          mime_type?: string
          post_id?: string
          size_bytes?: number
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "attachments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          author_id: string
          body: string
          created_at: string
          hidden: boolean
          hidden_reason: string | null
          id: string
          parent_id: string | null
          post_id: string
          updated_at: string
        }
        Insert: {
          author_id: string
          body: string
          created_at?: string
          hidden?: boolean
          hidden_reason?: string | null
          id?: string
          parent_id?: string | null
          post_id: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          body?: string
          created_at?: string
          hidden?: boolean
          hidden_reason?: string | null
          id?: string
          parent_id?: string | null
          post_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      disciplines: {
        Row: {
          area: string | null
          code: string | null
          created_at: string
          graph_area_id: string | null
          graph_x: number | null
          graph_y: number | null
          id: string
          name: string
          semester: number
          slug: string | null
          year: number
        }
        Insert: {
          area?: string | null
          code?: string | null
          created_at?: string
          graph_area_id?: string | null
          graph_x?: number | null
          graph_y?: number | null
          id?: string
          name: string
          semester: number
          slug?: string | null
          year: number
        }
        Update: {
          area?: string | null
          code?: string | null
          created_at?: string
          graph_area_id?: string | null
          graph_x?: number | null
          graph_y?: number | null
          id?: string
          name?: string
          semester?: number
          slug?: string | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "disciplines_graph_area_id_fkey"
            columns: ["graph_area_id"]
            isOneToOne: false
            referencedRelation: "graph_areas"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      graph_areas: {
        Row: {
          color_bg: string
          color_text: string
          created_at: string
          id: string
          name: string
          position_x: number
          position_y: number
          slug: string
        }
        Insert: {
          color_bg?: string
          color_text?: string
          created_at?: string
          id?: string
          name: string
          position_x?: number
          position_y?: number
          slug: string
        }
        Update: {
          color_bg?: string
          color_text?: string
          created_at?: string
          id?: string
          name?: string
          position_x?: number
          position_y?: number
          slug?: string
        }
        Relationships: []
      }
      post_revisions: {
        Row: {
          body_snapshot: string
          created_at: string
          editor_id: string
          id: string
          post_id: string
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["revision_status"]
          title_snapshot: string
        }
        Insert: {
          body_snapshot: string
          created_at?: string
          editor_id: string
          id?: string
          post_id: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["revision_status"]
          title_snapshot: string
        }
        Update: {
          body_snapshot?: string
          created_at?: string
          editor_id?: string
          id?: string
          post_id?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["revision_status"]
          title_snapshot?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_revisions_editor_id_fkey"
            columns: ["editor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_revisions_editor_id_fkey"
            columns: ["editor_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_revisions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_revisions_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_revisions_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      post_tags: {
        Row: {
          post_id: string
          tag_id: string
        }
        Insert: {
          post_id: string
          tag_id: string
        }
        Update: {
          post_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_tags_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          academic_term_id: string | null
          approved_at: string | null
          author_id: string
          body: string
          comments_locked: boolean
          created_at: string
          discipline_id: string | null
          event_date: string | null
          event_end_date: string | null
          id: string
          last_approved_revision_id: string | null
          pinned: boolean
          rejection_reason: string | null
          status: Database["public"]["Enums"]["post_status"]
          title: string
          turma_target: number | null
          type: Database["public"]["Enums"]["post_type"]
          updated_at: string
        }
        Insert: {
          academic_term_id?: string | null
          approved_at?: string | null
          author_id: string
          body: string
          comments_locked?: boolean
          created_at?: string
          discipline_id?: string | null
          event_date?: string | null
          event_end_date?: string | null
          id?: string
          last_approved_revision_id?: string | null
          pinned?: boolean
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["post_status"]
          title: string
          turma_target?: number | null
          type: Database["public"]["Enums"]["post_type"]
          updated_at?: string
        }
        Update: {
          academic_term_id?: string | null
          approved_at?: string | null
          author_id?: string
          body?: string
          comments_locked?: boolean
          created_at?: string
          discipline_id?: string | null
          event_date?: string | null
          event_end_date?: string | null
          id?: string
          last_approved_revision_id?: string | null
          pinned?: boolean
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["post_status"]
          title?: string
          turma_target?: number | null
          type?: Database["public"]["Enums"]["post_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_last_approved_revision"
            columns: ["last_approved_revision_id"]
            isOneToOne: false
            referencedRelation: "post_revisions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_academic_term_id_fkey"
            columns: ["academic_term_id"]
            isOneToOne: false
            referencedRelation: "academic_terms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_discipline_id_fkey"
            columns: ["discipline_id"]
            isOneToOne: false
            referencedRelation: "disciplines"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          admin_label: string | null
          avatar_url: string | null
          bio: string | null
          created_at: string
          full_name: string
          id: string
          interests: string[] | null
          is_admin: boolean
          links: Json | null
          matricula: string
          status: Database["public"]["Enums"]["profile_status"]
          turma_ano: number
          updated_at: string
        }
        Insert: {
          admin_label?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          full_name: string
          id: string
          interests?: string[] | null
          is_admin?: boolean
          links?: Json | null
          matricula: string
          status?: Database["public"]["Enums"]["profile_status"]
          turma_ano: number
          updated_at?: string
        }
        Update: {
          admin_label?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          full_name?: string
          id?: string
          interests?: string[] | null
          is_admin?: boolean
          links?: Json | null
          matricula?: string
          status?: Database["public"]["Enums"]["profile_status"]
          turma_ano?: number
          updated_at?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          created_at: string
          details: string | null
          id: string
          reason: Database["public"]["Enums"]["report_reason"]
          reporter_id: string
          resolved_at: string | null
          resolved_by: string | null
          status: Database["public"]["Enums"]["report_status"]
          target_id: string
          target_type: Database["public"]["Enums"]["report_target_type"]
        }
        Insert: {
          created_at?: string
          details?: string | null
          id?: string
          reason: Database["public"]["Enums"]["report_reason"]
          reporter_id: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: Database["public"]["Enums"]["report_status"]
          target_id: string
          target_type: Database["public"]["Enums"]["report_target_type"]
        }
        Update: {
          created_at?: string
          details?: string | null
          id?: string
          reason?: Database["public"]["Enums"]["report_reason"]
          reporter_id?: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: Database["public"]["Enums"]["report_status"]
          target_id?: string
          target_type?: Database["public"]["Enums"]["report_target_type"]
        }
        Relationships: [
          {
            foreignKeyName: "reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          category: string | null
          id: string
          name: string
        }
        Insert: {
          category?: string | null
          id?: string
          name: string
        }
        Update: {
          category?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
    }
    Views: {
      public_profiles: {
        Row: {
          full_name: string | null
          id: string | null
          is_admin: boolean | null
          matricula: string | null
          turma_ano: number | null
        }
        Insert: {
          full_name?: string | null
          id?: string | null
          is_admin?: boolean | null
          matricula?: string | null
          turma_ano?: number | null
        }
        Update: {
          full_name?: string | null
          id?: string | null
          is_admin?: boolean | null
          matricula?: string | null
          turma_ano?: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_profile_status: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["profile_status"]
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      post_status: "pending" | "approved" | "rejected" | "archived"
      post_type: "informativo" | "evento" | "material" | "trabalho" | "estagio"
      profile_status: "pending" | "approved" | "suspended"
      report_reason:
        | "spam"
        | "assedio"
        | "direitos_autorais"
        | "desinformacao"
        | "outros"
      report_status: "open" | "in_review" | "resolved"
      report_target_type: "post" | "comment"
      revision_status: "pending" | "approved" | "rejected"
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
      post_status: ["pending", "approved", "rejected", "archived"],
      post_type: ["informativo", "evento", "material", "trabalho", "estagio"],
      profile_status: ["pending", "approved", "suspended"],
      report_reason: [
        "spam",
        "assedio",
        "direitos_autorais",
        "desinformacao",
        "outros",
      ],
      report_status: ["open", "in_review", "resolved"],
      report_target_type: ["post", "comment"],
      revision_status: ["pending", "approved", "rejected"],
    },
  },
} as const
