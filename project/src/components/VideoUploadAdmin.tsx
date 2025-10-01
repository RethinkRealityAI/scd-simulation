import React, { useState, useEffect } from 'react';
import { useVideoData } from '../hooks/useVideoData';
import { useAudioData } from '../hooks/useAudioData';
import { useAnalytics } from '../hooks/useAnalytics';
import { scenes, SceneData } from '../data/scenesData';
import { 
  Upload, 
  Video, 
  CheckCircle, 
  AlertCircle, 
  Trash2, 
  Music, 
  User, 
  Plus, 
  X, 
  Edit,
  Save,
  Camera,
  FileText,
  PlayCircle,
  Settings,
  Calendar,
  BarChart3,
  Database,
  Eye,
  Download,
  Upload as UploadIcon,
  Activity,
  TrendingUp,
  Users as UsersIcon,
  Clock,
  Target,
  Brain,
  MessageSquare,
  Shield,
  Scale,
  Heart,
  ArrowRight,
  Play
} from 'lucide-react';

const VideoUploadAdmin: React.FC = () => {
  const { videos, loading, uploadVideo, updateVideo, deleteVideo, refetch } = useVideoData();
  const [uploading, setUploading] = useState(false);
  const [selectedScene, setSelectedScene] = useState<number>(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Video editing state
  const [editingVideo, setEditingVideo] = useState<string | null>(null);
  const [editVideoTitle, setEditVideoTitle] = useState('');
  const [editVideoDescription, setEditVideoDescription] = useState('');
  const [editVideoFile, setEditVideoFile] = useState<File | null>(null);
  const [editPosterFile, setEditPosterFile] = useState<File | null>(null);
  
  // Audio management state
  const { 
    characters, 
    audioFiles, 
    createCharacter, 
    updateCharacter,
    createAudioFile, 
    updateAudioFile,
    deleteCharacter, 
    deleteAudioFile, 
    getCharactersByScene, 
    getAudioFilesByScene,
    getAllCharacters,
    loading: audioLoading,
    error: audioError
  } = useAudioData();
  
  const [activeTab, setActiveTab] = useState<'videos' | 'audio' | 'characters' | 'scenes' | 'analytics' | 'settings' | 'welcome'>('videos');
  const [selectedAudioScene, setSelectedAudioScene] = useState<number>(1);
  const [showCharacterForm, setShowCharacterForm] = useState(false);
  const [showAudioForm, setShowAudioForm] = useState(false);
  const [editingAudio, setEditingAudio] = useState<string | null>(null);
  const [editingCharacter, setEditingCharacter] = useState<string | null>(null);
  
  // Scene management state
  const [selectedSceneForEdit, setSelectedSceneForEdit] = useState<number | null>(null);
  const [sceneEditData, setSceneEditData] = useState<Partial<SceneData>>({});
  const [showSceneEditor, setShowSceneEditor] = useState(false);
  const [sceneEditorTab, setSceneEditorTab] = useState<'edit' | 'preview'>('edit');
  
  // Analytics hook
  const { analyticsData, summary, loading: analyticsLoading, error: analyticsError, refetch: refetchAnalytics } = useAnalytics();
  
  // Settings state
  const [webhookUrl, setWebhookUrl] = useState('https://hook.us2.make.com/255f21cb3adzdqw4kobc89b981g1jmie');
  const [settingsChanged, setSettingsChanged] = useState(false);
  const [characterName, setCharacterName] = useState('');
  const [characterRole, setCharacterRole] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [audioTitle, setAudioTitle] = useState('');
  const [audioSubtitles, setAudioSubtitles] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [selectedCharacterId, setSelectedCharacterId] = useState<string>('');
  const [enableAutoPlay, setEnableAutoPlay] = useState(false);
  const [displayOrder, setDisplayOrder] = useState(1);

  const clearMessage = () => {
    setTimeout(() => setMessage(null), 5000);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title || !description) {
      setMessage({ type: 'error', text: 'Please fill in all fields and select a video file' });
      clearMessage();
      return;
    }

    setUploading(true);
    setMessage(null);

    try {
      await uploadVideo(file, selectedScene, title, description);
      setMessage({ type: 'success', text: 'Video uploaded successfully!' });
      clearMessage();
      
      // Reset form
      setFile(null);
      setTitle('');
      setDescription('');
      
      // Reset file input
      const fileInput = document.getElementById('video-upload') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
      
      // Move to next available scene
      const nextScene = sceneOptions.find(option => !option.hasVideo && option.value > selectedScene);
      if (nextScene) {
        setSelectedScene(nextScene.value);
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Upload failed' 
      });
      clearMessage();
    } finally {
      setUploading(false);
    }
  };

  const handleVideoEdit = (video: any) => {
    setEditingVideo(video.id);
    setEditVideoTitle(video.title);
    setEditVideoDescription(video.description);
    setEditVideoFile(null);
    setEditPosterFile(null);
  };

  const handleVideoUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVideo || !editVideoTitle || !editVideoDescription) {
      setMessage({ type: 'error', text: 'Please fill in all required fields' });
      clearMessage();
      return;
    }

    setUploading(true);
    setMessage(null);

    try {
      await updateVideo(editingVideo, editVideoTitle, editVideoDescription, editPosterFile || undefined, editVideoFile || undefined);
      setMessage({ type: 'success', text: 'Video updated successfully!' });
      clearMessage();
      
      // Reset form
      setEditingVideo(null);
      setEditVideoTitle('');
      setEditVideoDescription('');
      setEditVideoFile(null);
      setEditPosterFile(null);
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Update failed' 
      });
      clearMessage();
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (sceneId: number) => {
    if (!confirm(`Are you sure you want to delete the video for Scene ${sceneId}?`)) {
      return;
    }

    try {
      await deleteVideo(sceneId);
      setMessage({ type: 'success', text: 'Video deleted successfully!' });
      clearMessage();
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Delete failed' 
      });
      clearMessage();
    }
  };

  const handleCreateCharacter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!characterName || !characterRole) {
      setMessage({ type: 'error', text: 'Please fill in character name and role' });
      clearMessage();
      return;
    }

    try {
      if (editingCharacter) {
        await updateCharacter(editingCharacter, characterName, characterRole, avatarFile || undefined);
        setMessage({ type: 'success', text: 'Character updated successfully!' });
      } else {
        await createCharacter(selectedAudioScene, characterName, characterRole, avatarFile || undefined);
        setMessage({ type: 'success', text: 'Character created successfully!' });
      }
      clearMessage();
      
      // Reset form
      setCharacterName('');
      setCharacterRole('');
      setAvatarFile(null);
      setEditingCharacter(null);
      setShowCharacterForm(false);
      
      // Reset file input
      const fileInput = document.getElementById('avatar-upload') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to save character' 
      });
      clearMessage();
    }
  };

  const handleEditCharacter = (character: any) => {
    setCharacterName(character.character_name);
    setCharacterRole(character.character_role || '');
    setEditingCharacter(character.id);
    setShowCharacterForm(true);
  };

  const handleCreateAudioFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!audioTitle || !audioSubtitles || !selectedCharacterId || displayOrder < 1) {
      setMessage({ type: 'error', text: 'Please fill in all fields' });
      clearMessage();
      return;
    }

    if (!editingAudio && !audioFile) {
      setMessage({ type: 'error', text: 'Please select an audio file' });
      clearMessage();
      return;
    }

    try {
      if (editingAudio) {
        await updateAudioFile(
          editingAudio,
          audioTitle,
          audioSubtitles,
          audioFile || undefined,
          enableAutoPlay,
          displayOrder
        );
        setMessage({ type: 'success', text: 'Audio file updated successfully!' });
      } else {
        await createAudioFile(
          selectedAudioScene, 
          selectedCharacterId, 
          audioTitle, 
          audioSubtitles, 
          audioFile!, 
          enableAutoPlay, 
          displayOrder
        );
        setMessage({ type: 'success', text: 'Audio file uploaded successfully!' });
      }
      clearMessage();
      
      // Reset form
      setAudioTitle('');
      setAudioSubtitles('');
      setAudioFile(null);
      setSelectedCharacterId('');
      setEnableAutoPlay(false);
      setDisplayOrder(1);
      setEditingAudio(null);
      setShowAudioForm(false);
      
      // Reset file input
      const fileInput = document.getElementById('audio-upload') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to save audio file' 
      });
      clearMessage();
    }
  };

  const handleEditAudio = (audioFile: any) => {
    setAudioTitle(audioFile.audio_title);
    setAudioSubtitles(audioFile.audio_description || '');
    setSelectedCharacterId(audioFile.character_id);
    setEnableAutoPlay(audioFile.auto_play);
    setDisplayOrder(audioFile.display_order);
    setEditingAudio(audioFile.id);
    setShowAudioForm(true);
  };

  const handleDeleteCharacter = async (characterId: string) => {
    if (!confirm('Are you sure you want to delete this character and all associated audio files?')) {
      return;
    }

    try {
      await deleteCharacter(characterId);
      setMessage({ type: 'success', text: 'Character deleted successfully!' });
      clearMessage();
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Delete failed' 
      });
      clearMessage();
    }
  };

  const handleDeleteAudioFile = async (audioId: string) => {
    if (!confirm('Are you sure you want to delete this audio file?')) {
      return;
    }

    try {
      await deleteAudioFile(audioId);
      setMessage({ type: 'success', text: 'Audio file deleted successfully!' });
      clearMessage();
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Delete failed' 
      });
      clearMessage();
    }
  };

  const sceneOptions = Array.from({ length: 10 }, (_, i) => ({
    value: i + 1,
    label: `Scene ${i + 1}`,
    hasVideo: videos.some(v => v.scene_id === i + 1)
  }));

  const sceneCharacters = getCharactersByScene(selectedAudioScene);
  const sceneAudioFiles = getAudioFilesByScene(selectedAudioScene);
  const maxDisplayOrder = sceneAudioFiles.length + 1;
  
  // Get all characters for global selection, sorted by scene and display order
  const allCharacters = getAllCharacters();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Portal</h1>
          <p className="text-gray-600">Manage videos, audio files, and characters for your simulation</p>
        </div>
        
        {/* Message Display */}
        {message && (
          <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 shadow-md border-l-4 ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800 border-green-500' 
              : 'bg-red-50 text-red-800 border-red-500'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600" />
            )}
            <span className="font-medium">{message.text}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200 bg-white rounded-t-xl shadow-sm">
            <nav className="flex space-x-0 overflow-x-auto">
              <button
                onClick={() => setActiveTab('videos')}
                className={`flex items-center gap-2 px-6 py-4 font-medium text-sm border-b-2 whitespace-nowrap transition-colors ${
                  activeTab === 'videos'
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Video className="w-4 h-4" />
                Video Management
              </button>
              <button
                onClick={() => setActiveTab('characters')}
                className={`flex items-center gap-2 px-6 py-4 font-medium text-sm border-b-2 whitespace-nowrap transition-colors ${
                  activeTab === 'characters'
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <User className="w-4 h-4" />
                Characters
              </button>
              <button
                onClick={() => setActiveTab('audio')}
                className={`flex items-center gap-2 px-6 py-4 font-medium text-sm border-b-2 whitespace-nowrap transition-colors ${
                  activeTab === 'audio'
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Music className="w-4 h-4" />
                Audio Management
              </button>
            </nav>
          </div>
        </div>

        {/* Video Management Tab */}
        {activeTab === 'videos' && (
          <div className="space-y-8">
            {/* Upload Form */}
            <div className="bg-white rounded-xl shadow-md border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
                  <Upload className="w-6 h-6 text-blue-600" />
                  Upload New Video
                </h2>
              </div>
              <div className="p-6">
                <form onSubmit={handleUpload} className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Target Scene
                      </label>
                      <select
                        value={selectedScene}
                        onChange={(e) => setSelectedScene(Number(e.target.value))}
                        className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 transition-colors"
                      >
                        {sceneOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label} {option.hasVideo ? '(Has Video)' : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Video File
                      </label>
                      <input
                        id="video-upload"
                        type="file"
                        accept="video/*"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                        className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Video Title
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                      placeholder="Enter a descriptive title for your video"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Description
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                      className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 resize-none"
                      placeholder="Provide a detailed description of the video content and its purpose"
                      required
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={uploading || !file || !title || !description}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-3 font-semibold shadow-lg transition-all"
                  >
                    {uploading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Uploading Video...
                      </>
                    ) : (
                      <>
                        <Upload className="w-5 h-5" />
                        Upload Video
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Video List */}
            <div className="bg-white rounded-xl shadow-md border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
                  <Video className="w-6 h-6 text-blue-600" />
                  Uploaded Videos ({videos.length})
                </h2>
              </div>
              <div className="p-6">
                {loading ? (
                  <div className="text-center py-12">
                    <div className="w-8 h-8 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">Loading videos...</p>
                  </div>
                ) : videos.length === 0 ? (
                  <div className="text-center py-12">
                    <Video className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">No videos uploaded yet</p>
                    <p className="text-gray-400 text-sm">Upload your first video to get started</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {videos.map((video) => (
                      <div key={video.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow bg-gradient-to-br from-white to-gray-50">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-sm font-semibold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                            Scene {video.scene_id}
                          </span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleVideoEdit(video)}
                              className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit video"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(video.scene_id)}
                              className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete video"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{video.title}</h3>
                        <p className="text-sm text-gray-600 mb-4 line-clamp-3">{video.description}</p>
                        <div className="text-xs text-gray-500 flex items-center gap-2">
                          <Calendar className="w-3 h-3" />
                          Uploaded: {new Date(video.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Video Edit Modal */}
            {editingVideo && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                      <Edit className="w-5 h-5" />
                      Edit Video
                    </h3>
                    <button
                      onClick={() => {
                        setEditingVideo(null);
                        setEditVideoTitle('');
                        setEditVideoDescription('');
                        setEditVideoFile(null);
                        setEditPosterFile(null);
                      }}
                      className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <form onSubmit={handleVideoUpdate} className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Video Title
                      </label>
                      <input
                        type="text"
                        value={editVideoTitle}
                        onChange={(e) => setEditVideoTitle(e.target.value)}
                        className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Description
                      </label>
                      <textarea
                        value={editVideoDescription}
                        onChange={(e) => setEditVideoDescription(e.target.value)}
                        rows={4}
                        className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Replace Video File (Optional)
                      </label>
                      <input
                        type="file"
                        accept="video/*"
                        onChange={(e) => setEditVideoFile(e.target.files?.[0] || null)}
                        className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Poster Image (Optional)
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setEditPosterFile(e.target.files?.[0] || null)}
                        className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                    </div>
                    <div className="flex gap-3 pt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingVideo(null);
                          setEditVideoTitle('');
                          setEditVideoDescription('');
                          setEditVideoFile(null);
                          setEditPosterFile(null);
                        }}
                        className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-xl hover:bg-gray-300 font-semibold transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={uploading}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 font-semibold transition-all flex items-center justify-center gap-2"
                      >
                        {uploading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Updating...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            Update Video
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Characters Management Tab */}
        {activeTab === 'characters' && (
          <div className="space-y-8">
            {/* Global Characters Section */}
            <div className="bg-white rounded-xl shadow-md border border-gray-100">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
                    <User className="w-6 h-6 text-blue-600" />
                    All Characters ({allCharacters.length})
                  </h2>
                  <p className="text-gray-600 mt-1">Characters can be reused across multiple scenes</p>
                </div>
                <button
                  onClick={() => setShowCharacterForm(true)}
                  className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-green-700 hover:to-blue-700 flex items-center gap-2 font-semibold shadow-lg transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Add Character
                </button>
              </div>
              <div className="p-6">
                {audioLoading ? (
                  <div className="text-center py-12">
                    <div className="w-8 h-8 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">Loading characters...</p>
                  </div>
                ) : allCharacters.length === 0 ? (
                  <div className="text-center py-12">
                    <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">No characters created yet</p>
                    <p className="text-gray-400 text-sm">Create your first character to get started</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {allCharacters.map((character) => (
                      <div key={character.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow bg-gradient-to-br from-white to-gray-50">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            {character.avatar_url ? (
                              <img
                                src={character.avatar_url}
                                alt={character.character_name}
                                className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                                <User className="w-6 h-6 text-gray-500" />
                              </div>
                            )}
                            <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                              Scene {character.scene_id}
                            </span>
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleEditCharacter(character)}
                              className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit character"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteCharacter(character.id)}
                              className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete character"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-1">{character.character_name}</h3>
                        <p className="text-sm text-gray-600 mb-3">{character.character_role}</p>
                        <div className="text-xs text-gray-500">
                          Audio files: {audioFiles.filter(a => a.character_id === character.id).length}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Audio Management Tab */}
        {activeTab === 'audio' && (
          <div className="space-y-8">
            {/* Scene Selector */}
            <div className="bg-white rounded-xl shadow-md border border-gray-100">
              <div className="p-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Settings className="w-6 h-6 text-blue-600" />
                  Select Scene
                </h2>
                <select
                  value={selectedAudioScene}
                  onChange={(e) => setSelectedAudioScene(Number(e.target.value))}
                  className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-lg font-medium"
                >
                  {Array.from({ length: 10 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      Scene {i + 1}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Audio Files Section */}
            <div className="bg-white rounded-xl shadow-md border border-gray-100">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
                    <Music className="w-6 h-6 text-blue-600" />
                    Audio Files for Scene {selectedAudioScene} ({sceneAudioFiles.length})
                  </h2>
                  <p className="text-gray-600 mt-1">Manage audio clips and their playback order</p>
                </div>
                <button
                  onClick={() => setShowAudioForm(true)}
                  disabled={allCharacters.length === 0}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed flex items-center gap-2 font-semibold shadow-lg transition-all"
                  title={allCharacters.length === 0 ? "Create characters first" : ""}
                >
                  <Plus className="w-4 h-4" />
                  Add Audio
                </button>
              </div>
              <div className="p-6">
                {sceneAudioFiles.length === 0 ? (
                  <div className="text-center py-12">
                    <Music className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">No audio files for this scene yet</p>
                    <p className="text-gray-400 text-sm">Add audio files to bring your scene to life</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sceneAudioFiles
                      .sort((a, b) => a.display_order - b.display_order)
                      .map((audioFile, index) => (
                        <div key={audioFile.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow bg-gradient-to-r from-white to-gray-50">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">
                                  {audioFile.display_order}
                                </div>
                                {audioFile.character?.avatar_url ? (
                                  <img
                                    src={audioFile.character.avatar_url}
                                    alt={audioFile.character.character_name}
                                    className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                                  />
                                ) : (
                                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                                    <User className="w-6 h-6 text-gray-500" />
                                  </div>
                                )}
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                  {audioFile.audio_title}
                                  {audioFile.auto_play && (
                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                                      Auto-play
                                    </span>
                                  )}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  {audioFile.character?.character_name} - {audioFile.character?.character_role}
                                </p>
                                {audioFile.audio_description && (
                                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                    {audioFile.audio_description}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditAudio(audioFile)}
                                className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Edit audio"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteAudioFile(audioFile.id)}
                                className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete audio"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Character Form Modal */}
        {showCharacterForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  {editingCharacter ? 'Edit Character' : 'Add Character'}
                </h3>
                <button
                  onClick={() => {
                    setShowCharacterForm(false);
                    setEditingCharacter(null);
                    setCharacterName('');
                    setCharacterRole('');
                    setAvatarFile(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleCreateCharacter} className="space-y-6">
                {!editingCharacter && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Initial Scene
                    </label>
                    <select
                      value={selectedAudioScene}
                      onChange={(e) => setSelectedAudioScene(Number(e.target.value))}
                      className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {Array.from({ length: 10 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                          Scene {i + 1}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Characters can be used in other scenes too</p>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Character Name
                  </label>
                  <input
                    type="text"
                    value={characterName}
                    onChange={(e) => setCharacterName(e.target.value)}
                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Dr. Smith, Nurse Johnson"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Role/Title
                  </label>
                  <input
                    type="text"
                    value={characterRole}
                    onChange={(e) => setCharacterRole(e.target.value)}
                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Emergency Physician, Registered Nurse"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Avatar Image (Optional)
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCharacterForm(false);
                      setEditingCharacter(null);
                      setCharacterName('');
                      setCharacterRole('');
                      setAvatarFile(null);
                    }}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-xl hover:bg-gray-300 font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 px-4 rounded-xl hover:from-green-700 hover:to-blue-700 font-semibold transition-all"
                  >
                    {editingCharacter ? 'Update Character' : 'Create Character'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Audio Form Modal */}
        {showAudioForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <Music className="w-5 h-5" />
                  {editingAudio ? 'Edit Audio File' : 'Add Audio File'}
                </h3>
                <button
                  onClick={() => {
                    setShowAudioForm(false);
                    setEditingAudio(null);
                    setAudioTitle('');
                    setAudioSubtitles('');
                    setAudioFile(null);
                    setSelectedCharacterId('');
                    setEnableAutoPlay(false);
                    setDisplayOrder(1);
                  }}
                  className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleCreateAudioFile} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Character
                  </label>
                  <div className="space-y-3">
                    <select
                      value={selectedCharacterId}
                      onChange={(e) => setSelectedCharacterId(e.target.value)}
                      className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select a character</option>
                      {allCharacters.map((character) => (
                        <option key={character.id} value={character.id}>
                          {character.character_name} - {character.character_role} (Scene {character.scene_id})
                        </option>
                      ))}
                    </select>
                    
                    {/* Character Preview */}
                    {selectedCharacterId && (
                      <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                        {(() => {
                          const selectedChar = allCharacters.find(c => c.id === selectedCharacterId);
                          return selectedChar ? (
                            <div className="flex items-center gap-3">
                              {selectedChar.avatar_url ? (
                                <img
                                  src={selectedChar.avatar_url}
                                  alt={selectedChar.character_name}
                                  className="w-12 h-12 rounded-full object-cover border-2 border-blue-300"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-full bg-blue-200 flex items-center justify-center">
                                  <User className="w-6 h-6 text-blue-600" />
                                </div>
                              )}
                              <div>
                                <p className="font-semibold text-gray-900">{selectedChar.character_name}</p>
                                <p className="text-sm text-gray-600">{selectedChar.character_role}</p>
                                <p className="text-xs text-gray-500">Originally from Scene {selectedChar.scene_id}</p>
                              </div>
                            </div>
                          ) : null;
                        })()}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Audio Title
                  </label>
                  <input
                    type="text"
                    value={audioTitle}
                    onChange={(e) => setAudioTitle(e.target.value)}
                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Introduction, Patient Assessment"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Transcript/Subtitles
                  </label>
                  <textarea
                    value={audioSubtitles}
                    onChange={(e) => setAudioSubtitles(e.target.value)}
                    rows={4}
                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Enter the full transcript or subtitles for this audio clip..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Audio File {editingAudio && '(Optional - leave empty to keep current file)'}
                  </label>
                  <input
                    id="audio-upload"
                    type="file"
                    accept="audio/*"
                    onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    required={!editingAudio}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Playback Order
                    </label>
                    <select
                      value={displayOrder}
                      onChange={(e) => setDisplayOrder(Number(e.target.value))}
                      className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      {Array.from({ length: maxDisplayOrder }, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                          Position {i + 1}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-3 p-4 border border-gray-300 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors w-full">
                      <input
                        type="checkbox"
                        checked={enableAutoPlay}
                        onChange={(e) => setEnableAutoPlay(e.target.checked)}
                        className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <div>
                        <span className="text-sm font-semibold text-gray-700">Auto-play</span>
                        <p className="text-xs text-gray-500">Start playing automatically</p>
                      </div>
                    </label>
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAudioForm(false);
                      setEditingAudio(null);
                      setAudioTitle('');
                      setAudioSubtitles('');
                      setAudioFile(null);
                      setSelectedCharacterId('');
                      setEnableAutoPlay(false);
                      setDisplayOrder(1);
                    }}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-xl hover:bg-gray-300 font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-xl hover:from-blue-700 hover:to-purple-700 font-semibold transition-all flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {editingAudio ? 'Update Audio' : 'Upload Audio'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoUploadAdmin;