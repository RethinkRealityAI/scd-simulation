import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface SimulationInstance {
  id: string;
  name: string;
  institution_name: string;
  institution_id: string;
  description?: string;
  webhook_url?: string;
  webhook_secret?: string;
  webhook_retry_count: number;
  webhook_timeout_seconds: number;
  branding_config: {
    logo_url?: string;
    primary_color: string;
    secondary_color: string;
    accent_color: string;
    background_color: string;
    text_color: string;
    font_family: string;
    custom_css?: string;
  };
  content_config: {
    welcome_config?: any;
    scene_order: number[];
    custom_scenes: any[];
    disabled_features: string[];
    scene_setup_mode?: 'template' | 'scratch';
  };
  is_active: boolean;
  requires_approval: boolean;
  max_sessions_per_day?: number;
  session_timeout_minutes: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface AccessToken {
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
}

export interface InstanceSessionData {
  id: string;
  instance_id: string;
  session_id: string;
  user_demographics: any;
  responses: any;
  category_scores: any;
  final_score: number;
  completion_time: number;
  completed_scenes: number[];
  start_time: string;
  submission_timestamp: string;
  webhook_sent: boolean;
  webhook_attempts: number;
  webhook_last_attempt?: string;
  webhook_error?: string;
  created_at: string;
  updated_at: string;
}

export function useSimulationInstances() {
  const [instances, setInstances] = useState<SimulationInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInstances = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('simulation_instances')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInstances(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch instances');
    } finally {
      setLoading(false);
    }
  };

  const cloneGlobalSceneTemplateToInstance = async (instanceId: string): Promise<number[]> => {
    // Copy global scene order rows to the new instance.
    const { data: globalSceneOrder, error: sceneOrderError } = await supabase
      .from('scene_order')
      .select('scene_id, display_order, is_completion_scene, is_active')
      .is('instance_id', null)
      .order('display_order');

    if (sceneOrderError) throw sceneOrderError;

    const copiedSceneOrder = (globalSceneOrder || []).map(item => item.scene_id);

    if (globalSceneOrder && globalSceneOrder.length > 0) {
      const orderInserts = globalSceneOrder.map(item => ({
        instance_id: instanceId,
        scene_id: item.scene_id,
        display_order: item.display_order,
        is_completion_scene: item.is_completion_scene,
        is_active: item.is_active,
      }));

      const { error: insertOrderError } = await supabase
        .from('scene_order')
        .insert(orderInserts);

      if (insertOrderError) throw insertOrderError;
    }

    // Copy global scene configuration rows to the new instance.
    // We include layout_config/vitals_display_config if available in schema.
    const { data: globalConfigs, error: configError } = await supabase
      .from('scene_configurations')
      .select('scene_id, title, description, vitals_config, vitals_display_config, quiz_questions, action_prompts, discussion_prompts, clinical_findings, scoring_categories, layout_config, is_active')
      .is('instance_id', null)
      .eq('is_active', true)
      .order('scene_id');

    // If the environment has not applied layout/vitals display columns yet,
    // retry with a narrower selection instead of hard-failing instance creation.
    let resolvedConfigs = globalConfigs;
    const supportsExtendedSceneConfigColumns = !configError;
    if (configError) {
      const { data: fallbackConfigs, error: fallbackError } = await supabase
        .from('scene_configurations')
        .select('scene_id, title, description, vitals_config, quiz_questions, action_prompts, discussion_prompts, clinical_findings, scoring_categories, is_active')
        .is('instance_id', null)
        .eq('is_active', true)
        .order('scene_id');

      if (fallbackError) throw fallbackError;
      resolvedConfigs = fallbackConfigs as any[];
    }

    if (resolvedConfigs && resolvedConfigs.length > 0) {
      const configInserts = resolvedConfigs.map(config => {
        const baseInsert = {
          instance_id: instanceId,
          scene_id: config.scene_id,
          title: config.title,
          description: config.description,
          vitals_config: config.vitals_config,
          quiz_questions: config.quiz_questions,
          action_prompts: config.action_prompts,
          discussion_prompts: config.discussion_prompts,
          clinical_findings: config.clinical_findings,
          scoring_categories: config.scoring_categories,
          is_active: config.is_active,
        };

        if (!supportsExtendedSceneConfigColumns) {
          return baseInsert;
        }

        return {
          ...baseInsert,
          vitals_display_config: (config as any).vitals_display_config ?? null,
          layout_config: (config as any).layout_config ?? null,
        };
      });

      const { error: insertConfigError } = await supabase
        .from('scene_configurations')
        .insert(configInserts);

      if (insertConfigError) throw insertConfigError;
    }

    // Copy global video rows to the new instance if available.
    const { data: globalVideos, error: videosError } = await supabase
      .from('simulation_videos')
      .select('scene_id, title, description, video_url, poster_url, audio_narration_url, duration_seconds')
      .is('instance_id', null);

    if (videosError) throw videosError;

    if (globalVideos && globalVideos.length > 0) {
      const videoInserts = globalVideos.map(video => ({
        instance_id: instanceId,
        scene_id: video.scene_id,
        title: video.title,
        description: video.description,
        video_url: video.video_url,
        poster_url: video.poster_url,
        audio_narration_url: video.audio_narration_url,
        duration_seconds: video.duration_seconds,
      }));

      const { error: insertVideoError } = await supabase
        .from('simulation_videos')
        .insert(videoInserts);

      if (insertVideoError) throw insertVideoError;
    }

    return copiedSceneOrder;
  };

  const rollbackIncompleteTemplateInstance = async (instanceId: string) => {
    // Best-effort compensation when template provisioning fails mid-flight.
    const cleanupSteps = [
      supabase.from('simulation_videos').delete().eq('instance_id', instanceId),
      supabase.from('scene_configurations').delete().eq('instance_id', instanceId),
      supabase.from('scene_order').delete().eq('instance_id', instanceId),
      supabase.from('simulation_instances').delete().eq('id', instanceId),
    ];

    for (const step of cleanupSteps) {
      const { error } = await step;
      if (error) {
        throw error;
      }
    }

    setInstances(prev => prev.filter(instance => instance.id !== instanceId));
  };

  const createInstance = async (instanceData: Partial<SimulationInstance>) => {
    try {
      const requestedSetupMode =
        instanceData.content_config?.scene_setup_mode === 'template'
          ? 'template'
          : 'scratch';

      instanceData.content_config = {
        scene_order: requestedSetupMode === 'scratch' ? [] : (instanceData.content_config?.scene_order || []),
        custom_scenes: instanceData.content_config?.custom_scenes || [],
        disabled_features: instanceData.content_config?.disabled_features || [],
        scene_setup_mode: requestedSetupMode,
        welcome_config: instanceData.content_config?.welcome_config,
      };

      // Generate institution_id if not provided
      if (!instanceData.institution_id) {
        const { data: generatedId, error: idError } = await supabase.rpc('generate_institution_id');
        if (idError) throw idError;
        instanceData.institution_id = generatedId;
      }

      // Set created_by if not provided
      if (!instanceData.created_by) {
        const { data: { session } } = await supabase.auth.getSession();
        instanceData.created_by = session?.user?.id || '00000000-0000-0000-0000-000000000000';
      }

      const { data, error } = await supabase
        .from('simulation_instances')
        .insert([instanceData])
        .select()
        .single();

      if (error) throw error;

      let createdInstance = data as SimulationInstance;

      if (requestedSetupMode === 'template') {
        try {
          const copiedSceneOrder = await cloneGlobalSceneTemplateToInstance(createdInstance.id);
          const updatedContentConfig = {
            ...(createdInstance.content_config || {}),
            scene_order: copiedSceneOrder,
            scene_setup_mode: 'template' as const,
          };

          const { data: updatedInstance, error: updateInstanceError } = await supabase
            .from('simulation_instances')
            .update({ content_config: updatedContentConfig })
            .eq('id', createdInstance.id)
            .select()
            .single();

          if (updateInstanceError) throw updateInstanceError;
          createdInstance = updatedInstance as SimulationInstance;
        } catch (templateProvisioningError) {
          try {
            await rollbackIncompleteTemplateInstance(createdInstance.id);
          } catch (rollbackError) {
            console.error('Failed to rollback incomplete template instance:', rollbackError);
          }
          throw templateProvisioningError;
        }
      }

      // Create a default welcome configuration for the new instance
      try {
        const defaultWelcomeConfig = {
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
          is_active: true
        };

        await supabase
          .from('welcome_configurations')
          .insert([defaultWelcomeConfig]);
      } catch (welcomeError) {
        console.warn('Failed to create default welcome configuration:', welcomeError);
        // Don't fail the instance creation if welcome config fails
      }

      setInstances(prev => [createdInstance, ...prev]);
      return createdInstance;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create instance');
      throw err;
    }
  };

  const updateInstance = async (id: string, updates: Partial<SimulationInstance>) => {
    try {
      const { data, error } = await supabase
        .from('simulation_instances')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setInstances(prev => prev.map(instance =>
        instance.id === id ? data : instance
      ));
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update instance');
      throw err;
    }
  };

  const deleteInstance = async (id: string) => {
    try {
      const { error } = await supabase
        .from('simulation_instances')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setInstances(prev => prev.filter(instance => instance.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete instance');
      throw err;
    }
  };

  const getInstanceByInstitutionId = async (institutionId: string) => {
    try {
      const { data, error } = await supabase
        .from('simulation_instances')
        .select('*')
        .eq('institution_id', institutionId)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch instance');
      return null;
    }
  };

  useEffect(() => {
    fetchInstances();
  }, []);

  return {
    instances,
    loading,
    error,
    fetchInstances,
    createInstance,
    updateInstance,
    deleteInstance,
    getInstanceByInstitutionId
  };
}

export function useAccessTokens(instanceId?: string) {
  const [tokens, setTokens] = useState<AccessToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTokens = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('instance_access_tokens')
        .select('*')
        .order('created_at', { ascending: false });

      if (instanceId) {
        query = query.eq('instance_id', instanceId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setTokens(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tokens');
    } finally {
      setLoading(false);
    }
  };

  const createToken = async (tokenData: Partial<AccessToken>) => {
    try {
      const { data, error } = await supabase
        .from('instance_access_tokens')
        .insert([tokenData])
        .select()
        .single();

      if (error) throw error;

      setTokens(prev => [data, ...prev]);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create token');
      throw err;
    }
  };

  const updateToken = async (id: string, updates: Partial<AccessToken>) => {
    try {
      const { data, error } = await supabase
        .from('instance_access_tokens')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setTokens(prev => prev.map(token =>
        token.id === id ? data : token
      ));
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update token');
      throw err;
    }
  };

  const deleteToken = async (id: string) => {
    try {
      const { error } = await supabase
        .from('instance_access_tokens')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTokens(prev => prev.filter(token => token.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete token');
      throw err;
    }
  };

  const generateToken = async (instanceId: string, name: string, description?: string) => {
    try {
      const { data, error } = await supabase.rpc('generate_access_token');
      if (error) throw error;

      const tokenData = {
        instance_id: instanceId,
        token: data,
        name,
        description,
        is_active: true
      };

      return await createToken(tokenData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate token');
      throw err;
    }
  };

  useEffect(() => {
    fetchTokens();
  }, [instanceId]);

  return {
    tokens,
    loading,
    error,
    fetchTokens,
    createToken,
    updateToken,
    deleteToken,
    generateToken
  };
}

export function useInstanceSessionData(instanceId?: string) {
  const [sessionData, setSessionData] = useState<InstanceSessionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSessionData = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('instance_session_data')
        .select('*')
        .order('created_at', { ascending: false });

      if (instanceId) {
        query = query.eq('instance_id', instanceId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setSessionData(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch session data');
    } finally {
      setLoading(false);
    }
  };

  const saveSessionData = async (data: Partial<InstanceSessionData>) => {
    try {
      const { data: result, error } = await supabase
        .from('instance_session_data')
        .insert([data])
        .select()
        .single();

      if (error) throw error;

      setSessionData(prev => [result, ...prev]);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save session data');
      throw err;
    }
  };

  const updateWebhookStatus = async (id: string, status: {
    webhook_sent: boolean;
    webhook_attempts: number;
    webhook_last_attempt?: string;
    webhook_error?: string;
  }) => {
    try {
      const { data, error } = await supabase
        .from('instance_session_data')
        .update(status)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setSessionData(prev => prev.map(session =>
        session.id === id ? data : session
      ));
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update webhook status');
      throw err;
    }
  };

  useEffect(() => {
    fetchSessionData();
  }, [instanceId]);

  return {
    sessionData,
    loading,
    error,
    fetchSessionData,
    saveSessionData,
    updateWebhookStatus
  };
}
