export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string;
          email: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name: string;
          email?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          display_name?: string;
          email?: string | null;
          updated_at?: string;
        };
      };
      test_sessions: {
        Row: {
          id: string;
          user_id: string;
          session_date: string;
          lab_name: string | null;
          source_file_name: string | null;
          storage_path: string | null;
          biomarker_count: number;
          readings: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          session_date: string;
          lab_name?: string | null;
          source_file_name?: string | null;
          storage_path?: string | null;
          biomarker_count?: number;
          readings?: Json;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["test_sessions"]["Insert"]>;
      };
      interventions: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          type: string;
          dosage: string | null;
          frequency: string | null;
          start_date: string;
          end_date: string | null;
          notes: string | null;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          type: string;
          dosage?: string | null;
          frequency?: string | null;
          start_date: string;
          end_date?: string | null;
          notes?: string | null;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["interventions"]["Insert"]>;
      };
    };
  };
}
