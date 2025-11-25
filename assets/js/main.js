import * as PlayerUI from "./player.js";
import * as API from "./api.js";
import * as Recommender from "./recommendation.js";

// --- Global State Management ---
let currentTrack = {
  trackId: null,
  title: "No Song Playing",
  artist: "Start by searching or selecting a playlist.",
  isPlaying: false,
};

// --- DOM Elements ---
const html = document.documentElement;
const darkModeToggle = document.getElementById("darkModeToggle");
const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("search");
const getVibeBtn = document.getElementById("getVibeBtn");
const weatherConditionEl = document.getElementById("weatherCondition");
const weatherTempEl = document.getElementById("weatherTemp");
const weatherIconEl = document.getElementById("weatherIcon");
const vibeTagEl = document.getElementById("vibeTag");
const vibeSuggestionEl = document.getElementById("vibeSuggestion");

// ----------------------------------------
// Player Callbacks
// ----------------------------------------

function handlePlayerReady(event) {
  console.log("VibeBox Ready: Initializing UI...");

  // Only reset UI if no track is currently selected/playing
  if (!currentTrack.trackId) {
    PlayerUI.updatePlayerUI(false, "VibeBox Ready", "Search for a song or vibe!");
    PlayerUI.updateAlbumCover(
      "https://placehold.co/380x380/222/fff?text=VIBEBOX",
      "VibeBox Theme",
      "Default Artist"
    );
  } else {
    console.log("Player ready for track:", currentTrack.title);
  }
}

function handlePlayerStateChange(event) {
  const isPlaying = event.data === 'PLAYING';
  const isPaused = event.data === 'PAUSED';
  const isEnded = event.data === 'ENDED';

  if (isPlaying || isPaused) {
    PlayerUI.updatePlayerUI(isPlaying, currentTrack.title, currentTrack.artist);
  } else if (isEnded) {
    console.log("Track ended. Moving to next track...");
    // TODO: Implement queue navigation
  }
}

function handleTimeUpdate(event) {
  PlayerUI.updateProgress(event.currentTime, event.duration);
}

// ----------------------------------------
// Navigation Placeholders
// ----------------------------------------

function handleNextTrack() {
  console.log("Next track logic executed.");
  // TODO: Implement actual queue navigation
}

function handlePreviousTrack() {
  console.log("Previous track logic executed.");
  // TODO: Implement actual queue navigation
}

// ----------------------------------------
// Weather & Vibe Recommendation
// ----------------------------------------

const weatherIconMap = {
  0: 'sun',           // Clear
  1: 'cloud-sun',     // Mainly clear
  2: 'cloud',         // Partly cloudy
  3: 'cloud',         // Overcast
  45: 'cloud-fog',    // Foggy
  48: 'cloud-fog',    // Depositing fog
  51: 'cloud-drizzle',// Drizzle
  61: 'cloud-rain',   // Rain
  71: 'cloud-snow',   // Snow
  80: 'cloud-rain',   // Rain showers
  95: 'cloud-lightning' // Thunderstorm
};

function getWeatherIcon(weatherCode) {
  const iconName = weatherIconMap[weatherCode] || 'cloud';
  return `<i data-lucide="${iconName}" style="width: 32px; height: 32px;"></i>`;
}

async function handleGetVibe() {
  console.log('[Main] ===== GET VIBE BUTTON CLICKED =====');

  // Disable button and show loading state
  getVibeBtn.disabled = true;
  getVibeBtn.innerHTML = '<i data-lucide="loader" style="width: 18px; height: 18px; animation: spin 1s linear infinite;"></i> Loading...';

  // Re-render icons for the loader
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  try {
    console.log('[Main] Step 1: Calling getRecommendedVibeTag...');
    const recommendation = await Recommender.getRecommendedVibeTag();
    console.log('[Main] Step 2: Recommendation received:', recommendation);

    // Validate recommendation data
    if (!recommendation || !recommendation.weather || !recommendation.vibe) {
      throw new Error('Invalid recommendation data received');
    }

    // Update weather display
    console.log('[Main] Step 3: Updating weather display...');
    weatherConditionEl.textContent = recommendation.weather;
    weatherTempEl.textContent = `${recommendation.temperature} °C`;
    weatherIconEl.innerHTML = getWeatherIcon(recommendation.weather_code || 0);

    // Show vibe tag with animation
    console.log('[Main] Step 4: Showing vibe suggestion...');
    vibeSuggestionEl.textContent = `✨ ${recommendation.vibe}`;
    vibeTagEl.style.display = 'block';

    // Re-render Lucide icons
    if (typeof lucide !== 'undefined') {
      console.log('[Main] Step 5: Re-rendering Lucide icons...');
      lucide.createIcons();
    }

    console.log(`[Main] Step 6: Vibe display complete: ${recommendation.vibe}`);

    // Automatically search for tracks matching the vibe
    console.log('[Main] Step 7: Searching for vibe tracks...');
    await searchByVibe(recommendation.vibe);

    console.log('[Main] ===== GET VIBE COMPLETE =====');

  } catch (error) {
    console.error('[Main] ===== GET VIBE ERROR =====');
    console.error('[Main] Error type:', error.name);
    console.error('[Main] Error message:', error.message);
    console.error('[Main] Error stack:', error.stack);

    // Show error to user
    vibeSuggestionEl.textContent = `⚠️ Error: ${error.message || 'Could not get recommendation. Try again!'}`;
    vibeTagEl.style.display = 'block';

    // Re-render icons
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  } finally {
    console.log('[Main] Step 8: Re-enabling button...');
    getVibeBtn.disabled = false;
    getVibeBtn.innerHTML = '<i data-lucide="music" style="width: 18px; height: 18px;"></i> Get Vibe';

    // Re-render icons
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }

    console.log('[Main] ===== GET VIBE HANDLER COMPLETE =====');
  }
}

async function searchByVibe(vibe) {
  console.log(`[Main] Searching for vibe: ${vibe}`);
  const resultsContainer = document.getElementById("vb_results");
  resultsContainer.innerHTML = `<div class="vb-msg">Finding tracks for "${vibe}"...</div>`;

  // Extract mood/tag from vibe suggestion
  const mood = extractMoodFromVibe(vibe);

  try {
    console.log(`[Main] Searching for vibe tracks: ${mood}`);
    const tracks = await API.getTracksByTag(mood);

    if (tracks.length > 0) {
      displaySearchResults(tracks);
    } else {
      resultsContainer.innerHTML = `<div class="vb-msg">No tracks found for "${vibe}". Try searching manually!</div>`;
    }
  } catch (error) {
    console.error('[Main] Error fetching vibe tracks:', error);
    resultsContainer.innerHTML = `<div class="vb-msg">Error loading tracks. Try again!</div>`;
  }
}

function extractMoodFromVibe(vibe) {
  const vibeToMood = {
    'chill': 'chill',
    'relax': 'relaxing',
    'happy': 'happy',
    'energy': 'energetic',
    'sad': 'sad',
    'focus': 'focus',
    'workout': 'workout',
    'party': 'party',
    'romantic': 'romantic',
    'sleep': 'sleep',
    'calm': 'relaxing',
    'upbeat': 'happy',
    'mellow': 'chill'
  };

  const lowerVibe = vibe.toLowerCase();
  for (const [key, mood] of Object.entries(vibeToMood)) {
    if (lowerVibe.includes(key)) {
      return mood;
    }
  }

  return 'chill'; // default fallback
}

// ----------------------------------------
// Search Functionality
// ----------------------------------------

async function handleSearch(e) {
  e.preventDefault();
  const query = searchInput.value.trim();
  if (!query) return;

  console.log(`Searching for: ${query}`);

  const resultsContainer = document.getElementById("vb_results");
  resultsContainer.innerHTML = `<div class="vb-msg">Searching for "${query}"...</div>`;

  try {
    const tracks = await API.searchTracks(query);

    if (!tracks || tracks.length === 0) {
      resultsContainer.innerHTML = `<div class="vb-msg">No results found for "${query}". Try another search!</div>`;
      return;
    }

    displaySearchResults(tracks);
  } catch (error) {
    console.error('[Main] Search error:', error);
    resultsContainer.innerHTML = `<div class="vb-msg">Error searching. Please try again!</div>`;
  }

  searchInput.value = "";
}

function displaySearchResults(tracks) {
  const resultsContainer = document.getElementById("vb_results");
  resultsContainer.innerHTML = "";

  tracks.forEach((track) => {
    const card = document.createElement("div");
    card.className = "vb-result-card";

    const thumbnail = track.thumbnail || "https://placehold.co/200x200/222/fff?text=Music";
    const title = track.title || "Unknown Title";
    const artist = track.artist || "Unknown Artist";
    const duration = formatDuration(track.duration || 0);

    card.innerHTML = `
      <img src="${thumbnail}" alt="${title}" style="width: 100%; height: 140px; object-fit: cover; border-radius: 8px; margin-bottom: 8px;" />
      <div style="font-weight: 600; margin: 8px 0 4px 0;">${title}</div>
      <div style="opacity: 0.9; font-size: 0.9rem; margin-bottom: 4px;">${artist}</div>
      <div style="opacity: 0.7; font-size: 0.85rem; margin-bottom: 8px;">${duration}</div>
      <div style="display: flex; gap: 8px;">
        <button class="play-btn" data-track-id="${track.api_song_id}" style="flex: 1; padding: 6px; border: none; border-radius: 6px; background: rgba(255,255,255,0.06); color: white; cursor: pointer;">Play</button>
        <button class="add-btn" data-song='${JSON.stringify(track)}' style="flex: 1; padding: 6px; border: none; border-radius: 6px; background: rgba(255,255,255,0.06); color: white; cursor: pointer;">Add</button>
      </div>
    `;

    // Play button handler
    card.querySelector(".play-btn").addEventListener("click", (e) => {
      e.preventDefault();
      const trackId = e.target.getAttribute("data-track-id");
      console.log(`[Search] Play clicked for: ${title} (${trackId})`);

      currentTrack.trackId = trackId;
      currentTrack.title = title;
      currentTrack.artist = artist;

      console.log(`[Search] Loading and playing: ${title}`);
      API.loadAndPlay(trackId, track);
      PlayerUI.updatePlayerUI(true, title, artist);
      PlayerUI.updateAlbumCover(thumbnail, title, artist);
    });

    // Add button handler
    card.querySelector(".add-btn").addEventListener("click", async (e) => {
      e.preventDefault();
      console.log(`[Search] Add clicked for: ${title}`);

      try {
        const response = await fetch('/api/playlists', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: 'current_user',
            name: `${title} by ${artist}`,
            mood: 'Added Songs',
            songs: [track]
          })
        });

        if (response.ok) {
          const result = await response.json();
          console.log(`[Search] Song added to playlist with ID: ${result.id}`);
          alert(`✓ Added "${title}" to playlist!`);
        } else {
          console.error('[Search] Failed to add song');
          alert('Failed to add song');
        }
      } catch (error) {
        console.error('[Search] Error adding song:', error);
        alert('Error adding song');
      }
    });

    resultsContainer.appendChild(card);
  });
}

function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// ----------------------------------------
// Load Popular Tracks on Startup
// ----------------------------------------

async function loadPopularTracks() {
  const resultsContainer = document.getElementById("vb_results");
  resultsContainer.innerHTML = `<div class="vb-msg">Loading popular tracks...</div>`;

  try {
    const tracks = await API.getPopularTracks(12);

    if (tracks.length > 0) {
      displaySearchResults(tracks);
    } else {
      resultsContainer.innerHTML = `<div class="vb-msg">Search for a song, artist, or mood to start your VibeBox experience!</div>`;
    }
  } catch (error) {
    console.error('[Main] Error loading popular tracks:', error);
    resultsContainer.innerHTML = `<div class="vb-msg">Search for a song, artist, or mood to start your VibeBox experience!</div>`;
  }
}

// ----------------------------------------
// Initialization
// ----------------------------------------

document.addEventListener("DOMContentLoaded", () => {
  console.log('[Main] DOM Content Loaded');

  // Initialize audio player (no YouTube API needed)
  API.initializePlayer(handlePlayerReady, handlePlayerStateChange, handleTimeUpdate);

  // Theme Toggle
  if (darkModeToggle.checked) {
    html.setAttribute("data-theme", "dark");
  } else {
    html.setAttribute("data-theme", "light");
  }
  darkModeToggle.addEventListener("change", (e) => {
    html.setAttribute("data-theme", e.target.checked ? "dark" : "light");
  });

  // Setup Player Control Listeners
  console.log('[Main] Setting up player listeners');
  PlayerUI.setupPlayerListeners(handleNextTrack, handlePreviousTrack);

  // Setup Search Form
  searchForm.addEventListener("submit", handleSearch);

  // Setup Weather Vibe Button
  getVibeBtn.addEventListener("click", handleGetVibe);

  // Load popular tracks on startup
  loadPopularTracks();
});