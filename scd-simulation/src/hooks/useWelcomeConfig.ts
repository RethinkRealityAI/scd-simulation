import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface WelcomeConfiguration {
  id?: string;
  instance_id?: string | null;
  title: string;
  subtitle: string;
  instructions: string[];
  age_groups: { value: string; label: string }[];
  form_fields: {
    education_level: { required: boolean; label: string };
    organization: { required: boolean; label: string };
    school: { required: boolean; label: string };
    year: { required: boolean; label: string };
    program: { required: boolean; label: string };
    field: { required: boolean; label: string };
    how_heard: { required: boolean; label: string };
  };
  branding: {
    logo_url?: string;
    background_image?: string;
    primary_color: string;
    secondary_color: string;
    accent_color: string;
    text_color: string;
    font_family: string;
  };
  form_title: string;
  form_subtitle: string;
  form_background_opacity: string;
  form_backdrop_blur: string;
  form_border_opacity: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export const defaultWelcomeConfig: WelcomeConfiguration = {
  title: 'Sickle Cell Disease Simulation',
  subtitle: 'A case-based learning experience focused on bias mitigation and cultural safety',
  instructions: [
    'Complete demographic information',
    'Navigate through realistic clinical scenarios',
    'Answer questions and make clinical decisions',
    'Reflect on bias and cultural considerations'
  ],
  age_groups: [
    { value: '18-24', label: '18-24' },
    { value: '25-34', label: '25-34' },
    { value: '35-44', label: '35-44' },
    { value: '45-54', label: '45-54' },
    { value: '55+', label: '55+' }
  ],
  form_fields: {
    education_level: { required: true, label: 'Level of Education' },
    organization: { required: false, label: 'Organization / Institution' },
    school: { required: false, label: 'School' },
    year: { required: false, label: 'Year of Study' },
    program: { required: false, label: 'Program' },
    field: { required: false, label: 'Field of Study' },
    how_heard: { required: false, label: 'How did you hear about this?' }
  },
  branding: {
    primary_color: 'blue',
    secondary_color: 'indigo',
    accent_color: 'cyan',
    text_color: 'white',
    font_family: 'Inter, sans-serif'
  },
  form_title: 'Participant Information',
  form_subtitle: 'Please provide your details to begin the simulation',
  form_background_opacity: '10',
  form_backdrop_blur: 'backdrop-blur-md',
  form_border_opacity: '20',
  is_active: true
};

export function useWelcomeConfig(instanceId?: string) {
  const [config, setConfig] = useState<WelcomeConfiguration>(defaultWelcomeConfig);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConfig = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('welcome_configurations')
        .select('*')
        .eq('is_active', true);

      if (instanceId) {
        query = query.eq('instance_id', instanceId);
      } else {
        query = query.is('instance_id', null);
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No config found, use default
          setConfig(defaultWelcomeConfig);
        } else {
          throw error;
        }
      } else if (data) {
        // Merge with default config to ensure all fields exist
        setConfig({
          ...defaultWelcomeConfig,
          ...data,
          branding: {
            ...defaultWelcomeConfig.branding,
            ...(data.branding || {})
          },
          form_fields: {
            ...defaultWelcomeConfig.form_fields,
            ...(data.form_fields || {})
          }
        });
      }
    } catch (err) {
      console.error('Error fetching welcome config:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch configuration');
    } finally {
      setLoading(false);
    }
  }, [instanceId]);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const saveWelcomeConfiguration = async (newConfig: WelcomeConfiguration) => {
    try {
      setLoading(true);
      setError(null);

      // Prepare data for saving
      const configData = {
        ...newConfig,
        instance_id: instanceId || null,
        updated_at: new Date().toISOString()
      };

      // Check if a config already exists for this scope
      let query = supabase
        .from('welcome_configurations')
        .select('id')
        .eq('is_active', true);

      if (instanceId) {
        query = query.eq('instance_id', instanceId);
      } else {
        query = query.is('instance_id', null);
      }

      const { data: existingConfig } = await query.maybeSingle();

      let result;
      if (existingConfig) {
        // Update existing
        const { data, error } = await supabase
          .from('welcome_configurations')
          .update(configData)
          .eq('id', existingConfig.id)
          .select()
          .single();

        if (error) throw error;
        result = data;
      } else {
        // Insert new
        const { data, error } = await supabase
          .from('welcome_configurations')
          .insert([{
            ...configData,
            created_at: new Date().toISOString()
          }])
          .select()
          .single();

        if (error) throw error;
        result = data;
      }

      setConfig(result);
      return true;
    } catch (err) {
      console.error('Error saving welcome config:', err);
      setError(err instanceof Error ? err.message : 'Failed to save configuration');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const uploadImage = async (file: File, type: 'logo' | 'background'): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${type}-${Math.random()}.${fileExt}`;
      const filePath = `${instanceId ? `instances/${instanceId}/` : ''}welcome/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('public-assets')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('public-assets')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (err) {
      console.error(`Error uploading ${type}:`, err);
      setError(err instanceof Error ? err.message : `Failed to upload ${type}`);
      return null;
    }
  };

  return {
    config,
    loading,
    error,
    saveWelcomeConfiguration,
    uploadImage,
    refreshConfig: fetchConfig
  };
}