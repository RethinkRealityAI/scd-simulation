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
    };
  };
};