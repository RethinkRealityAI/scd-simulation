import React, { useState, useEffect } from 'react';
import { Upload, Video, Edit, Trash2, Calendar, X, Save, Play, Info, CheckCircle2 } from 'lucide-react';
import { useVideoData } from '../../hooks/useVideoData';

interface VideoData {
  id: string;
  scene_id: number;
  title: string;
  description: string;
  video_url: string;
  poster_url?: string;
  created_at: string;
}

interface EnhancedVideoManagementProps {
  onMessage?: (message: { type: 'success' | 'error'; text: string }) => void;
}

const EnhancedVideoManagement: React.FC<EnhancedVideoManagementProps> = ({ onMessage }) => {
  const { videos, loading, uploadVideo, updateVideo, deleteVideo } = useVideoData();
  
  const [uploading, setUploading] = useState(false);
  const [selectedScene, setSelectedScene] = useState(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const [editingVideo, setEditingVideo] = useState<VideoData | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editVideoFile, setEditVideoFile] = useState<File | null>(null);
  const [editPosterFile, setEditPosterFile] = useState<File | null>(null);
  
  const [selectedVideoForPreview, setSelectedVideoForPreview] = useState<VideoData | null>(null);

  // Update preview when selected scene changes or videos change
  useEffect(() => {
    const existingVideo = videos.find(v => v.scene_id === selectedScene);
    if (existingVideo) {
      setSelectedVideoForPreview(existingVideo);
    } else {
      setSelectedVideoForPreview(null);
    }
    // Clear file preview when scene changes
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  }, [selectedScene, videos]);

  // Create preview URL when a new file is selected
  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [file]);

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title || !description) {
      onMessage?.({ type: 'error', text: 'Please fill in all fields (title, description, and select a video file)' });
      return;
    }
    
    setUploading(true);
    try {
      await uploadVideo(file, selectedScene, title, description);
      onMessage?.({ type: 'success', text: `Video uploaded successfully for Scene ${selectedScene}!` });
      
      // Reset form
      setTitle('');
      setDescription('');
      setFile(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      const fileInput = document.getElementById('video-file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to upload video. Unknown error.';
      console.error('Upload error in component:', error);
      onMessage?.({ type: 'error', text: errorMsg });
    } finally {
      setUploading(false);
    }
  };

  const handleEditClick = (video: VideoData) => {
    setEditingVideo(video);
    setEditTitle(video.title);
    setEditDescription(video.description);
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVideo) return;
    
    setUploading(true);
    try {
      await updateVideo(editingVideo.id, editTitle, editDescription, editVideoFile || undefined, editPosterFile || undefined);
      onMessage?.({ type: 'success', text: 'Video updated successfully!' });
      
      // Reset
      setEditingVideo(null);
      setEditTitle('');
      setEditDescription('');
      setEditVideoFile(null);
      setEditPosterFile(null);
    } catch (error) {
      onMessage?.({ type: 'error', text: 'Failed to update video' });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteVideo = async (sceneId: number) => {
    if (!confirm('Delete this video?')) return;
    
    try {
      await deleteVideo(sceneId);
      onMessage?.({ type: 'success', text: 'Video deleted!' });
    } catch (error) {
      onMessage?.({ type: 'error', text: 'Failed to delete video' });
    }
  };

  const sceneOptions = Array.from({ length: 10 }, (_, i) => ({
    value: i + 1,
    label: `Scene ${i + 1}`,
    hasVideo: videos.some(v => v.scene_id === i + 1)
  }));

  // Calculate statistics
  const totalVideos = videos.length;
  const scenesWithVideos = new Set(videos.map(v => v.scene_id)).size;
  const totalScenes = 10;

  return (
    <div className="h-full flex gap-4">
      {/* Left Column - Controls & List */}
      <div className="w-1/2 flex flex-col gap-4 overflow-y-auto pr-2">
        {/* Scene Quick Navigation */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg shadow-sm border border-blue-100 p-3 flex-shrink-0">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Scene Navigation</h3>
            <div className="text-xs text-gray-600 bg-white px-2 py-0.5 rounded-full">
              {scenesWithVideos}/{totalScenes} have videos
            </div>
          </div>
          <div className="grid grid-cols-10 gap-1.5">
            {sceneOptions.map(opt => (
              <button
                key={opt.value}
                onClick={() => setSelectedScene(opt.value)}
                className={`aspect-square rounded-lg text-xs font-semibold transition-all duration-200 ${
                  selectedScene === opt.value
                    ? 'bg-blue-600 text-white shadow-md scale-105'
                    : opt.hasVideo
                    ? 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-300'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
                title={`Scene ${opt.value}${opt.hasVideo ? ' (has video)' : ' (no video)'}`}
              >
                {opt.value}
              </button>
            ))}
          </div>
        </div>

        {/* Upload Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex-shrink-0">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Upload className="w-4 h-4 text-blue-600" />
                Upload New Video
              </h2>
              {videos.find(v => v.scene_id === selectedScene) && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Video exists
                </span>
              )}
            </div>
          </div>
          <form onSubmit={handleUploadSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Scene
                    <span className="ml-2 text-xs text-gray-500 font-normal">(✓ = has video)</span>
                  </label>
                  <select
                    value={selectedScene}
                    onChange={(e) => {
                      setSelectedScene(Number(e.target.value));
                      // Clear file when changing scenes
                      setFile(null);
                      const fileInput = document.getElementById('video-file-input') as HTMLInputElement;
                      if (fileInput) fileInput.value = '';
                    }}
                    className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium bg-white hover:border-blue-400 transition-colors"
                  >
                    {sceneOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label} {opt.hasVideo ? '✓' : '○'}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Video File</label>
                  <input
                    id="video-file-input"
                    type="file"
                    accept="video/*"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="w-full text-sm p-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="Enter video title..."
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none"
                  placeholder="Enter video description..."
                  required
                />
              </div>
              
              <button
                type="submit"
                disabled={uploading || !file}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold text-sm transition-all shadow-md hover:shadow-lg"
              >
                {uploading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Uploading...
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

        {/* Video List */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 flex-1 min-h-0 flex flex-col overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50 flex-shrink-0">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Video className="w-5 h-5 text-blue-600" />
              Uploaded Videos ({videos.length})
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto p-5">
            {loading ? (
              <div className="text-center py-12">
                <div className="w-10 h-10 border-3 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-600 text-sm font-medium">Loading videos...</p>
              </div>
            ) : videos.length === 0 ? (
              <div className="text-center py-16">
                <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                  <Video className="w-10 h-10 text-gray-400" />
                </div>
                <p className="text-gray-600 font-semibold mb-2">No videos uploaded yet</p>
                <p className="text-gray-500 text-sm">Upload your first video to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {videos.map((video) => (
                  <div
                    key={video.id}
                    onClick={() => setSelectedVideoForPreview(video)}
                    className={`border-2 rounded-xl p-4 cursor-pointer transition-all hover:scale-[1.02] ${
                      selectedVideoForPreview?.id === video.id
                        ? 'border-blue-500 bg-blue-50 shadow-lg ring-2 ring-blue-200'
                        : 'border-gray-200 hover:border-blue-300 hover:shadow-md bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-xs font-bold text-blue-700 bg-blue-100 px-3 py-1 rounded-full">
                        Scene {video.scene_id}
                      </span>
                      <div className="flex gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditClick(video);
                          }}
                          className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-100 rounded-lg transition-all"
                          title="Edit video"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteVideo(video.scene_id);
                          }}
                          className="text-red-600 hover:text-red-800 p-2 hover:bg-red-100 rounded-lg transition-all"
                          title="Delete video"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <h3 className="font-bold text-gray-900 text-sm mb-2 line-clamp-1">{video.title}</h3>
                    <p className="text-xs text-gray-600 line-clamp-2 mb-3 leading-relaxed">{video.description}</p>
                    <div className="text-xs text-gray-500 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(video.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Column - Preview */}
      <div className="flex-1 bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden flex flex-col min-h-0">
        <div className="px-5 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50 flex-shrink-0">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Play className="w-5 h-5 text-purple-600" />
            Video Preview
            {previewUrl && (
              <span className="ml-auto text-xs bg-orange-100 text-orange-700 px-2.5 py-1 rounded-full flex items-center gap-1 font-semibold">
                <Info className="w-3.5 h-3.5" />
                New Upload
              </span>
            )}
          </h2>
        </div>
        
        {/* Show new file preview if available, otherwise show existing video */}
        {previewUrl || selectedVideoForPreview ? (
          <div className="flex-1 flex flex-col p-5 overflow-y-auto">
            {/* Video Status Banner */}
            {previewUrl ? (
              <div className="mb-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-orange-900">New Video Selected</p>
                    <p className="text-xs text-orange-700 mt-1">
                      This is a preview of your new upload. Click "Upload Video" to save it to Scene {selectedScene}.
                    </p>
                  </div>
                </div>
              </div>
            ) : selectedVideoForPreview && (
              <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-green-900">Current Video for Scene {selectedScene}</p>
                    <p className="text-xs text-green-700 mt-1">
                      This video is currently live in the simulation. Upload a new video to replace it.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Video Player */}
            <div className="bg-black rounded-lg overflow-hidden mb-4 aspect-video">
              <video
                key={previewUrl || selectedVideoForPreview?.id}
                controls
                className="w-full h-full"
                poster={selectedVideoForPreview?.poster_url}
              >
                <source src={previewUrl || selectedVideoForPreview?.video_url} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
            
            {/* Video Information */}
            <div className="space-y-3">
              <div>
                <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                  Scene {selectedScene}
                </span>
              </div>
              
              {previewUrl ? (
                <div>
                  <h3 className="font-bold text-lg text-gray-900 mb-1">{title || 'Untitled Video'}</h3>
                  <p className="text-sm text-gray-600">{description || 'No description provided'}</p>
                  <div className="mt-3 p-2 bg-blue-50 rounded-lg">
                    <p className="text-xs text-blue-700">
                      <strong>File:</strong> {file?.name} ({((file?.size || 0) / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  </div>
                </div>
              ) : selectedVideoForPreview && (
                <div>
                  <h3 className="font-bold text-lg text-gray-900 mb-1">{selectedVideoForPreview.title}</h3>
                  <p className="text-sm text-gray-600">{selectedVideoForPreview.description}</p>
                  <div className="pt-3 border-t border-gray-200 mt-3">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-500">Uploaded:</span>
                        <p className="font-medium text-gray-900">
                          {new Date(selectedVideoForPreview.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Video ID:</span>
                        <p className="font-medium text-gray-900 font-mono text-xs truncate">
                          {selectedVideoForPreview.id.slice(0, 8)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-purple-50 via-white to-blue-50">
            <div className="text-center max-w-md">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Play className="w-12 h-12 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">No Video Selected</h3>
              <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                {videos.length > 0 
                  ? 'Click on any video from the list on the left to preview it here, or select a new file to upload.'
                  : 'Upload your first video to get started! Videos will appear in the list and can be previewed here.'}
              </p>
              {videos.length === 0 && (
                <div className="flex items-start gap-3 text-xs text-gray-600 bg-white p-4 rounded-xl border-2 border-gray-200 shadow-sm">
                  <Info className="w-5 h-5 flex-shrink-0 text-blue-500 mt-0.5" />
                  <span className="text-left">
                    <strong className="block mb-1 text-gray-900">Getting Started:</strong>
                    Each scene can have one video. Upload videos using the form on the left, then preview them here before using in your simulation.
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <Edit className="w-5 h-5" />
                Edit Video
              </h3>
              <button
                onClick={() => {
                  setEditingVideo(null);
                  setEditTitle('');
                  setEditDescription('');
                  setEditVideoFile(null);
                  setEditPosterFile(null);
                }}
                className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleUpdateSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Replace Video (Optional)</label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => setEditVideoFile(e.target.files?.[0] || null)}
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm file:mr-3 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-50 file:text-blue-700"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Poster Image (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setEditPosterFile(e.target.files?.[0] || null)}
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm file:mr-3 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-50 file:text-blue-700"
                />
              </div>
              
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingVideo(null);
                    setEditTitle('');
                    setEditDescription('');
                    setEditVideoFile(null);
                    setEditPosterFile(null);
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 py-2.5 rounded-lg hover:bg-gray-300 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2.5 rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 font-medium transition-all flex items-center justify-center gap-2"
                >
                  {uploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Update
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedVideoManagement;

