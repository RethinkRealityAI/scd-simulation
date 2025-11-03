import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface AnalyticsEntry {
  id: string;
  session_id: string;
  user_demographics: {
    age: string;
    educationLevel: string;
    organization?: string;
    school?: string;
    year?: string;
    program?: string;
    field?: string;
    howHeard?: string;
  };
  responses: Array<{
    questionId: string;
    sceneId: string;
    questionText?: string;
    questionType?: 'multiple-choice' | 'text-input' | 'multi-select';
    answer: string;
    correctAnswer?: string | string[];
    explanation?: string;
    isCorrect: boolean;
    timeSpent: number;
    timestamp: string;
    options?: string[];
  }>;
  category_scores: {
    timelyPainManagement: number;
    clinicalJudgment: number;
    communication: number;
    culturalSafety: number;
    biasMitigation: number;
  };
  final_score: number;
  completion_time: number;
  completed_scenes: number[];
  submission_timestamp: string;
  start_time?: string;
  end_time?: string;
  device_info?: {
    userAgent: string;
    screenResolution: string;
    platform: string;
  };
  performance_metrics?: {
    averageTimePerQuestion: number;
    longestQuestionTime: number;
    shortestQuestionTime: number;
    questionsPerScene: number;
  };
}

export interface AnalyticsSummary {
  totalUsers: number;
  averageScore: number;
  averageCompletionTime: number;
  averageCompletedScenes: number;
  categoryAverages: {
    timelyPainManagement: number;
    clinicalJudgment: number;
    communication: number;
    culturalSafety: number;
    biasMitigation: number;
  };
}

export function useAnalytics() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsEntry[]>([]);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async (limit: number = 100) => {
    setLoading(true);
    setError(null);
    
    console.log('Fetching analytics from session_data table...');
    
    try {
      const { data, error: fetchError } = await supabase
        .from('session_data')
        .select('*')
        .order('submission_timestamp', { ascending: false })
        .limit(limit);

      if (fetchError) {
        console.error('Error fetching from session_data:', fetchError);
        throw fetchError;
      }

      console.log('Fetched data from session_data:', data);

      const formattedData: AnalyticsEntry[] = data?.map(entry => ({
        id: entry.id,
        session_id: entry.session_id,
        user_demographics: entry.user_demographics,
        responses: entry.responses,
        category_scores: entry.category_scores,
        final_score: entry.final_score,
        completion_time: entry.completion_time,
        completed_scenes: entry.completed_scenes,
        submission_timestamp: entry.submission_timestamp
      })) || [];

      setAnalyticsData(formattedData);
      
      // Calculate summary statistics
      if (formattedData.length > 0) {
        const totalUsers = formattedData.length;
        const averageScore = Math.round(
          formattedData.reduce((acc, entry) => acc + entry.final_score, 0) / totalUsers
        );
        const averageCompletionTime = Math.round(
          formattedData.reduce((acc, entry) => acc + entry.completion_time, 0) / totalUsers
        );
        const averageCompletedScenes = Math.round(
          formattedData.reduce((acc, entry) => acc + entry.completed_scenes.length, 0) / totalUsers
        );

        const categoryAverages = {
          timelyPainManagement: Math.round(
            formattedData.reduce((acc, entry) => acc + (entry.category_scores.timelyPainManagement || 0), 0) / totalUsers
          ),
          clinicalJudgment: Math.round(
            formattedData.reduce((acc, entry) => acc + (entry.category_scores.clinicalJudgment || 0), 0) / totalUsers
          ),
          communication: Math.round(
            formattedData.reduce((acc, entry) => acc + (entry.category_scores.communication || 0), 0) / totalUsers
          ),
          culturalSafety: Math.round(
            formattedData.reduce((acc, entry) => acc + (entry.category_scores.culturalSafety || 0), 0) / totalUsers
          ),
          biasMitigation: Math.round(
            formattedData.reduce((acc, entry) => acc + (entry.category_scores.biasMitigation || 0), 0) / totalUsers
          )
        };

        setSummary({
          totalUsers,
          averageScore,
          averageCompletionTime,
          averageCompletedScenes,
          categoryAverages
        });
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  const insertAnalyticsEntry = async (data: Omit<AnalyticsEntry, 'id' | 'submission_timestamp'>) => {
    try {
      const { error: insertError } = await supabase
        .from('session_data')
        .insert({
          session_id: data.session_id,
          user_demographics: data.user_demographics,
          responses: data.responses,
          category_scores: data.category_scores,
          final_score: data.final_score,
          completion_time: data.completion_time,
          completed_scenes: data.completed_scenes
        });

      if (insertError) {
        throw insertError;
      }

      // Refresh analytics data after successful insert
      await fetchAnalytics();
      return true;
    } catch (err) {
      console.error('Error inserting analytics entry:', err);
      setError(err instanceof Error ? err.message : 'Failed to insert analytics entry');
      return false;
    }
  };

  const getAnalyticsByDateRange = async (startDate: Date, endDate: Date) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await supabase
        .from('session_data')
        .select('*')
        .gte('submission_timestamp', startDate.toISOString())
        .lte('submission_timestamp', endDate.toISOString())
        .order('submission_timestamp', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      return data;
    } catch (err) {
      console.error('Error fetching analytics by date range:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics by date range');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getPerformanceByEducationLevel = () => {
    if (!analyticsData.length) return {};

    const educationGroups = analyticsData.reduce((acc, entry) => {
      const level = entry.user_demographics.educationLevel;
      if (!acc[level]) {
        acc[level] = [];
      }
      acc[level].push(entry);
      return acc;
    }, {} as Record<string, AnalyticsEntry[]>);

    const result: Record<string, { averageScore: number; count: number }> = {};
    
    Object.entries(educationGroups).forEach(([level, entries]) => {
      result[level] = {
        averageScore: Math.round(
          entries.reduce((acc, entry) => acc + entry.final_score, 0) / entries.length
        ),
        count: entries.length
      };
    });

    return result;
  };

  const getPerformanceByAgeGroup = () => {
    if (!analyticsData.length) return {};

    const ageGroups = analyticsData.reduce((acc, entry) => {
      const age = entry.user_demographics.age;
      if (!acc[age]) {
        acc[age] = [];
      }
      acc[age].push(entry);
      return acc;
    }, {} as Record<string, AnalyticsEntry[]>);

    const result: Record<string, { averageScore: number; count: number }> = {};
    
    Object.entries(ageGroups).forEach(([age, entries]) => {
      result[age] = {
        averageScore: Math.round(
          entries.reduce((acc, entry) => acc + entry.final_score, 0) / entries.length
        ),
        count: entries.length
      };
    });

    return result;
  };

  // Auto-fetch analytics on hook initialization
  useEffect(() => {
    fetchAnalytics();
  }, []);

  return {
    analyticsData,
    summary,
    loading,
    error,
    fetchAnalytics,
    insertAnalyticsEntry,
    getAnalyticsByDateRange,
    getPerformanceByEducationLevel,
    getPerformanceByAgeGroup,
    refetch: fetchAnalytics
  };
}
