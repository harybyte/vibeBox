// import * as FB from './firebase.js';

const playlistsPanel = document.getElementById('playlists');
const playlistHeader = playlistsPanel.querySelector('h2');

/**
 * Renders the list of playlists received from Firestore.
 * @param {Array<object>} playlists - Array of playlist objects.
 */
function renderPlaylists(playlists) {
    // Clear existing playlist cards, but keep the header and VibeMe button intact.
    // The VibeMe button is injected at the beginning of the panel in main.js.
    
    // Find all existing playlist-card elements and remove them
    const existingCards = playlistsPanel.querySelectorAll('.playlist-card');
    existingCards.forEach(card => card.remove());

    if (!playlists || playlists.length === 0) {
        playlistsPanel.insertAdjacentHTML('beforeend', 
            '<p class="vb-msg" style="color: var(--muted); margin-top: 10px;">No playlists found. Create one!</p>'
        );
        return;
    }

    playlists.forEach(playlist => {
        // Calculate total duration (assuming songs have a duration property in minutes/seconds, 
        // here we use a simplified length)
        const songCount = playlist.songs ? playlist.songs.length : 0;
        const mood = playlist.mood || 'Mixed Vibe';

        const playlistCard = `
            <div class="playlist-card" role="button" tabindex="0" data-playlist-id="${playlist.id}">
                <h4>
                    ${playlist.name} 
                    <i data-lucide="play" style="width: 16px; height: 16px; color: var(--accent-2); float: right;"></i>
                </h4>
                <p>${songCount} songs | Mood: ${mood}</p>
            </div>
        `;
        playlistsPanel.insertAdjacentHTML('beforeend', playlistCard);
    });

    // Re-render Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    console.log(`Playlists rendered: ${playlists.length}`);
}


/**
 * Sets up a real-time listener for the user's playlists in Firestore.
 */
export function listenForPlaylists() {
    const db = FB.getDatabase();
    const userId = FB.getUserId();
    const isReady = FB.getAuthStatus();

    // Do not proceed if Firebase is not authenticated or ready
    if (!isReady || !db || !userId) {
        console.warn("Firestore not ready to listen for playlists.");
        return;
    }

    const collectionPath = FB.getPrivateCollectionPath('playlists');
    if (!collectionPath) return;

    const playlistsColRef = FB.collection(db, collectionPath);
    
    // Use onSnapshot for real-time updates
    FB.onSnapshot(playlistsColRef, (snapshot) => {
        const playlists = [];
        snapshot.forEach(doc => {
            playlists.push({ id: doc.id, ...doc.data() });
        });
        renderPlaylists(playlists);
    }, (error) => {
        console.error("Error listening to playlists:", error);
        // Display user-friendly error message
        playlistsPanel.insertAdjacentHTML('beforeend', `<p class="vb-msg error">Error loading playlists: ${error.message}</p>`);
    });
}

/**
 * DEMO: Saves a sample playlist to the user's private Firestore collection.
 */
export async function createDemoPlaylist() {
    const db = FB.getDatabase();
    const userId = FB.getUserId();
    
    if (!db || !userId) {
        console.error("Cannot create playlist: Firebase not ready.");
        return;
    }
    
    // The collection path will be: artifacts/{appId}/users/{userId}/playlists
    const collectionPath = FB.getPrivateCollectionPath('playlists');

    // Create a new document ID manually for easy referencing, or use a randomized one (setDoc requires an ID)
    const playlistId = `demo_vibe_${Date.now()}`;
    const playlistRef = FB.doc(db, collectionPath, playlistId);

    const demoPlaylistData = {
        name: "My First Vibe Mix",
        mood: "Chill",
        createdAt: new Date().toISOString(),
        songs: [ // Array of song objects to demonstrate complex data structure
            { videoId: 'QH2-TGUlwu4', title: 'Vibe Box Theme', artist: 'Default Artist' },
            { videoId: 'sV_tG9WnU0k', title: 'Acoustic Calm', artist: 'Indie Sound' },
            { videoId: 'hTWz-rM4-4Y', title: 'Focus Flow', artist: 'Study Beats' },
        ]
    };
    
    try {
        await FB.setDoc(playlistRef, demoPlaylistData);
        console.log("Demo playlist saved successfully with ID:", playlistId);
        // No need to manually update UI, onSnapshot will handle it.
    } catch (error) {
        console.error("Error saving demo playlist:", error);
    }
}