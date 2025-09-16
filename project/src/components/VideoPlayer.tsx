import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, RotateCcw } from 'lucide-react';

interface VideoPlayerProps {
  videoUrl: string;
  onVideoEnd?: () => void;
  poster?: string;
  autoPlay?: boolean;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  videoUrl, 
  onVideoEnd, 
  poster,
  autoPlay = false 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleLoadedMetadata = () => setDuration(video.duration);
    const handleEnded = () => {
      setIsPlaying(false);
      onVideoEnd?.();
    };
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, [onVideoEnd]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(!isMuted);
  };

  const handleRestart = () => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = 0;
    if (!isPlaying) {
      video.play();
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const newTime = (parseFloat(e.target.value) / 100) * duration;
    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div 
      className="relative group bg-black w-full h-full"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        poster={poster || undefined}
        autoPlay={autoPlay}
        playsInline
        style={{ maxHeight: '100%', maxWidth: '100%' }}
      >
        {videoUrl && <source src={videoUrl} type="video/mp4" />}
        Your browser does not support the video tag.
      </video>

      {/* Video Controls Overlay */}
      <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        {/* Play/Pause Button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={togglePlay}
            className="p-3 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-200 transform hover:scale-110"
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 text-white" />
            ) : (
              <Play className="w-6 h-6 text-white ml-1" />
            )}
          </button>
        </div>

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          {/* Progress Bar */}
          <div className="mb-2">
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={handleSeek}
              className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer
                       [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 
                       [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-400
                       [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:rounded-full 
                       [&::-moz-range-thumb]:bg-cyan-400 [&::-moz-range-thumb]:border-0"
            />
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={handleRestart}
                className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-all duration-200"
              >
                <RotateCcw className="w-3 h-3 text-white" />
              </button>
              
              <button
                onClick={toggleMute}
                className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-all duration-200"
              >
                {isMuted ? (
                  <VolumeX className="w-3 h-3 text-white" />
                ) : (
                  <Volume2 className="w-3 h-3 text-white" />
                )}
              </button>
            </div>

            <div className="text-white text-xs font-mono">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;