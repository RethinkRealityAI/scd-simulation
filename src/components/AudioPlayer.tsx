import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, RotateCcw } from 'lucide-react';

interface AudioPlayerProps {
  audioUrl: string;
  title: string;
  characterName: string;
  avatarUrl?: string;
  subtitles?: string;
  autoPlay?: boolean;
  isCurrentlyPlaying?: boolean;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  className?: string;
  isHidden?: boolean;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({
  audioUrl,
  title,
  characterName,
  avatarUrl,
  subtitles,
  autoPlay = false,
  isCurrentlyPlaying = false,
  onPlay,
  onPause,
  onEnded,
  className = '',
  isHidden = false
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Handle auto-play
    if (autoPlay || isCurrentlyPlaying) {
      audio.play().catch(console.error);
    }

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleEnded = () => {
      setIsPlaying(false);
      onEnded?.();
    };
    const handlePlay = () => {
      setIsPlaying(true);
      onPlay?.();
    };
    const handlePause = () => {
      setIsPlaying(false);
      onPause?.();
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, [onPlay, onPause, onEnded, autoPlay, isCurrentlyPlaying]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.muted = !audio.muted;
    setIsMuted(!isMuted);
  };

  const handleRestart = () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.currentTime = 0;
    if (!isPlaying) {
      audio.play();
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = (parseFloat(e.target.value) / 100) * duration;
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newVolume = parseFloat(e.target.value) / 100;
    audio.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const isPill = className.includes('pill');

  const toggleExpanded = () => {
    if (isPill && subtitles) {
      setIsExpanded(!isExpanded);
    }
  };

  // If hidden, only render the audio element
  if (isHidden) {
    return (
      <audio ref={audioRef} preload="metadata" loop={false} style={{ display: 'none' }}>
        <source src={audioUrl} />
        Your browser does not support the audio element.
      </audio>
    );
  }

  return (
    <div className={`bg-white/10 backdrop-blur-xl transition-all duration-300 ${
      isPill && !isExpanded 
        ? 'rounded-full p-1.5' 
        : 'rounded-lg p-3'
    } border ${
      isCurrentlyPlaying 
        ? 'border-cyan-400 shadow-lg shadow-cyan-400/20 bg-cyan-500/10' 
        : 'border-white/20'
    } ${className}`}>
      <audio ref={audioRef} preload="metadata" loop={false}>
        <source src={audioUrl} />
        Your browser does not support the audio element.
      </audio>

      {/* Collapsed Pill Mode */}
      {isPill && !isExpanded ? (
        <div className="flex items-center gap-2 cursor-pointer" onClick={toggleExpanded}>
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={characterName}
              className="w-5 h-5 rounded-full object-cover border border-cyan-400"
            />
          ) : (
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold text-xs">
              {characterName.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h4 className="text-white font-medium text-xs truncate">{title}</h4>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              togglePlay();
            }}
            className="p-1 rounded-full bg-cyan-500 hover:bg-cyan-400 transition-colors duration-200 text-white flex-shrink-0"
          >
            {isPlaying ? (
              <Pause className="w-2.5 h-2.5" />
            ) : (
              <Play className="w-2.5 h-2.5 ml-0.5" />
            )}
          </button>
        </div>
      ) : (
        /* Expanded Mode */
        <div>
          {/* Character Info Header */}
          <div className={`flex items-center gap-2 mb-3 ${isPill ? 'cursor-pointer' : ''}`} 
               onClick={isPill ? toggleExpanded : undefined}>
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={characterName}
                className="w-7 h-7 rounded-full object-cover border-2 border-cyan-400"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm">
                {characterName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h4 className="text-white font-semibold text-sm truncate">{title}</h4>
              <p className="text-gray-300 text-xs truncate">{characterName}</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-2">
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={handleSeek}
              className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer
                       [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 
                       [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-400
                       [&::-moz-range-thumb]:w-2.5 [&::-moz-range-thumb]:h-2.5 [&::-moz-range-thumb]:rounded-full 
                       [&::-moz-range-thumb]:bg-cyan-400 [&::-moz-range-thumb]:border-0"
            />
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <button
                onClick={togglePlay}
                className="p-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 transition-colors duration-200 text-white"
              >
                {isPlaying ? (
                  <Pause className="w-3 h-3" />
                ) : (
                  <Play className="w-3 h-3 ml-0.5" />
                )}
              </button>
              
              <button
                onClick={handleRestart}
                className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors duration-200 text-white"
              >
                <RotateCcw className="w-2.5 h-2.5" />
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={toggleMute}
                className="p-1 rounded-lg bg-white/20 hover:bg-white/30 transition-colors duration-200 text-white"
              >
                {isMuted ? (
                  <VolumeX className="w-2.5 h-2.5" />
                ) : (
                  <Volume2 className="w-2.5 h-2.5" />
                )}
              </button>
              
              <input
                type="range"
                min="0"
                max="100"
                value={isMuted ? 0 : volume * 100}
                onChange={handleVolumeChange}
                className="w-12 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer
                         [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-1.5 [&::-webkit-slider-thumb]:h-1.5 
                         [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white
                         [&::-moz-range-thumb]:w-1.5 [&::-moz-range-thumb]:h-1.5 [&::-moz-range-thumb]:rounded-full 
                         [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-0"
              />
            </div>

            <div className="text-white font-mono text-xs">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>

          {/* Transcript */}
          {subtitles && (
            <div className="p-2 rounded-lg bg-slate-800/50 border border-cyan-500/20">
              <h5 className="text-cyan-400 text-xs font-semibold mb-1">Transcript:</h5>
              <p className="text-gray-200 text-xs leading-relaxed max-h-20 overflow-y-auto">{subtitles}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AudioPlayer;