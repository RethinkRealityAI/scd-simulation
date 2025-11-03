import React, { useState } from 'react';
import { Video, Activity } from 'lucide-react';
import VideoPlayer from './VideoPlayer';

interface TabContainerProps {
  videoUrl?: string;
  iframeUrl?: string;
  posterUrl?: string;
  sceneTitle: string;
  onVideoEnd?: () => void;
}

const TabContainer: React.FC<TabContainerProps> = ({
  videoUrl,
  iframeUrl,
  posterUrl,
  sceneTitle,
  onVideoEnd
}) => {
  const [activeTab, setActiveTab] = useState<'video' | 'interactive'>('video');

  return (
    <div className="rounded-lg overflow-hidden bg-black/50 backdrop-blur-xl border border-white/20 flex-1 min-h-0 flex flex-col">
      {/* Tab Navigation */}
      <div className="flex border-b border-white/20 bg-black/30">
        <button
          onClick={() => setActiveTab('video')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'video'
              ? 'text-cyan-400 border-b-2 border-cyan-400 bg-cyan-500/10'
              : 'text-gray-300 hover:text-white hover:bg-white/10'
          }`}
        >
          <Video className="w-4 h-4" />
          Video
        </button>
        <button
          onClick={() => setActiveTab('interactive')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'interactive'
              ? 'text-cyan-400 border-b-2 border-cyan-400 bg-cyan-500/10'
              : 'text-gray-300 hover:text-white hover:bg-white/10'
          }`}
        >
          <Activity className="w-4 h-4" />
          Interactive Exam
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 min-h-0">
        {activeTab === 'video' && (
          <div className="w-full h-full">
            {videoUrl ? (
              <VideoPlayer
                videoUrl={videoUrl}
                poster={posterUrl}
                onVideoEnd={onVideoEnd}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-white text-center">
                  <Video className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p className="text-gray-300">No video available for this scene</p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'interactive' && (
          <div className="w-full h-full">
            {iframeUrl ? (
              <iframe
                src={iframeUrl}
                className="w-full h-full border-0"
                title={`${sceneTitle} Interactive Content`}
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation"
                loading="lazy"
                onError={(e) => {
                  console.error('Iframe failed to load:', e);
                }}
                onLoad={() => {
                  console.log('Iframe loaded successfully');
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-white text-center">
                  <Activity className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p className="text-gray-300">No interactive content available for this scene</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TabContainer;
