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

export const useVideoData = () => {
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching videos from database...');
      // Fetch videos from database
      const { data, error } = await supabase
        .from('simulation_videos')
        .select('*')
        .order('scene_id');

      if (error) {
        throw error;
      }
      
      console.log('Videos fetched from database:', data?.length || 0, 'videos');
      console.log('Video details:', data?.map(v => ({ scene_id: v.scene_id, title: v.title, has_url: !!v.video_url })));
      
      setVideos(data || []);
    } catch (err) {
      console.error('Error fetching videos:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch videos');
    } finally {
      setLoading(false);
    }
  };

  const uploadVideo = async (file: File, sceneId: number, title: string, description: string) => {
    try {
      setError(null);
      
      // Validate file size (100MB limit)
      if (file.size > 52428800) { // 50MB
        throw new Error('File size must be less than 50MB');
      }
      
      // Validate file type
      if (!file.type.startsWith('video/')) {
        throw new Error('Please select a valid video file');
      }
      
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `scene-${sceneId}-${Date.now()}.${fileExt}`;
      
      console.log('Starting upload process:', { fileName, fileSize: file.size, sceneId });
      
      // Upload video file to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('simulation-videos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true // Allow overwriting files
        });

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      console.log('File uploaded successfully:', uploadData);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('simulation-videos')
        .getPublicUrl(fileName);

      console.log('Public URL generated:', publicUrl);

      // Try to insert new record first
      const { data: insertData, error: insertError } = await supabase
        .from('simulation_videos')
        .insert({
          scene_id: sceneId,
          title,
          description,
          video_url: publicUrl,
        })
        .select()
        .single();

      if (insertError) {
        console.log('Insert failed, trying update:', insertError);
        
        // If insert fails due to unique constraint, try update
        if (insertError.code === '23505') {
          const { data: updateData, error: updateError } = await supabase
            .from('simulation_videos')
            .update({
              title,
              description,
              video_url: publicUrl,
              updated_at: new Date().toISOString()
            })
            .eq('scene_id', sceneId)
            .select()
            .single();

          if (updateError) {
            console.error('Update failed:', updateError);
            // Clean up uploaded file
            await supabase.storage
              .from('simulation-videos')
              .remove([fileName]);
            throw new Error(`Database update error: ${updateError.message}`);
          }

          console.log('Record updated successfully:', updateData);
          await fetchVideos();
          return updateData;
        } else {
          console.error('Insert error (not conflict):', insertError);
          // Clean up uploaded file
          await supabase.storage
            .from('simulation-videos')
            .remove([fileName]);
          throw new Error(`Database insert error: ${insertError.message}`);
        }
      }

      console.log('Record inserted successfully:', insertData);
      await fetchVideos();
      return insertData;
    } catch (err) {
      console.error('Upload process error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload video';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const deleteVideo = async (sceneId: number) => {
    try {
      setError(null);
      
      console.log('Starting delete process for scene:', sceneId);
      
      // Get the video record first
      const { data: video, error: fetchError } = await supabase
        .from('simulation_videos')
        .select('*')
        .eq('scene_id', sceneId)
        .single();

      if (fetchError) {
        console.error('Fetch error:', fetchError);
        throw new Error(`Failed to find video: ${fetchError.message}`);
      }

      console.log('Found video record:', video);

      if (video?.video_url) {
        // Extract filename from URL
        const urlParts = video.video_url.split('/');
        const fileName = urlParts[urlParts.length - 1];
        
        console.log('Attempting to delete file:', fileName);
        
        if (fileName && fileName.includes('scene-')) {
          // Delete from storage
          const { error: storageError } = await supabase.storage
            .from('simulation-videos')
            .remove([fileName]);
            
          if (storageError) {
            console.warn('Storage deletion warning:', storageError);
          } else {
            console.log('File deleted from storage successfully');
          }
        }
      }

      // Delete from database
      const { error: deleteError } = await supabase
        .from('simulation_videos')
        .delete()
        .eq('scene_id', sceneId);

      if (deleteError) {
        console.error('Database delete error:', deleteError);
        throw new Error(`Failed to delete video record: ${deleteError.message}`);
      }

      console.log('Database record deleted successfully');
      
      // Refresh videos list
      await fetchVideos();
    } catch (err) {
      console.error('Delete process error:', err);
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
    videoFile?: File
  ) => {
    try {
      setError(null);
      
      let posterUrl = '';
      let videoUrl = '';
      
      // Upload new poster if provided
      if (posterFile) {
        const fileExt = posterFile.name.split('.').pop();
        const fileName = `poster-${videoId}-${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
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
        
        const { data: uploadData, error: uploadError } = await supabase.storage
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

      await fetchVideos();
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
    updateVideo,
    deleteVideo,
    refetch: fetchVideos,
  };
};