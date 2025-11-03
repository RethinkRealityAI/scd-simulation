import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface Character {
  id: string;
  scene_id: number;
  character_name: string;
  character_role?: string;
  avatar_url?: string;
  display_order: number;
}

export interface AudioFile {
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
  character?: Character;
}

export const useAudioData = () => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch characters
      const { data: charactersData, error: charactersError } = await supabase
        .from('scene_characters')
        .select('*')
        .order('scene_id', { ascending: true })
        .order('display_order', { ascending: true });

      if (charactersError) throw charactersError;

      // Fetch audio files with character information
      const { data: audioData, error: audioError } = await supabase
        .from('scene_audio_files')
        .select(`
          *,
          character:scene_characters(*)
        `)
        .order('scene_id', { ascending: true })
        .order('display_order', { ascending: true });

      if (audioError) throw audioError;
      
      setCharacters(charactersData || []);
      setAudioFiles(audioData || []);
    } catch (err) {
      console.error('Error fetching audio data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch audio data');
    } finally {
      setLoading(false);
    }
  };

  const uploadAvatar = async (file: File, characterName: string): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${characterName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('character-avatars')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('character-avatars')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const uploadAudio = async (file: File, title: string): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${title.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('scene-audio-files')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('scene-audio-files')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const createCharacter = async (
    sceneId: number,
    characterName: string,
    characterRole: string,
    avatarFile?: File
  ): Promise<Character> => {
    let avatarUrl = '';
    
    if (avatarFile) {
      avatarUrl = await uploadAvatar(avatarFile, characterName);
    }

    const { data, error } = await supabase
      .from('scene_characters')
      .insert({
        scene_id: sceneId,
        character_name: characterName,
        character_role: characterRole,
        avatar_url: avatarUrl,
        display_order: 0
      })
      .select()
      .single();

    if (error) throw error;
    
    await fetchData();
    return data;
  };

  const createAudioFile = async (
    sceneId: number,
    characterId: string,
    title: string,
    subtitles: string,
    audioFile: File,
    autoPlay: boolean = false,
    hidePlayer: boolean = false,
    displayOrder: number = 0
  ): Promise<AudioFile> => {
    const audioUrl = await uploadAudio(audioFile, title);

    const { data, error } = await supabase
      .from('scene_audio_files')
      .insert({
        scene_id: sceneId,
        character_id: characterId,
        audio_title: title,
        audio_description: subtitles,
        audio_url: audioUrl,
        display_order: displayOrder,
        auto_play: autoPlay,
        hide_player: hidePlayer
      })
      .select()
      .single();

    if (error) throw error;
    
    await fetchData();
    return data;
  };

  const updateAudioFile = async (
    audioId: string,
    title: string,
    subtitles: string,
    audioFile?: File,
    autoPlay: boolean = false,
    hidePlayer: boolean = false,
    displayOrder: number = 0
  ): Promise<AudioFile> => {
    let audioUrl = '';
    
    if (audioFile) {
      audioUrl = await uploadAudio(audioFile, title);
    }

    const updateData: any = {
      audio_title: title,
      audio_description: subtitles,
      display_order: displayOrder,
      auto_play: autoPlay,
      hide_player: hidePlayer,
      updated_at: new Date().toISOString()
    };

    if (audioUrl) {
      updateData.audio_url = audioUrl;
    }

    const { data, error } = await supabase
      .from('scene_audio_files')
      .update(updateData)
      .eq('id', audioId)
      .select()
      .single();

    if (error) throw error;
    
    await fetchData();
    return data;
  };

  const deleteCharacter = async (characterId: string) => {
    // First delete associated audio files
    const { error: audioError } = await supabase
      .from('scene_audio_files')
      .delete()
      .eq('character_id', characterId);

    if (audioError) throw audioError;

    // Then delete the character
    const { error } = await supabase
      .from('scene_characters')
      .delete()
      .eq('id', characterId);

    if (error) throw error;
    
    await fetchData();
  };

  const deleteAudioFile = async (audioId: string) => {
    const { error } = await supabase
      .from('scene_audio_files')
      .delete()
      .eq('id', audioId);

    if (error) throw error;
    
    await fetchData();
  };

  const getCharactersByScene = (sceneId: number): Character[] => {
    return characters.filter(char => char.scene_id === sceneId);
  };

  const getAudioFilesByScene = (sceneId: number): AudioFile[] => {
    return audioFiles.filter(audio => audio.scene_id === sceneId);
  };

  const getAllCharacters = (): Character[] => {
    return characters.sort((a, b) => {
      if (a.scene_id !== b.scene_id) {
        return a.scene_id - b.scene_id;
      }
      return a.display_order - b.display_order;
    });
  };

  const updateCharacter = async (
    characterId: string,
    characterName: string,
    characterRole: string,
    avatarFile?: File
  ): Promise<Character> => {
    let avatarUrl = '';
    
    if (avatarFile) {
      avatarUrl = await uploadAvatar(avatarFile, characterName);
    }

    const updateData: any = {
      character_name: characterName,
      character_role: characterRole,
      updated_at: new Date().toISOString()
    };

    if (avatarUrl) {
      updateData.avatar_url = avatarUrl;
    }

    const { data, error } = await supabase
      .from('scene_characters')
      .update(updateData)
      .eq('id', characterId)
      .select()
      .single();

    if (error) throw error;
    
    await fetchData();
    return data;
  };

  return {
    characters,
    audioFiles,
    loading,
    error,
    createCharacter,
    updateCharacter,
    createAudioFile,
    updateAudioFile,
    deleteCharacter,
    deleteAudioFile,
    getCharactersByScene,
    getAudioFilesByScene,
    getAllCharacters,
    refetch: fetchData,
  };
};