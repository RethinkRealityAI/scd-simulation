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
  completion_duration_seconds: number;
  completed_scenes: number[];
  start_time: string;
  completed_at: string;
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

  const createInstance = async (instanceData: Partial<SimulationInstance>) => {
    try {
      // Generate institution_id if not provided
      if (!instanceData.institution_id) {
        try {
          const { data: generatedId, error: idError } = await supabase.rpc('generate_institution_id');
          if (idError) throw idError;
          instanceData.institution_id = generatedId;
        } catch (rpcError) {
          console.warn('RPC generate_institution_id failed, falling back to client-side generation', rpcError);
          // Fallback: Generate a random 8-char string
          instanceData.institution_id = Math.random().toString(36).substring(2, 10).toUpperCase();
        }
      }

      // Set created_by to null if not provided (for anonymous admin access)
      if (!instanceData.created_by) {
        delete instanceData.created_by;
      }

      // ... existing code ...
      const { data, error } = await supabase
        .from('simulation_instances')
        .insert([instanceData])
        .select()
        .single();

      if (error) throw error;

      console.log('Instance created in DB:', data);

      // Clone global scenes for the new instance
      if (data) {
        const { error: cloneError } = await supabase.rpc('clone_instance_scenes', {
          target_instance_id: data.id
        });

        if (cloneError) {
          console.error('Failed to clone scenes for new instance:', cloneError);
        }
      }

      // Create a default welcome configuration for the new instance
      try {
        // ... (welcome config code) ...
      } catch (welcomeError) {
        console.warn('Failed to create default welcome configuration:', welcomeError);
      }

      setInstances(prev => {
        console.log('Updating instances state. Previous count:', prev.length, 'New instance:', data.name);
        return [data, ...prev];
      });
      return data;
    } catch (err) {
      console.error('Error in createInstance:', err);
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
