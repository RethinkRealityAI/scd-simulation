import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables!');
  console.error('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file or Netlify environment variables.');
  throw new Error('Missing required Supabase environment variables. Check console for details.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      simulation_videos: {
        Row: {
          id: string;
          scene_id: number;
          title: string;
          description: string;
          video_url: string;
          poster_url?: string;
          audio_narration_url?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          scene_id: number;
          title: string;
          description: string;
          video_url: string;
          poster_url?: string;
          audio_narration_url?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          scene_id?: number;
          title?: string;
          description?: string;
          video_url?: string;
          poster_url?: string;
          audio_narration_url?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      scene_characters: {
        Row: {
          id: string;
          scene_id: number;
          character_name: string;
          character_role?: string;
          avatar_url?: string;
          display_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          scene_id: number;
          character_name: string;
          character_role?: string;
          avatar_url?: string;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          scene_id?: number;
          character_name?: string;
          character_role?: string;
          avatar_url?: string;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      scene_audio_files: {
        Row: {
          id: string;
          scene_id: number;
          character_id: string;
          audio_title: string;
          audio_description?: string;
          audio_url: string;
          duration_seconds?: number;
          display_order: number;
          auto_play: boolean;
          hide_player?: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          scene_id: number;
          character_id: string;
          audio_title: string;
          audio_description?: string;
          audio_url: string;
          duration_seconds?: number;
          display_order?: number;
          auto_play?: boolean;
          hide_player?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          scene_id?: number;
          character_id?: string;
          audio_title?: string;
          audio_description?: string;
          audio_url?: string;
          duration_seconds?: number;
          display_order?: number;
          auto_play?: boolean;
          hide_player?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      session_data: {
        Row: {
          id: string;
          session_id: string;
          user_demographics: any;
          responses: any;
          category_scores: any;
          final_score: number;
          completion_time: number;
          completed_scenes: number[];
          submission_timestamp: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          user_demographics: any;
          responses: any;
          category_scores: any;
          final_score: number;
          completion_time: number;
          completed_scenes: number[];
          submission_timestamp?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          user_demographics?: any;
          responses?: any;
          category_scores?: any;
          final_score?: number;
          completion_time?: number;
          completed_scenes?: number[];
          submission_timestamp?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      simulation_instances: {
        Row: {
          id: string;
          name: string;
          institution_name: string;
          institution_id: string;
          description?: string;
          webhook_url?: string;
          webhook_secret?: string;
          webhook_retry_count: number;
          webhook_timeout_seconds: number;
          branding_config: any;
          content_config: any;
          is_active: boolean;
          requires_approval: boolean;
          max_sessions_per_day?: number;
          session_timeout_minutes: number;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          institution_name: string;
          institution_id: string;
          description?: string;
          webhook_url?: string;
          webhook_secret?: string;
          webhook_retry_count?: number;
          webhook_timeout_seconds?: number;
          branding_config?: any;
          content_config?: any;
          is_active?: boolean;
          requires_approval?: boolean;
          max_sessions_per_day?: number;
          session_timeout_minutes?: number;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          institution_name?: string;
          institution_id?: string;
          description?: string;
          webhook_url?: string;
          webhook_secret?: string;
          webhook_retry_count?: number;
          webhook_timeout_seconds?: number;
          branding_config?: any;
          content_config?: any;
          is_active?: boolean;
          requires_approval?: boolean;
          max_sessions_per_day?: number;
          session_timeout_minutes?: number;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      instance_access_tokens: {
        Row: {
          id: string;
          instance_id: string;
          token: string;
          name: string;
          description?: string;
          expires_at?: string;
          max_uses?: number;
          current_uses: number;
          is_active: boolean;
          last_used_at?: string;
          created_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          instance_id: string;
          token: string;
          name: string;
          description?: string;
          expires_at?: string;
          max_uses?: number;
          current_uses?: number;
          is_active?: boolean;
          last_used_at?: string;
          created_by?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          instance_id?: string;
          token?: string;
          name?: string;
          description?: string;
          expires_at?: string;
          max_uses?: number;
          current_uses?: number;
          is_active?: boolean;
          last_used_at?: string;
          created_by?: string;
          created_at?: string;
        };
      };
      instance_session_data: {
        Row: {
          id: string;
          instance_id: string;
          session_id: string;
          user_demographics: any;
          responses: any;
          category_scores: any;
          final_score: number;
          completion_time: number;
          completed_scenes: number[];
          start_time?: string;
          completion_time?: string;
          submission_timestamp?: string;
          webhook_sent: boolean;
          webhook_attempts: number;
          webhook_last_attempt?: string;
          webhook_error?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          instance_id: string;
          session_id: string;
          user_demographics: any;
          responses: any;
          category_scores: any;
          final_score: number;
          completion_time: number;
          completed_scenes: number[];
          start_time?: string;
          completion_time?: string;
          submission_timestamp?: string;
          webhook_sent?: boolean;
          webhook_attempts?: number;
          webhook_last_attempt?: string;
          webhook_error?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          instance_id?: string;
          session_id?: string;
          user_demographics?: any;
          responses?: any;
          category_scores?: any;
          final_score?: number;
          completion_time?: number;
          completed_scenes?: number[];
          start_time?: string;
          completion_time?: string;
          submission_timestamp?: string;
          webhook_sent?: boolean;
          webhook_attempts?: number;
          webhook_last_attempt?: string;
          webhook_error?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};