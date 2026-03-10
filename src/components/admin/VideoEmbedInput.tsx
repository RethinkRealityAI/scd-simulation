import React, { useState, useEffect, useRef } from 'react';
import { Upload, Link, Play, X, CheckCircle2, AlertCircle, Globe, Film } from 'lucide-react';
import { parseVideoUrl, getPlatformLabel, getPlatformColor, ParsedVideo } from '../../utils/videoEmbedUtils';

export type VideoSourceType = 'upload' | 'stream';

export interface VideoEmbedValue {
    sourceType: VideoSourceType;
    /** For upload: the File object; for stream: null */
    file?: File | null;
    /** For stream: the original URL entered by the user */
    streamUrl?: string;
    /** The parsed embed info (null until a valid stream URL is detected) */
    parsed?: ParsedVideo | null;
    /** Title field */
    title: string;
    /** Description field */
    description: string;
}

interface VideoEmbedInputProps {
    value: VideoEmbedValue;
    onChange: (value: VideoEmbedValue) => void;
    /** If there's an existing video URL already saved */
    existingVideoUrl?: string;
    existingPosterUrl?: string;
    /** Scene ID context for display */
    sceneId?: string;
    /** Whether upload is in progress */
    uploading?: boolean;
    /** Compact mode for use inside modals */
    compact?: boolean;
}

const VideoEmbedInput: React.FC<VideoEmbedInputProps> = ({
    value,
    onChange,
    existingVideoUrl,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    existingPosterUrl: _existingPosterUrl,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    sceneId: _sceneId,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    uploading: _uploading = false,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    compact: _compact = false,
}) => {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const hasExistingUploadVideo = value.sourceType === 'upload' && !!existingVideoUrl && !value.file;

    // Create preview URL for uploaded files
    useEffect(() => {
        if (value.file) {
            const url = URL.createObjectURL(value.file);
            setPreviewUrl(url);
            return () => URL.revokeObjectURL(url);
        } else {
            setPreviewUrl(null);
        }
    }, [value.file]);

    const handleSourceTypeChange = (type: VideoSourceType) => {
        onChange({
            ...value,
            sourceType: type,
            file: null,
            streamUrl: '',
            parsed: null,
        });
    };

    const handleFileChange = (file: File | null) => {
        onChange({
            ...value,
            file,
            streamUrl: '',
            parsed: null,
        });
    };

    const handleStreamUrlChange = (url: string) => {
        const parsed = parseVideoUrl(url);
        onChange({
            ...value,
            streamUrl: url,
            parsed,
            file: null,
        });
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile && droppedFile.type.startsWith('video/')) {
            handleSourceTypeChange('upload');
            handleFileChange(droppedFile);
        }
    };

    const parsedVideo = value.parsed;

    return (
        <div className="space-y-4">
            {/* Source Type Toggle */}
            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
                <button
                    type="button"
                    onClick={() => handleSourceTypeChange('upload')}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${value.sourceType === 'upload'
                        ? 'bg-white text-blue-700 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <Upload className="w-4 h-4" />
                    Upload Video
                </button>
                <button
                    type="button"
                    onClick={() => handleSourceTypeChange('stream')}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${value.sourceType === 'stream'
                        ? 'bg-white text-purple-700 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <Globe className="w-4 h-4" />
                    Stream / Embed URL
                </button>
            </div>

            {/* Upload Mode */}
            {value.sourceType === 'upload' && (
                <div className="space-y-3">
                    {/* Drop Zone */}
                    <div
                        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${dragOver
                            ? 'border-blue-400 bg-blue-50'
                            : value.file
                                ? 'border-green-300 bg-green-50'
                                : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                            }`}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="video/*"
                            onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                            className="hidden"
                        />

                        {value.file ? (
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                                </div>
                                <div className="flex-1 text-left min-w-0">
                                    <p className="text-sm font-semibold text-gray-900 truncate">{value.file.name}</p>
                                    <p className="text-xs text-gray-500">
                                        {(value.file.size / 1024 / 1024).toFixed(2)} MB • Click to change
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); handleFileChange(null); }}
                                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ) : hasExistingUploadVideo ? (
                            <div>
                                <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
                                <p className="text-sm font-medium text-gray-700">
                                    Current saved video is attached
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    Drop a new file here or browse only if you want to replace it
                                </p>
                            </div>
                        ) : (
                            <div>
                                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                <p className="text-sm font-medium text-gray-700">
                                    Drop a video file here or <span className="text-blue-600">browse</span>
                                </p>
                                <p className="text-xs text-gray-500 mt-1">MP4, WebM, MOV — Max 50MB</p>
                            </div>
                        )}
                    </div>

                    {/* File Preview */}
                    {previewUrl && (
                        <div className="bg-black rounded-lg overflow-hidden aspect-video">
                            <video controls className="w-full h-full" src={previewUrl} />
                        </div>
                    )}

                    {!previewUrl && hasExistingUploadVideo && existingVideoUrl && (
                        <div className="rounded-lg border border-gray-200 overflow-hidden bg-black">
                            <div className="aspect-video">
                                <video controls className="w-full h-full" src={existingVideoUrl} />
                            </div>
                            <div className="p-3 bg-gray-50 border-t border-gray-200">
                                <p className="text-sm font-medium text-gray-800">Current saved video</p>
                                <p className="text-xs text-gray-500 mt-1">
                                    Upload a new file only if you want to replace this saved video.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Stream Mode */}
            {value.sourceType === 'stream' && (
                <div className="space-y-3">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Video URL
                            <span className="text-xs text-gray-400 ml-2 font-normal">YouTube, Vimeo, or direct link</span>
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Link className="w-4 h-4 text-gray-400" />
                            </div>
                            <input
                                type="url"
                                value={value.streamUrl || ''}
                                onChange={(e) => handleStreamUrlChange(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm transition-colors"
                                placeholder="https://www.youtube.com/watch?v=..."
                            />
                        </div>
                    </div>

                    {/* Platform Detection Badge */}
                    {parsedVideo && (
                        <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${getPlatformColor(parsedVideo.platform)}`}>
                                {parsedVideo.platform === 'youtube' && <Film className="w-3 h-3" />}
                                {parsedVideo.platform === 'vimeo' && <Play className="w-3 h-3" />}
                                {parsedVideo.platform === 'direct' && <Film className="w-3 h-3" />}
                                {parsedVideo.platform === 'iframe' && <Globe className="w-3 h-3" />}
                                {getPlatformLabel(parsedVideo.platform)} Detected
                            </span>
                            {parsedVideo.videoId && (
                                <span className="text-xs text-gray-400 font-mono">ID: {parsedVideo.videoId}</span>
                            )}
                        </div>
                    )}

                    {/* Stream Preview */}
                    {parsedVideo && (
                        <div className="rounded-xl overflow-hidden border-2 border-gray-200 bg-black aspect-video">
                            {parsedVideo.platform === 'direct' ? (
                                <video controls className="w-full h-full" src={parsedVideo.embedUrl} />
                            ) : (
                                <iframe
                                    src={parsedVideo.embedUrl}
                                    className="w-full h-full"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    title="Video preview"
                                />
                            )}
                        </div>
                    )}

                    {/* Hint for no URL */}
                    {!value.streamUrl && (
                        <div className="flex items-start gap-2 p-3 bg-purple-50 border border-purple-100 rounded-lg">
                            <AlertCircle className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                            <div className="text-xs text-purple-700">
                                <p className="font-semibold mb-1">Supported platforms:</p>
                                <ul className="list-disc list-inside space-y-0.5">
                                    <li>YouTube (youtube.com, youtu.be)</li>
                                    <li>Vimeo (vimeo.com)</li>
                                    <li>Direct video links (.mp4, .webm, .mov)</li>
                                    <li>Any embeddable URL (via iframe)</li>
                                </ul>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Existing Video Indicator */}
            {existingVideoUrl && !value.file && !value.streamUrl && value.sourceType !== 'upload' && (
                <div className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <Play className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                        Current video: <span className="font-mono text-xs truncate">{existingVideoUrl.split('/').pop()}</span>
                    </span>
                </div>
            )}
        </div>
    );
};

export default VideoEmbedInput;
