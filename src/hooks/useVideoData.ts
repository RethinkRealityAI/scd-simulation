import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface VideoData {
  id: string;
  scene_id: number;
  title: string;
  description: string;
  video_url: string;
  poster_url?: string;
  audio_narration_url?: string;
  created_at: string;
  updated_at: string;
}

export const useVideoData = (instanceId?: string) => {
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchVideos(instanceId);
  }, [instanceId]);

  const fetchVideos = async (instanceId?: string) => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('simulation_videos')
        .select('*')
        .order('scene_id');

      if (instanceId) {
        query = query.eq('instance_id', instanceId);
      } else {
        query = query.is('instance_id', null);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      setVideos(data || []);
    } catch (err) {
      console.error('Error fetching videos:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch videos');
    } finally {
      setLoading(false);
    }
  };

  const uploadVideo = async (file: File, sceneId: number, title: string, description: string, instanceId?: string) => {
    try {
      setError(null);

      // Validate file size (100MB limit)
      if (file.size > 52428800) { // 50MB
        const errorMsg = `File size is ${(file.size / 1048576).toFixed(2)}MB. Maximum size is 50MB. Please compress your video.`;
        console.error(errorMsg);
        throw new Error(errorMsg);
      }

      // Validate file type
      if (!file.type.startsWith('video/')) {
        const errorMsg = `Invalid file type: ${file.type}. Please select a valid video file (MP4, MOV, WebM, etc.)`;
        console.error(errorMsg);
        throw new Error(errorMsg);
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `scene-${sceneId}-${Date.now()}.${fileExt}`;

      // Upload video file to storage
      const { error: uploadError } = await supabase.storage
        .from('simulation-videos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true // Allow overwriting files
        });

      if (uploadError) {
        throw new Error(`Storage upload failed: ${uploadError.message}.`);
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('simulation-videos')
        .getPublicUrl(fileName);

      // Try to insert new record first
      const { data: insertData, error: insertError } = await supabase
        .from('simulation_videos')
        .insert({
          instance_id: instanceId || null,
          scene_id: sceneId,
          title,
          description,
          video_url: publicUrl,
        })
        .select()
        .single();

      if (insertError) {
        if (insertError.code === '23505') {
          let updateQuery = supabase
            .from('simulation_videos')
            .update({
              title,
              description,
              video_url: publicUrl,
              updated_at: new Date().toISOString()
            })
            .eq('scene_id', sceneId);

          if (instanceId) {
            updateQuery = updateQuery.eq('instance_id', instanceId);
          } else {
            updateQuery = updateQuery.is('instance_id', null);
          }

          const { data: updateData, error: updateError } = await updateQuery.select().single();

          if (updateError) {
            await supabase.storage.from('simulation-videos').remove([fileName]);
            throw new Error(`Database update failed: ${updateError.message}. Video was uploaded but not saved to database.`);
          }

          await fetchVideos(instanceId);
          return updateData;
        } else {
          await supabase.storage.from('simulation-videos').remove([fileName]);
          throw new Error(`Database error: ${insertError.message}. Video was uploaded but not saved to database.`);
        }
      }

      await fetchVideos(instanceId);
      return insertData;
    } catch (err) {
      console.error('Upload process error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload video. Unknown error occurred.';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const saveStreamVideo = async (sceneId: number, streamUrl: string, title: string, description: string, instanceId?: string) => {
    try {
      setError(null);

      // Try to insert new record first
      const { data: insertData, error: insertError } = await supabase
        .from('simulation_videos')
        .insert({
          instance_id: instanceId || null,
          scene_id: sceneId,
          title,
          description,
          video_url: streamUrl,
        })
        .select()
        .single();

      if (insertError) {
        // If insert fails due to unique constraint, try update
        if (insertError.code === '23505') {
          let updateQuery = supabase
            .from('simulation_videos')
            .update({
              title,
              description,
              video_url: streamUrl,
              updated_at: new Date().toISOString()
            })
            .eq('scene_id', sceneId);

          if (instanceId) {
            updateQuery = updateQuery.eq('instance_id', instanceId);
          } else {
            updateQuery = updateQuery.is('instance_id', null);
          }

          const { data: updateData, error: updateError } = await updateQuery.select().single();

          if (updateError) {
            throw new Error(`Database update failed: ${updateError.message}`);
          }

          await fetchVideos(instanceId);
          return updateData;
        } else {
          throw new Error(`Database insert failed: ${insertError.message}`);
        }
      }

      await fetchVideos(instanceId);
      return insertData;
    } catch (err) {
      console.error('Error saving stream video:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to save stream video';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const deleteVideo = async (sceneId: number, instanceId?: string) => {
    try {
      setError(null);

      // Get the video record first
      let fetchQuery = supabase
        .from('simulation_videos')
        .select('*')
        .eq('scene_id', sceneId);

      if (instanceId) {
        fetchQuery = fetchQuery.eq('instance_id', instanceId);
      } else {
        fetchQuery = fetchQuery.is('instance_id', null);
      }

      const { data: video, error: fetchError } = await fetchQuery.single();

      if (fetchError) {
        throw new Error(`Failed to find video: ${fetchError.message}`);
      }

      if (video?.video_url) {
        // Extract filename from URL
        const urlParts = video.video_url.split('/');
        const fileName = urlParts[urlParts.length - 1];

        if (fileName && fileName.includes('scene-')) {
          await supabase.storage.from('simulation-videos').remove([fileName]);
        }
      }

      // Delete from database
      let deleteQuery = supabase
        .from('simulation_videos')
        .delete()
        .eq('scene_id', sceneId);

      if (instanceId) {
        deleteQuery = deleteQuery.eq('instance_id', instanceId);
      } else {
        deleteQuery = deleteQuery.is('instance_id', null);
      }

      const { error: deleteError } = await deleteQuery;

      if (deleteError) {
        throw new Error(`Failed to delete video record: ${deleteError.message}`);
      }

      // Refresh videos list
      await fetchVideos(instanceId);
    } catch (err) {
      console.error('Delete video error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete video';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updateVideo = async (
    videoId: string,
    title: string,
    description: string,
    posterFile?: File,
    videoFile?: File,
    instanceId?: string
  ) => {
    try {
      setError(null);

      let posterUrl = '';
      let videoUrl = '';

      // Upload new poster if provided
      if (posterFile) {
        const fileExt = posterFile.name.split('.').pop();
        const fileName = `poster-${videoId}-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('simulation-videos')
          .upload(fileName, posterFile, {
            cacheControl: '3600',
            upsert: true
          });

        if (uploadError) {
          throw new Error(`Poster upload failed: ${uploadError.message}`);
        }

        const { data: { publicUrl } } = supabase.storage
          .from('simulation-videos')
          .getPublicUrl(fileName);

        posterUrl = publicUrl;
      }

      // Upload new video if provided
      if (videoFile) {
        // Validate file size (50MB limit)
        if (videoFile.size > 52428800) {
          throw new Error('Video file size must be less than 50MB');
        }

        // Validate file type
        if (!videoFile.type.startsWith('video/')) {
          throw new Error('Please select a valid video file');
        }

        const fileExt = videoFile.name.split('.').pop();
        const fileName = `video-${videoId}-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('simulation-videos')
          .upload(fileName, videoFile, {
            cacheControl: '3600',
            upsert: true
          });

        if (uploadError) {
          throw new Error(`Video upload failed: ${uploadError.message}`);
        }

        const { data: { publicUrl } } = supabase.storage
          .from('simulation-videos')
          .getPublicUrl(fileName);

        videoUrl = publicUrl;
      }

      // Update database record
      const updateData: any = {
        title,
        description,
        updated_at: new Date().toISOString()
      };

      if (posterUrl) {
        updateData.poster_url = posterUrl;
      }

      if (videoUrl) {
        updateData.video_url = videoUrl;
      }

      const { data, error: updateError } = await supabase
        .from('simulation_videos')
        .update(updateData)
        .eq('id', videoId)
        .select()
        .single();

      if (updateError) {
        throw new Error(`Database update error: ${updateError.message}`);
      }

      await fetchVideos(instanceId);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update video';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  return {
    videos,
    loading,
    error,
    uploadVideo,
    saveStreamVideo,
    updateVideo,
    deleteVideo,
    refetch: fetchVideos,
  };
};