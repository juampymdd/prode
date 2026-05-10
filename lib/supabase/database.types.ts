export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type MatchStatus = "scheduled" | "locked" | "live" | "finished";

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_id: string;
          name: string | null;
          avatar_url: string | null;
          is_app_admin: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name?: string | null;
          avatar_url?: string | null;
          is_app_admin?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string | null;
          avatar_url?: string | null;
          is_app_admin?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      teams: {
        Row: {
          id: string;
          name: string;
          code: string | null;
          flag_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          code?: string | null;
          flag_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          code?: string | null;
          flag_url?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      matches: {
        Row: {
          id: string;
          home_team_id: string | null;
          away_team_id: string | null;
          starts_at: string;
          stage: string | null;
          group_name: string | null;
          status: MatchStatus;
          home_score: number | null;
          away_score: number | null;
          home_label: string | null;
          away_label: string | null;
          match_number: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          home_team_id?: string | null;
          away_team_id?: string | null;
          starts_at: string;
          stage?: string | null;
          group_name?: string | null;
          status?: MatchStatus;
          home_score?: number | null;
          away_score?: number | null;
          home_label?: string | null;
          away_label?: string | null;
          match_number?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          home_team_id?: string | null;
          away_team_id?: string | null;
          starts_at?: string;
          stage?: string | null;
          group_name?: string | null;
          status?: MatchStatus;
          home_score?: number | null;
          away_score?: number | null;
          home_label?: string | null;
          away_label?: string | null;
          match_number?: number | null;
          created_at?: string;
        };
        Relationships: [];
      };
      predictions: {
        Row: {
          id: string;
          match_id: string;
          user_id: string;
          home_score: number;
          away_score: number;
          points: number;
          exact_hit: boolean;
          winner_hit: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          match_id: string;
          user_id: string;
          home_score: number;
          away_score: number;
          points?: number;
          exact_hit?: boolean;
          winner_hit?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          match_id?: string;
          user_id?: string;
          home_score?: number;
          away_score?: number;
          points?: number;
          exact_hit?: boolean;
          winner_hit?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      group_standings: {
        Row: {
          group_name: string;
          team_id: string;
          team_name: string;
          team_code: string | null;
          team_flag_url: string | null;
          points: number;
          played: number;
          won: number;
          drawn: number;
          lost: number;
          goals_for: number;
          goals_against: number;
          goal_diff: number;
          position: number;
        };
        Relationships: [];
      };
    };
    Functions: {
      is_app_admin: {
        Args: { p_user_id: string };
        Returns: boolean;
      };
      recalculate_match_points: {
        Args: { p_match_id: string; p_caller_id: string };
        Returns: number;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
