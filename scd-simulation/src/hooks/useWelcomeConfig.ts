import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface WelcomeConfiguration {
  id: string;
  background_image_url: string;
  background_blur: number;
  background_overlay_opacity: number;
  main_title: string;
  main_title_size: string;
  gradient_title: string;
  gradient_colors: string;
  subtitle: string;
  subtitle_size: string;
  form_title: string;
  form_subtitle: string;
  form_backdrop_blur: string;
  form_background_opacity: number;
  form_border_opacity: number;
  input_backdrop_blur: string;
  input_border_opacity: number;
  button_gradient: string;
  button_text: string;
  features: Array<{
    icon: string;
    title: string;
    description: string;
    color: string;
  }>;
  form_fields: {
    education_level: {
      label: string;
      required: boolean;
      options: Array<{ value: string; label: string }>;
    };
    organization: {
      label: string;
      required: boolean;
      placeholder: string;
    };
    school: {
      label: string;
      required: boolean;
      placeholder: string;
    };
    year: {
      label: string;
      required: boolean;
      options: Array<{ value: string; label: string }>;
    };
    program: {
      label: string;
      required: boolean;
      placeholder: string;
    };
    field: {
      label: string;
      required: boolean;
      placeholder: string;
    };
    how_heard: {
      label: string;
      required: boolean;
      options: Array<{ value: string; label: string }>;
    };
  };
  data_collection_title: string;
  data_collection_text: string;
  data_collection_footer: string[];
  modal_enabled: boolean;
  modal_steps: Array<{
    title: string;
    content_type: string;
    items: string[];
  }>;
  version: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const defaultConfig: WelcomeConfiguration = {
  id: '',
  background_image_url: 'https://i.ibb.co/BH6c7SRj/Splas.jpg',
  background_blur: 0,
  background_overlay_opacity: 70,
  main_title: 'Sickle Cell Vaso-Occlusive Crisis Care Digital Simulation',
  main_title_size: 'text-7xl',
  gradient_title: 'Sickle Cell Vaso-Occlusive Crisis Care Digital Simulation',
  gradient_colors: 'from-blue-400 via-purple-400 to-cyan-400',
  subtitle: 'Enhance your cultural and medical competency when treating youth with sickle cell disease experiencing vaso-occlusive crises during hospital admission.',
  subtitle_size: 'text-xl',
  form_title: 'User Details',
  form_subtitle: 'Please provide your information to begin',
  form_backdrop_blur: 'backdrop-blur-xl',
  form_background_opacity: 10,
  form_border_opacity: 20,
  input_backdrop_blur: 'backdrop-blur-sm',
  input_border_opacity: 30,
  button_gradient: 'from-blue-500 to-purple-500',
  button_text: 'Begin Simulation',
  features: [
    {
      icon: 'Stethoscope',
      title: 'Interactive Scenarios',
      description: 'Realistic patient scenarios with comprehensive assessment tools',
      color: 'blue'
    },
    {
      icon: 'Brain',
      title: 'Evidence-Based Learning',
      description: 'Focus on cultural sensitivity and treatment protocols',
      color: 'purple'
    },
    {
      icon: 'Target',
      title: 'Real-Time Assessment',
      description: 'Immediate feedback with performance analytics',
      color: 'cyan'
    }
  ],
  form_fields: {
    education_level: {
      label: 'Education Level',
      required: true,
      options: [
        { value: 'nursing-diploma', label: 'Nursing Diploma' },
        { value: 'associate-nursing', label: 'Associate Degree in Nursing' },
        { value: 'bachelor-nursing', label: 'Bachelor of Science in Nursing' },
        { value: 'master-nursing', label: 'Master of Science in Nursing' },
        { value: 'md', label: 'Doctor of Medicine (MD)' },
        { value: 'do', label: 'Doctor of Osteopathic Medicine (DO)' },
        { value: 'resident', label: 'Medical Resident' },
        { value: 'fellow', label: 'Medical Fellow' },
        { value: 'attending', label: 'Attending Physician' },
        { value: 'other', label: 'Other Healthcare Professional' }
      ]
    },
    organization: {
      label: 'Organization',
      required: true,
      placeholder: 'Enter your organization'
    },
    school: {
      label: 'School',
      required: true,
      placeholder: 'Enter your school'
    },
    year: {
      label: 'Year',
      required: true,
      options: [
        { value: '1st-year', label: '1st Year' },
        { value: '2nd-year', label: '2nd Year' },
        { value: '3rd-year', label: '3rd Year' },
        { value: '4th-year', label: '4th Year' },
        { value: '5th-year', label: '5th Year' },
        { value: 'graduate', label: 'Graduate' },
        { value: 'post-graduate', label: 'Post-Graduate' },
        { value: 'professional', label: 'Professional' }
      ]
    },
    program: {
      label: 'Program',
      required: true,
      placeholder: 'Enter your program'
    },
    field: {
      label: 'Field',
      required: true,
      placeholder: 'Enter your field of study/work'
    },
    how_heard: {
      label: 'How did you hear about this simulation?',
      required: true,
      options: [
        { value: 'social-media', label: 'Social Media' },
        { value: 'email', label: 'Email' },
        { value: 'colleague', label: 'Colleague/Friend' },
        { value: 'instructor', label: 'Instructor/Professor' },
        { value: 'conference', label: 'Conference/Event' },
        { value: 'website', label: 'Website' },
        { value: 'search-engine', label: 'Search Engine' },
        { value: 'other', label: 'Other' }
      ]
    }
  },
  data_collection_title: 'Data Collection',
  data_collection_text: 'Within the digital simulation, participant responses will be collected and analysed to see how learners engage with different scenarios and decision points. This information will help highlight common misunderstandings, strengths, and areas where additional guidance is needed. The insights gained will be used to refine the simulation and guide future educational initiatives focused on sickle cell awareness and support.',
  data_collection_footer: [
    'This simulation is designed for healthcare education and research purposes.',
    'All data is anonymized and contributes to improving sickle cell care education.'
  ],
  modal_enabled: true,
  modal_steps: [
    {
      title: 'Welcome to the Simulation',
      content_type: 'learning_objectives',
      items: [
        'Recognize clinical symptoms of vaso-occlusive crisis (VOC) and possible acute chest syndrome (ACS)',
        'Assign interprofessional roles and coordinate care',
        'Provide timely and evidence-based pain management',
        'Communicate effectively with cultural humility',
        'Identify and mitigate clinical bias and stigma in SCD care'
      ]
    }
  ],
  version: 1,
  is_active: true,
  created_at: '',
  updated_at: ''
};

export const useWelcomeConfig = () => {
  const [config, setConfig] = useState<WelcomeConfiguration>(defaultConfig);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWelcomeConfig();
  }, []);

  const fetchWelcomeConfig = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('welcome_configurations')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No configuration found, use default
          console.log('No welcome configuration found, using default');
          setConfig(defaultConfig);
        } else {
          throw error;
        }
      } else {
        setConfig(data);
      }
    } catch (err) {
      console.error('Error fetching welcome configuration:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch welcome configuration');
      // Use default config on error
      setConfig(defaultConfig);
    } finally {
      setLoading(false);
    }
  };

  const saveWelcomeConfig = async (newConfig: Partial<WelcomeConfiguration>): Promise<boolean> => {
    try {
      setError(null);
      
      const configData = {
        ...newConfig,
        is_active: true,
        updated_at: new Date().toISOString()
      };

      // Try to update existing config first
      const { data: updateData, error: updateError } = await supabase
        .from('welcome_configurations')
        .update(configData)
        .eq('is_active', true)
        .select()
        .single();

      if (updateError) {
        // If no active config exists, create new one
        if (updateError.code === 'PGRST116') {
          const { data: insertData, error: insertError } = await supabase
            .from('welcome_configurations')
            .insert([{
              ...defaultConfig,
              ...configData,
              created_at: new Date().toISOString()
            }])
            .select()
            .single();

          if (insertError) throw insertError;
          
          setConfig(insertData);
        } else {
          throw updateError;
        }
      } else {
        setConfig(updateData);
      }

      return true;
    } catch (err) {
      console.error('Error saving welcome configuration:', err);
      setError(err instanceof Error ? err.message : 'Failed to save welcome configuration');
      return false;
    }
  };

  const resetToDefault = async (): Promise<boolean> => {
    try {
      setError(null);
      
      // Deactivate all existing configurations
      const { error: deactivateError } = await supabase
        .from('welcome_configurations')
        .update({ is_active: false })
        .eq('is_active', true);

      if (deactivateError) throw deactivateError;

      // Create new default configuration
      const { data, error: insertError } = await supabase
        .from('welcome_configurations')
        .insert([{
          ...defaultConfig,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (insertError) throw insertError;
      
      setConfig(data);
      
      return true;
    } catch (err) {
      console.error('Error resetting welcome configuration:', err);
      setError(err instanceof Error ? err.message : 'Failed to reset welcome configuration');
      return false;
    }
  };

  const exportConfig = (): string => {
    return JSON.stringify(config, null, 2);
  };

  const importConfig = async (configJson: string): Promise<boolean> => {
    try {
      const importedConfig = JSON.parse(configJson);
      
      // Validate required fields
      if (!importedConfig.main_title || !importedConfig.subtitle) {
        throw new Error('Invalid configuration: missing required fields');
      }
      
      return await saveWelcomeConfig(importedConfig);
    } catch (err) {
      console.error('Error importing welcome configuration:', err);
      setError(err instanceof Error ? err.message : 'Failed to import welcome configuration');
      return false;
    }
  };

  return {
    config,
    loading,
    error,
    fetchWelcomeConfig,
    saveWelcomeConfig,
    resetToDefault,
    exportConfig,
    importConfig
  };
};