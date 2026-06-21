export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type RoutineStatus = 'todo' | 'active' | 'done' | 'delayed' | 'skipped';
export type SubscriptionTier = 'free' | 'pro';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          subscription_tier: SubscriptionTier;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name?: string | null;
          subscription_tier?: SubscriptionTier;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string | null;
          subscription_tier?: SubscriptionTier;
          updated_at?: string;
        };
        Relationships: [];
      };
      goals: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          rolemodel: string;
          lifestyle_tags: string[];
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          rolemodel: string;
          lifestyle_tags?: string[];
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          rolemodel?: string;
          lifestyle_tags?: string[];
          is_active?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      daily_schedules: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
        };
        Relationships: [];
      };
      routine_blocks: {
        Row: {
          id: string;
          schedule_id: string;
          user_id: string;
          time: string;
          task: string;
          duration_label: string;
          duration_minutes: number;
          status: RoutineStatus;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          schedule_id: string;
          user_id: string;
          time: string;
          task: string;
          duration_label: string;
          duration_minutes: number;
          status?: RoutineStatus;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          schedule_id?: string;
          user_id?: string;
          time?: string;
          task?: string;
          duration_label?: string;
          duration_minutes?: number;
          status?: RoutineStatus;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      checkins: {
        Row: {
          id: string;
          block_id: string;
          user_id: string;
          actual_duration: number | null;
          note: string | null;
          completed_at: string;
        };
        Insert: {
          id?: string;
          block_id: string;
          user_id: string;
          actual_duration?: number | null;
          note?: string | null;
          completed_at?: string;
        };
        Update: {
          actual_duration?: number | null;
          note?: string | null;
          completed_at?: string;
        };
        Relationships: [];
      };
      feedbacks: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          ai_summary: string | null;
          score: number | null;
          next_schedule_preview: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          ai_summary?: string | null;
          score?: number | null;
          next_schedule_preview?: Json | null;
          created_at?: string;
        };
        Update: {
          ai_summary?: string | null;
          score?: number | null;
          next_schedule_preview?: Json | null;
        };
        Relationships: [];
      };
    };
    Views: {
      user_streaks: {
        Row: {
          user_id: string | null;
          total_completed_days: number | null;
        };
        Relationships: [];
      };
    };
    Functions: Record<string, never>;
  };
}
