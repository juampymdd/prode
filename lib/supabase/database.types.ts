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
    PostgrestVersion: "14.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      matches: {
        Row: {
          away_label: string | null
          away_score: number | null
          away_team_id: string | null
          created_at: string
          group_name: string | null
          home_label: string | null
          home_score: number | null
          home_team_id: string | null
          id: string
          match_number: number | null
          stage: string | null
          starts_at: string
          status: string
        }
        Insert: {
          away_label?: string | null
          away_score?: number | null
          away_team_id?: string | null
          created_at?: string
          group_name?: string | null
          home_label?: string | null
          home_score?: number | null
          home_team_id?: string | null
          id?: string
          match_number?: number | null
          stage?: string | null
          starts_at: string
          status?: string
        }
        Update: {
          away_label?: string | null
          away_score?: number | null
          away_team_id?: string | null
          created_at?: string
          group_name?: string | null
          home_label?: string | null
          home_score?: number | null
          home_team_id?: string | null
          id?: string
          match_number?: number | null
          stage?: string | null
          starts_at?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "matches_away_team_id_fkey"
            columns: ["away_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_home_team_id_fkey"
            columns: ["home_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      predictions: {
        Row: {
          away_score: number
          created_at: string
          exact_hit: boolean
          home_score: number
          id: string
          match_id: string
          points: number
          updated_at: string
          user_id: string
          winner_hit: boolean
        }
        Insert: {
          away_score: number
          created_at?: string
          exact_hit?: boolean
          home_score: number
          id?: string
          match_id: string
          points?: number
          updated_at?: string
          user_id: string
          winner_hit?: boolean
        }
        Update: {
          away_score?: number
          created_at?: string
          exact_hit?: boolean
          home_score?: number
          id?: string
          match_id?: string
          points?: number
          updated_at?: string
          user_id?: string
          winner_hit?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "predictions_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          birthdate: string | null
          created_at: string
          disabled_at: string | null
          id: string
          is_app_admin: boolean
          name: string | null
          terms_accepted_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          birthdate?: string | null
          created_at?: string
          disabled_at?: string | null
          id?: string
          is_app_admin?: boolean
          name?: string | null
          terms_accepted_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          birthdate?: string | null
          created_at?: string
          disabled_at?: string | null
          id?: string
          is_app_admin?: boolean
          name?: string | null
          terms_accepted_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      signup_requests: {
        Row: {
          birthdate: string
          created_at: string
          email: string
          id: string
          name: string
          reject_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          terms_accepted_at: string
          updated_at: string
        }
        Insert: {
          birthdate: string
          created_at?: string
          email: string
          id?: string
          name: string
          reject_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          terms_accepted_at: string
          updated_at?: string
        }
        Update: {
          birthdate?: string
          created_at?: string
          email?: string
          id?: string
          name?: string
          reject_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          terms_accepted_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      teams: {
        Row: {
          code: string | null
          created_at: string
          flag_url: string | null
          id: string
          name: string
        }
        Insert: {
          code?: string | null
          created_at?: string
          flag_url?: string | null
          id?: string
          name: string
        }
        Update: {
          code?: string | null
          created_at?: string
          flag_url?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
    }
    Views: {
      group_standings: {
        Row: {
          drawn: number | null
          goal_diff: number | null
          goals_against: number | null
          goals_for: number | null
          group_name: string | null
          lost: number | null
          played: number | null
          points: number | null
          position: number | null
          team_code: string | null
          team_flag_url: string | null
          team_id: string | null
          team_name: string | null
          won: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      clear_match_result: {
        Args: { p_caller_id: string; p_match_id: string }
        Returns: undefined
      }
      is_app_admin: { Args: { p_user_id: string }; Returns: boolean }
      recalculate_match_points: {
        Args: { p_caller_id: string; p_match_id: string }
        Returns: number
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const


// ----------------------------------------------------------------------
// Hand-maintained convenience types for places where the generated row
// shape is too loose. The matches.status CHECK constraint enforces these
// at the DB layer; mirror them here so app code is exhaustive-checkable.

export type MatchStatus = "scheduled" | "locked" | "live" | "finished";
