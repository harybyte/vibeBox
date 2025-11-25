// API Configuration
const API_BASE_URL = 'https://vibebox-backend-oadg821tt-barnwals-projects.vercel.app/api';

// Audio player instance
let audioPlayer = null;
let currentTrackData = null;

/**
 * Initialize the HTML5 audio player
 */
export function initializePlayer(onReadyCallback, onStateChangeCallback, onTimeUpdateCallback) {
    console.log('[API] Initializing HTML5 audio player...');

    audioPlayer = document.createElement('audio');
    audioPlayer.id = 'vibebox-player';
    audioPlayer.preload = 'metadata';

    // Event listeners
    audioPlayer.addEventListener('loadeddata', () => {
        console.log('[API] Audio loaded and ready');
        if (onReadyCallback) onReadyCallback({ target: audioPlayer });
    });

    audioPlayer.addEventListener('play', () => {
        console.log('[API] Playback started');
        if (onStateChangeCallback) onStateChangeCallback({ data: 'PLAYING', target: audioPlayer });
    });

    audioPlayer.addEventListener('pause', () => {
        console.log('[API] Playback paused');
        if (onStateChangeCallback) onStateChangeCallback({ data: 'PAUSED', target: audioPlayer });
    });

    audioPlayer.addEventListener('ended', () => {
        console.log('[API] Track ended');
        if (onStateChangeCallback) onStateChangeCallback({ data: 'ENDED', target: audioPlayer });
    });

    audioPlayer.addEventListener('timeupdate', () => {
        if (onTimeUpdateCallback) {
            onTimeUpdateCallback({
                currentTime: audioPlayer.currentTime,
                duration: audioPlayer.duration || 0
            });
        }
    });

    audioPlayer.addEventListener('error', (e) => {
        console.error('[API] Audio error:', e);
    });

    // Append to body (hidden)
    audioPlayer.style.display = 'none';
    document.body.appendChild(audioPlayer);

    console.log('[API] HTML5 audio player created');
}

/**
 * Load and play a track
 * @param {string} trackId - Track ID
 * @param {object} trackData - Full track data object
 */
export function loadAndPlay(trackId, trackData = null) {
    if (!audioPlayer) {
        console.error("[API] Player not initialized.");
        return;
    }

    console.log(`[API] Loading track: ${trackId}`);
    currentTrackData = trackData;

    if (!trackData || !trackData.audio_url) {
        console.error("[API] No audio URL found for track");
        return;
    }

    audioPlayer.src = trackData.audio_url;
    audioPlayer.load();
    audioPlayer.play().catch(err => {
        console.error('[API] Playback failed:', err);
    });
}

/**
 * Toggle play/pause state
 */
export function togglePlayPause() {
    console.log('[API] togglePlayPause called');

    if (!audioPlayer) {
        console.error('[API] Player not initialized!');
        return;
    }

    if (audioPlayer.paused) {
        console.log('[API] Playing audio...');
        audioPlayer.play().catch(err => console.error('[API] Play error:', err));
    } else {
        console.log('[API] Pausing audio...');
        audioPlayer.pause();
    }
}

/**
 * Get current playback state
 * @returns {string} Current state
 */
export function getPlayerState() {
    if (!audioPlayer) return 'UNSTARTED';
    if (audioPlayer.ended) return 'ENDED';
    if (!audioPlayer.paused) return 'PLAYING';
    if (audioPlayer.paused && audioPlayer.currentTime > 0) return 'PAUSED';
    return 'UNSTARTED';
}

/**
 * Search for tracks (via Backend)
 * @param {string} query - Search query
 * @param {number} limit - Number of results
 * @returns {Promise<Array>} Array of track objects
 */
export async function searchTracks(query, limit = 10) {
    try {
        const response = await fetch(`${API_BASE_URL}/search?q=${encodeURIComponent(query)}`);
        if (!response.ok) return [];
        return await response.json();
    } catch (error) {
        console.error('[API] Search error:', error);
        return [];
    }
}

/**
 * Get tracks by tag/mood (via Backend)
 * @param {string} tag - Genre or mood tag
 * @param {number} limit - Number of results
 * @returns {Promise<Array>} Array of track objects
 */
export async function getTracksByTag(tag, limit = 10) {
    try {
        const response = await fetch(`${API_BASE_URL}/tracks/mood/${encodeURIComponent(tag)}`);
        if (!response.ok) return [];
        return await response.json();
    } catch (error) {
        console.error('[API] Tag search error:', error);
        return [];
    }
}

/**
 * Get popular tracks (via Backend)
 * @param {number} limit - Number of results
 * @returns {Promise<Array>} Array of track objects
 */
export async function getPopularTracks(limit = 10) {
    try {
        const response = await fetch(`${API_BASE_URL}/tracks/popular?limit=${limit}`);
        if (!response.ok) return [];
        return await response.json();
    } catch (error) {
        console.error('[API] Popular tracks error:', error);
        return [];
    }
}

/**
 * Get current track duration
 * @returns {number} Duration in seconds
 */
export function getDuration() {
    return audioPlayer ? audioPlayer.duration : 0;
}

/**
 * Get current playback time
 * @returns {number} Current time in seconds
 */
export function getCurrentTime() {
    return audioPlayer ? audioPlayer.currentTime : 0;
}

/**
 * Seek to specific time
 * @param {number} time - Time in seconds
 */
export function seekTo(time) {
    if (audioPlayer) {
        audioPlayer.currentTime = time;
    }
}

/**
 * Set volume
 * @param {number} volume - Volume level (0-1)
 */
export function setVolume(volume) {
    if (audioPlayer) {
        audioPlayer.volume = Math.max(0, Math.min(1, volume));
    }
}

/**
 * Get volume
 * @returns {number} Current volume (0-1)
 */
export function getVolume() {
    return audioPlayer ? audioPlayer.volume : 1;
}