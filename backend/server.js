import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import { query, initializeDatabaseSchema } from './db/connection.js';
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
const PORT = process.env.PORT || 3000;

// Saavn API Configuration
const SAAVN_BASE_URL = 'https://saavn.sumit.co/api';

// Configure axios with custom timeouts
const axiosInstance = axios.create({
    timeout: 30000,  // 30 seconds timeout
    headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; VibeBox/1.0)'
    }
});

/**
 * Helper: Fetch with timeout and retry logic using axios
 */
async function fetchWithRetry(url, options = {}) {
    const maxRetries = 3;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const response = await axiosInstance.get(url);

            // Convert axios response to fetch-like response object
            return {
                ok: response.status >= 200 && response.status < 300,
                status: response.status,
                json: async () => response.data
            };

        } catch (error) {
            console.error(`[Fetch] Attempt ${attempt}/${maxRetries} failed for ${url}:`, error.message);

            // If this was the last attempt, throw the error
            if (attempt === maxRetries) {
                throw error;
            }

            // Wait before retrying (exponential backoff)
            const waitTime = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
            console.log(`[Fetch] Retrying in ${waitTime}ms...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }
    }
}

/**
 * Helper: Map Saavn track to VibeBox format
 */
function mapSaavnTrack(track) {
    // Get highest quality image
    const image = track.image && track.image.length > 0
        ? track.image[track.image.length - 1].url
        : 'https://placehold.co/200x200/222/fff?text=Music';

    // Get highest quality audio (usually last in array)
    const audio = track.downloadUrl && track.downloadUrl.length > 0
        ? track.downloadUrl[track.downloadUrl.length - 1].url
        : null;

    return {
        api_song_id: track.id,
        title: track.name, // Saavn uses 'name'
        artist: track.primaryArtists || track.artist || "Unknown Artist",
        album: track.album ? track.album.name : "Unknown Album",
        duration: parseInt(track.duration) || 0,
        thumbnail: image,
        audio_url: audio,
        license: "Standard", // Saavn doesn't provide CC license info
        releasedate: track.year || ""
    };
}

/**
 * Search tracks (Saavn)
 */
app.get('/api/search', async (req, res) => {
    const searchQuery = (req.query.q || '').trim();

    if (!searchQuery) {
        return res.json([]);
    }

    try {
        // Search for songs (append 'hindi' if not present to bias towards hindi, optional)
        const url = `${SAAVN_BASE_URL}/search/songs?query=${encodeURIComponent(searchQuery)}&page=1&limit=20`;
        console.log(`[Search] Calling: ${url}`);

        const response = await fetchWithRetry(url);

        if (!response.ok) {
            console.error('[Search] Saavn API error:', response.status);
            return res.status(response.status).json({ error: 'Search failed' });
        }

        const data = await response.json();

        if (!data.success || !data.data || !data.data.results) {
            return res.json([]);
        }

        const tracks = data.data.results.map(mapSaavnTrack).filter(t => t.audio_url);

        console.log(`[Search] Query: "${searchQuery}" → Found ${tracks.length} results`);
        res.json(tracks);

    } catch (error) {
        console.error('[Search] Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * Get tracks by mood/tag (Saavn - via Search)
 */
app.get('/api/tracks/mood/:mood', async (req, res) => {
    const mood = req.params.mood.toLowerCase();

    // Map mood to a search query suitable for Hindi context
    const moodToQuery = {
        'chill': 'lofi hindi',
        'relaxing': 'relaxing bollywood',
        'happy': 'happy bollywood',
        'energetic': 'party hindi',
        'sad': 'sad hindi songs',
        'focus': 'instrumental hindi',
        'workout': 'workout hindi',
        'party': 'bollywood dance',
        'romantic': 'romantic hindi',
        'sleep': 'slow hindi songs',
        'cozy': 'acoustic hindi',
        'uplifting': 'motivational hindi',
        'epic': 'epic bollywood',
        'peaceful': 'sufi songs',
        'mellow': 'soft bollywood'
    };

    const query = moodToQuery[mood] || `${mood} hindi songs`;

    try {
        const url = `${SAAVN_BASE_URL}/search/songs?query=${encodeURIComponent(query)}&page=1&limit=20`;
        console.log(`[Mood] Calling: ${url}`);

        const response = await fetchWithRetry(url);

        if (!response.ok) {
            return res.status(response.status).json({ error: 'Mood search failed' });
        }

        const data = await response.json();

        if (!data.success || !data.data || !data.data.results) {
            return res.json([]);
        }

        const tracks = data.data.results.map(mapSaavnTrack).filter(t => t.audio_url);

        console.log(`[Mood] Mood: "${mood}" (Query: "${query}") → Found ${tracks.length} results`);
        res.json(tracks);

    } catch (error) {
        console.error('[Mood] Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * Get popular/top tracks (Saavn - via Search for 'Top 50')
 */
app.get('/api/tracks/popular', async (req, res) => {
    try {
        // Search for "Trending Hindi" or "Top 50 Hindi"
        const url = `${SAAVN_BASE_URL}/search/songs?query=Trending%20Hindi&page=1&limit=20`;
        console.log(`[Popular] Calling: ${url}`);

        const response = await fetchWithRetry(url);

        if (!response.ok) {
            return res.status(response.status).json({ error: 'Popular tracks fetch failed' });
        }

        const data = await response.json();

        if (!data.success || !data.data || !data.data.results) {
            return res.json([]);
        }

        const tracks = data.data.results.map(mapSaavnTrack).filter(t => t.audio_url);

        console.log(`[Popular] Found ${tracks.length} popular tracks`);
        res.json(tracks);

    } catch (error) {
        console.error('[Popular] Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * Get track details
 */
app.get('/api/track/:trackId', async (req, res) => {
    const trackId = req.params.trackId;

    try {
        const url = `${SAAVN_BASE_URL}/songs?ids=${trackId}`;

        const response = await fetchWithRetry(url);

        if (!response.ok) {
            return res.status(response.status).json({ error: 'Track fetch failed' });
        }

        const data = await response.json();

        if (!data.success || !data.data || data.data.length === 0) {
            return res.status(404).json({ error: 'Track not found' });
        }

        const track = mapSaavnTrack(data.data[0]);
        res.json(track);

    } catch (error) {
        console.error('[Track] Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// --- Playlist Management Endpoints ---

app.get('/api/playlists/:userId', async (req, res) => {
    const { userId } = req.params;

    const sql = 'SELECT * FROM playlists WHERE user_id = ? ORDER BY created_at DESC';

    try {
        const playlists = await query(sql, [userId]);
        res.json(playlists);
    } catch (error) {
        console.error("Error fetching playlists:", error);
        res.status(500).json({ message: 'Failed to retrieve playlists from database.' });
    }
});

app.post('/api/playlists', async (req, res) => {
    const { userId, name, mood, songs } = req.body;

    if (!userId || !name) {
        return res.status(400).json({ message: 'Missing user ID or playlist name.' });
    }

    const songsJson = JSON.stringify(songs || []);

    const sql = 'INSERT INTO playlists (user_id, name, mood, songs_json) VALUES (?, ?, ?, ?)';

    try {
        const result = await query(sql, [userId, name, mood || 'Mixed', songsJson]);
        res.status(201).json({
            id: result.insertId,
            message: 'Playlist created successfully.'
        });
    } catch (error) {
        console.error("Error creating playlist:", error);
        res.status(500).json({ message: 'Failed to create playlist in database.' });
    }
});

app.delete('/api/playlists/:playlistId', async (req, res) => {
    const { playlistId } = req.params;

    const sql = 'DELETE FROM playlists WHERE id = ?';

    try {
        const result = await query(sql, [playlistId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Playlist not found' });
        }

        res.json({ message: 'Playlist deleted successfully' });
    } catch (error) {
        console.error("Error deleting playlist:", error);
        res.status(500).json({ message: 'Failed to delete playlist' });
    }
});

// Serve static files from the root directory AFTER API routes
const frontendPath = path.join(__dirname, '..');
app.use(express.static(frontendPath));

// Fallback for root URL if index.html is not found (or for API-only deployment)
app.get('/', (req, res) => {
    res.json({
        message: "VibeBox Backend is running",
        endpoints: {
            search: "/api/search?q=song",
            popular: "/api/tracks/popular",
            mood: "/api/tracks/mood/happy"
        },
        frontend: "If you are looking for the app, please visit the frontend URL."
    });
});

// --- Initialize Database Schema ---
// We await this but don't let it crash the server if it fails
try {
    await initializeDatabaseSchema();
} catch (err) {
    console.warn("[Server Warning] Database initialization failed. Continuing without DB features.");
}

// --- Server Start (only for local development) ---
// In Vercel/serverless, we export the app instead of listening
if (process.env.VERCEL !== '1') {
    app.listen(PORT, () => {
        console.log(`\n========================================`);
        console.log(`🚀 Vibebox Backend running on port ${PORT}`);
        console.log(`Access the backend at http://localhost:${PORT}`);
        console.log(`========================================\n`);
    });
}

// Export the app for Vercel serverless deployment
export default app;