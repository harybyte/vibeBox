import * as API from './api.js';

const PLAY_ICON = '<i data-lucide="play-circle"></i>';
const PAUSE_ICON = '<i data-lucide="pause-circle"></i>';
const currentSongTitleEl = document.getElementById('currentSongTitle');
const currentSongArtistEl = document.getElementById('currentSongArtist');
const albumCoverEl = document.getElementById('albumCover');
const playPauseBtn = document.querySelector('.play-pause_btn');
const nextBtn = document.querySelector('.nxt-btn');
const prevBtn = document.querySelector('.previous-btn');

// Seek Bar Elements
const seekBar = document.getElementById('seekBar');
const currentTimeEl = document.getElementById('currentTime');
const totalDurationEl = document.getElementById('totalDuration');

console.log('[PlayerUI] Player elements loaded:', { playPauseBtn, nextBtn, prevBtn, seekBar });

/**
 * Updates the visual state of the player UI.
 * @param {boolean} isPlaying - True if the song is currently playing.
 * @param {string} title - The song title.
 * @param {string} artist - The song artist.
 */
export function updatePlayerUI(isPlaying, title, artist) {
    currentSongTitleEl.textContent = title;
    currentSongArtistEl.textContent = artist;

    // Update Play/Pause Button Icon and ARIA label
    playPauseBtn.setAttribute('data-is-playing', isPlaying.toString());
    playPauseBtn.setAttribute('aria-label', isPlaying ? 'Pause' : 'Play');
    playPauseBtn.innerHTML = isPlaying ? PAUSE_ICON : PLAY_ICON;

    // Re-render Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

/**
 * Updates the seek bar and time labels.
 * @param {number} currentTime - Current playback time in seconds.
 * @param {number} duration - Total track duration in seconds.
 */
export function updateProgress(currentTime, duration) {
    if (!seekBar || !currentTimeEl || !totalDurationEl) return;

    // Update slider value
    if (duration > 0) {
        seekBar.max = duration;
        seekBar.value = currentTime;

        // Update time labels
        currentTimeEl.textContent = formatTime(currentTime);
        totalDurationEl.textContent = formatTime(duration);

        // Update slider background gradient for progress effect
        const progressPercent = (currentTime / duration) * 100;
        seekBar.style.background = `linear-gradient(to right, var(--accent-primary) ${progressPercent}%, rgba(255, 255, 255, 0.1) ${progressPercent}%)`;
    } else {
        seekBar.value = 0;
        currentTimeEl.textContent = "0:00";
        totalDurationEl.textContent = "0:00";
    }
}

/**
 * Formats seconds into MM:SS string.
 */
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Updates the album cover image.
 * @param {string} imageUrl - Image URL.
 * @param {string} title - Song title for alt text.
 * @param {string} artist - Song artist for alt text.
 */
export function updateAlbumCover(imageUrl, title, artist) {
    console.log('[PlayerUI] updateAlbumCover called with:', { imageUrl, title, artist });
    if (albumCoverEl) {
        console.log('[PlayerUI] Updating src from', albumCoverEl.src, 'to', imageUrl);
        albumCoverEl.src = imageUrl;
        albumCoverEl.alt = `Album cover for ${title} by ${artist}`;
    } else {
        console.error('[PlayerUI] albumCoverEl is missing!');
    }
}

/**
 * Sets up event listeners for player controls.
 */
export function setupPlayerListeners(onNext, onPrev) {
    console.log('[PlayerUI] Setting up player listeners...');

    if (!playPauseBtn) {
        console.error('[PlayerUI] Play/Pause button not found!');
        return;
    }

    playPauseBtn.addEventListener('click', (e) => {
        console.log('[PlayerUI] Play/Pause clicked');
        API.togglePlayPause();
    });

    nextBtn.addEventListener('click', onNext);
    prevBtn.addEventListener('click', onPrev);

    // Seek Bar Listener
    if (seekBar) {
        seekBar.addEventListener('input', (e) => {
            const seekTime = parseFloat(e.target.value);
            API.seekTo(seekTime);
        });
    }

    console.log('[PlayerUI] Player listeners setup complete');
}