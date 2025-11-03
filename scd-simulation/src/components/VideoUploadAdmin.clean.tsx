import React, { useState } from 'react';
import { useVideoData } from '../hooks/useVideoData';
import { useSceneData } from '../hooks/useSceneData';
import { scenes, SceneData } from '../data/scenesData';
import SceneEditorModal from './admin/SceneEditorModal';
import WelcomeScreenEditor from './admin/WelcomeScreenEditor';
import AnalyticsDashboard from './admin/AnalyticsDashboard';
import EnhancedVideoManagement from './admin/EnhancedVideoManagement';
import { 
  Video, 
  CheckCircle, 
  AlertCircle, 
  Edit,
  Save,
  Settings,
  BarChart3,
  Database,
  Activity,
  Target,
  Heart,
  DoorOpen,
  Upload,
  X,
  Trash2,
  Calendar,
  Plus,
  Music,
  User
} from 'lucide-react';

const VideoUploadAdmin: React.FC = () => {
  const { videos, loading, uploadVideo, updateVideo, deleteVideo } = useVideoData();
  const { saveSceneConfiguration, exportSceneConfiguration, importSceneConfiguration } = useSceneData();
  
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
  
  const [activeTab, setActiveTab] = useState<'videos' | 'scenes' | 'analytics' | 'settings' | 'welcome'>('videos');
  
  // Scene management state
  const [selectedSceneForEdit, setSelectedSceneForEdit] = useState<number | null>(null);
  const [sceneEditData, setSceneEditData] = useState<Partial<SceneData>>({});
  const [showSceneEditor, setShowSceneEditor] = useState(false);
  
  // Settings state
  const [webhookUrl, setWebhookUrl] = useState('https://hook.us2.make.com/255f21cb3adzdqw4kobc89b981g1jmie');
  const [settingsChanged, setSettingsChanged] = useState(false);

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
    } catch (error) {
      console.error('Error uploading video:', error);
      setMessage({ type: 'error', text: 'Failed to upload video. Please try again.' });
      clearMessage();
    } finally {
      setUploading(false);
    }
  };

  const handleVideoEdit = (video: any) => {
    setEditingVideo(video.id);
    setEditVideoTitle(video.title);
    setEditVideoDescription(video.description);
  };

  const handleVideoUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVideo || !editVideoTitle || !editVideoDescription) return;

    setUploading(true);
    try {
      await updateVideo(editingVideo, editVideoTitle, editVideoDescription, editVideoFile || undefined, editPosterFile || undefined);
      setMessage({ type: 'success', text: 'Video updated successfully!' });
      clearMessage();
      
      setEditingVideo(null);
      setEditVideoTitle('');
      setEditVideoDescription('');
      setEditVideoFile(null);
      setEditPosterFile(null);
    } catch (error) {
      console.error('Error updating video:', error);
      setMessage({ type: 'error', text: 'Failed to update video.' });
      clearMessage();
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (sceneId: number) => {
    if (!confirm('Are you sure you want to delete this video?')) return;

    try {
      await deleteVideo(sceneId);
      setMessage({ type: 'success', text: 'Video deleted successfully!' });
      clearMessage();
    } catch (error) {
      console.error('Error deleting video:', error);
      setMessage({ type: 'error', text: 'Failed to delete video.' });
      clearMessage();
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-purple-50 overflow-hidden">
      <div className="flex-1 flex flex-col container mx-auto px-4 py-6 max-w-7xl overflow-hidden">
        {/* Header */}
        <div className="mb-6 flex-shrink-0">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Portal</h1>
          <p className="text-gray-600">Manage your simulation platform</p>
        </div>
        
        {/* Message Display */}
        {message && (
          <div className={`mb-4 p-4 rounded-xl flex items-center gap-3 shadow-md border-l-4 flex-shrink-0 ${
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
        <div className="flex-shrink-0 mb-4">
          <div className="border-b border-gray-200 bg-white rounded-t-xl shadow-sm">
            <nav className="flex space-x-0 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              <button
                onClick={() => setActiveTab('videos')}
                className={`flex items-center gap-2 px-6 py-4 font-medium text-sm border-b-2 whitespace-nowrap transition-colors ${
                  activeTab === 'videos'
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Video className="w-4 h-4" />
                Videos
              </button>
              <button
                onClick={() => setActiveTab('scenes')}
                className={`flex items-center gap-2 px-6 py-4 font-medium text-sm border-b-2 whitespace-nowrap transition-colors ${
                  activeTab === 'scenes'
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Database className="w-4 h-4" />
                Scene Management
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`flex items-center gap-2 px-6 py-4 font-medium text-sm border-b-2 whitespace-nowrap transition-colors ${
                  activeTab === 'analytics'
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                Analytics
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`flex items-center gap-2 px-6 py-4 font-medium text-sm border-b-2 whitespace-nowrap transition-colors ${
                  activeTab === 'settings'
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Settings className="w-4 h-4" />
                Settings
              </button>
              <button
                onClick={() => setActiveTab('welcome')}
                className={`flex items-center gap-2 px-6 py-4 font-medium text-sm border-b-2 whitespace-nowrap transition-colors ${
                  activeTab === 'welcome'
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <DoorOpen className="w-4 h-4" />
                Welcome Screen
              </button>
            </nav>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto pr-2">
          {/* Video Management Tab */}
          {activeTab === 'videos' && (
            <div className="h-full pb-8">
              <EnhancedVideoManagement
                videos={videos}
                loading={loading}
                uploading={uploading}
                onUpload={handleUpload}
                onUpdate={handleVideoUpdate}
                onDelete={handleDelete}
              />
            </div>
          )}

          {/* Scene Management Tab */}
          {activeTab === 'scenes' && (
            <div className="space-y-8 pb-8">
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-xl border border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Scene Configuration</h2>
                    <p className="text-gray-600">Manage all aspects of simulation scenes including questions, prompts, vitals, and clinical data.</p>
                  </div>
                  <button
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = '.json';
                      input.onchange = async (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        if (file) {
                          const text = await file.text();
                          const success = await importSceneConfiguration(text);
                          if (success) {
                            setMessage({ type: 'success', text: 'Scene imported!' });
                          } else {
                            setMessage({ type: 'error', text: 'Import failed.' });
                          }
                          clearMessage();
                        }
                      };
                      input.click();
                    }}
                    className="px-4 py-2 bg-white border-2 border-purple-300 text-purple-700 rounded-lg hover:bg-purple-50 transition-colors flex items-center gap-2 font-medium"
                  >
                    <Upload className="w-4 h-4" />
                    Import Scene
                  </button>
                </div>
              </div>

              {/* Scene Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {scenes.map((scene) => (
                  <div
                    key={scene.id}
                    className="bg-white rounded-xl shadow-md border-2 border-gray-100 hover:border-blue-400 transition-all p-6 cursor-pointer group"
                    onClick={() => {
                      setSelectedSceneForEdit(parseInt(scene.id));
                      setSceneEditData(scene);
                      setShowSceneEditor(true);
                    }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                          {scene.title}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-2">{scene.description}</p>
                      </div>
                      <Edit className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors ml-2 flex-shrink-0" />
                    </div>
                    
                    <div className="space-y-2 text-xs text-gray-500">
                      <div className="flex items-center gap-2">
                        <Heart className="w-4 h-4 text-red-500" />
                        <span>HR: {scene.vitals.heartRate} | BP: {scene.vitals.systolic}/{scene.vitals.diastolic}</span>
                      </div>
                      {scene.quiz && (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>{scene.quiz.questions.length} Questions</span>
                        </div>
                      )}
                      {scene.actionPrompt && (
                        <div className="flex items-center gap-2">
                          <Activity className="w-4 h-4 text-blue-500" />
                          <span>Action Prompt: {scene.actionPrompt.type}</span>
                        </div>
                      )}
                      {scene.scoringCategories && scene.scoringCategories.length > 0 && (
                        <div className="flex items-center gap-2">
                          <Target className="w-4 h-4 text-purple-500" />
                          <span>{scene.scoringCategories.length} Categories</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <AnalyticsDashboard />
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">System Configuration</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Webhook URL</label>
                <input
                  type="url"
                  value={webhookUrl}
                  onChange={(e) => {
                    setWebhookUrl(e.target.value);
                    setSettingsChanged(true);
                  }}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="https://hook.us2.make.com/..."
                />
                {settingsChanged && (
                  <button
                    onClick={() => {
                      setSettingsChanged(false);
                      setMessage({ type: 'success', text: 'Settings saved!' });
                      clearMessage();
                    }}
                    className="mt-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save Configuration
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Welcome Tab */}
          {activeTab === 'welcome' && (
            <WelcomeScreenEditor />
          )}
        </div>
      </div>
      
      {/* Scene Editor Modal */}
      {showSceneEditor && selectedSceneForEdit && sceneEditData && (
        <SceneEditorModal
          scene={sceneEditData as SceneData}
          onSave={async (updatedScene) => {
            const success = await saveSceneConfiguration(updatedScene);
            if (success) {
              setMessage({ type: 'success', text: `Scene ${updatedScene.id} saved successfully to database!` });
              setShowSceneEditor(false);
              setSelectedSceneForEdit(null);
              setSceneEditData({});
            } else {
              setMessage({ type: 'error', text: 'Failed to save scene configuration. Please try again.' });
            }
            clearMessage();
          }}
          onClose={() => {
            setShowSceneEditor(false);
            setSelectedSceneForEdit(null);
            setSceneEditData({});
          }}
          onExport={async (sceneId) => {
            const jsonData = await exportSceneConfiguration(sceneId);
            if (jsonData) {
              const blob = new Blob([jsonData], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `scene-${sceneId}-config.json`;
              a.click();
              URL.revokeObjectURL(url);
              setMessage({ type: 'success', text: 'Scene configuration exported!' });
            } else {
              setMessage({ type: 'error', text: 'Failed to export scene configuration.' });
            }
            clearMessage();
          }}
        />
      )}
    </div>
  );
};

export default VideoUploadAdmin;

