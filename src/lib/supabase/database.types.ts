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
      genome_imports: {
        Row: {
          id: string;
          user_id: string;
          source_file_name: string | null;
          variant_count: number;
          interpretation_version: string;
          last_interpreted_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          source_file_name?: string | null;
          variant_count?: number;
          interpretation_version: string;
          last_interpreted_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["genome_imports"]["Insert"]>;
      };
      genome_variants: {
        Row: {
          id: string;
          user_id: string;
          import_id: string;
          gene: string;
          risk_domain: string;
          display_name: string;
          variant_id: string;
          genotype: string;
          clinical_significance: string;
          phenotype: string[];
          display_summary: string;
          importance_score: number;
          clinical_confidence: "high" | "moderate" | "low" | "uncertain";
          linked_biomarkers: string[];
          evidence_source: string[];
          evidence_url: string | null;
          hgvs: string | null;
          last_interpreted_at: string | null;
          knowledge_sources: string[];
          interpretation_version: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          import_id: string;
          gene: string;
          risk_domain: string;
          display_name: string;
          variant_id: string;
          genotype: string;
          clinical_significance: string;
          phenotype?: string[];
          display_summary: string;
          importance_score: number;
          clinical_confidence: "high" | "moderate" | "low" | "uncertain";
          linked_biomarkers?: string[];
          evidence_source?: string[];
          evidence_url?: string | null;
          hgvs?: string | null;
          last_interpreted_at?: string | null;
          knowledge_sources?: string[];
          interpretation_version: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["genome_variants"]["Insert"]>;
      };
      whoop_connections: {
        Row: {
          user_id: string;
          whoop_user_id: number | null;
          email: string | null;
          first_name: string | null;
          last_name: string | null;
          access_token: string;
          refresh_token: string;
          expires_at: string;
          scopes: string | null;
          last_synced_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          whoop_user_id?: number | null;
          email?: string | null;
          first_name?: string | null;
          last_name?: string | null;
          access_token: string;
          refresh_token: string;
          expires_at: string;
          scopes?: string | null;
          last_synced_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["whoop_connections"]["Insert"]>;
      };
      whoop_snapshots: {
        Row: {
          id: string;
          user_id: string;
          snapshot_date: string;
          source: string;
          cycle_id: number | null;
          sleep_id: string | null;
          score_state: string;
          recovery: number | null;
          hrv: number | null;
          resting_hr: number | null;
          sleep_score: number | null;
          strain: number | null;
          sleep_efficiency: number | null;
          respiratory_rate: number | null;
          spo2: number | null;
          skin_temp_celsius: number | null;
          kilojoule: number | null;
          avg_hr: number | null;
          max_hr: number | null;
          raw: Json;
          synced_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          snapshot_date: string;
          source?: string;
          cycle_id?: number | null;
          sleep_id?: string | null;
          score_state: string;
          recovery?: number | null;
          hrv?: number | null;
          resting_hr?: number | null;
          sleep_score?: number | null;
          strain?: number | null;
          sleep_efficiency?: number | null;
          respiratory_rate?: number | null;
          spo2?: number | null;
          skin_temp_celsius?: number | null;
          kilojoule?: number | null;
          avg_hr?: number | null;
          max_hr?: number | null;
          raw?: Json;
          synced_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["whoop_snapshots"]["Insert"]>;
      };
    };
  };
}
