/**
 * Video Embed Utilities
 * Parses video URLs from YouTube, Vimeo, and direct sources into embeddable formats.
 */

export type VideoPlatform = 'youtube' | 'vimeo' | 'direct' | 'iframe';

export interface ParsedVideo {
    platform: VideoPlatform;
    videoId?: string;
    embedUrl: string;
    originalUrl: string;
}

/**
 * Extract YouTube video ID from various URL formats.
 * Supports: youtube.com/watch?v=, youtu.be/, youtube.com/embed/, youtube.com/shorts/
 */
function extractYouTubeId(url: string): string | null {
    const patterns = [
        /(?:youtube\.com\/watch\?.*v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    ];
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    return null;
}

/**
 * Extract Vimeo video ID from URL.
 * Supports: vimeo.com/{id}, player.vimeo.com/video/{id}
 */
function extractVimeoId(url: string): string | null {
    const match = url.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)/);
    return match ? match[1] : null;
}

/**
 * Check if a URL points directly to a video file.
 */
export function isDirectVideoUrl(url: string): boolean {
    const videoExtensions = ['.mp4', '.webm', '.mov', '.ogg', '.avi', '.m4v'];
    const lowerUrl = url.toLowerCase().split('?')[0]; // Remove query params
    return videoExtensions.some(ext => lowerUrl.endsWith(ext));
}

/**
 * Generate YouTube embed URL.
 */
export function getYouTubeEmbedUrl(videoId: string): string {
    return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;
}

/**
 * Generate Vimeo embed URL.
 */
export function getVimeoEmbedUrl(videoId: string): string {
    return `https://player.vimeo.com/video/${videoId}?title=0&byline=0&portrait=0`;
}

/**
 * Parse any video URL and return the best embed strategy.
 */
export function parseVideoUrl(url: string): ParsedVideo | null {
    if (!url || !url.trim()) return null;

    const trimmedUrl = url.trim();

    // YouTube
    const youtubeId = extractYouTubeId(trimmedUrl);
    if (youtubeId) {
        return {
            platform: 'youtube',
            videoId: youtubeId,
            embedUrl: getYouTubeEmbedUrl(youtubeId),
            originalUrl: trimmedUrl,
        };
    }

    // Vimeo
    const vimeoId = extractVimeoId(trimmedUrl);
    if (vimeoId) {
        return {
            platform: 'vimeo',
            videoId: vimeoId,
            embedUrl: getVimeoEmbedUrl(vimeoId),
            originalUrl: trimmedUrl,
        };
    }

    // Direct video file
    if (isDirectVideoUrl(trimmedUrl)) {
        return {
            platform: 'direct',
            embedUrl: trimmedUrl,
            originalUrl: trimmedUrl,
        };
    }

    // Fallback: treat as a generic iframe-embeddable URL
    return {
        platform: 'iframe',
        embedUrl: trimmedUrl,
        originalUrl: trimmedUrl,
    };
}

/**
 * Get a user-friendly label for the detected platform.
 */
export function getPlatformLabel(platform: VideoPlatform): string {
    switch (platform) {
        case 'youtube': return 'YouTube';
        case 'vimeo': return 'Vimeo';
        case 'direct': return 'Direct Video';
        case 'iframe': return 'Embedded Link';
    }
}

/**
 * Get a color class for platform badges.
 */
export function getPlatformColor(platform: VideoPlatform): string {
    switch (platform) {
        case 'youtube': return 'bg-red-100 text-red-700';
        case 'vimeo': return 'bg-blue-100 text-blue-700';
        case 'direct': return 'bg-green-100 text-green-700';
        case 'iframe': return 'bg-purple-100 text-purple-700';
    }
}
