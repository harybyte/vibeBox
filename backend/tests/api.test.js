// ========================================
// BASIC API TESTS FOR BEGINNERS
// ========================================
// This file contains simple tests to check if our API works correctly.
// Each test checks ONE thing - this makes debugging easier!

// Import the tools we need for testing
const request = require('supertest'); // Helps us make HTTP requests in tests

// We don't start a real server - we'll test by importing the app directly
// But for now, we'll test against the running server on localhost:3000

const baseURL = 'http://localhost:3000';

// ========================================
// TEST: Search for songs
// ========================================
describe('🔍 Search API', () => {
    // This test checks if we can search for songs
    test('Should return songs when searching for "Hindi"', async () => {
        // Step 1: Make a request to the search endpoint
        const response = await request(baseURL)
            .get('/api/search?q=Hindi')  // Search for "Hindi" songs
            .expect(200);  // We expect a 200 OK status

        // Step 2: Check if we got an array of results
        expect(Array.isArray(response.body)).toBe(true);

        // Step 3: Check if we got at least some results
        expect(response.body.length).toBeGreaterThan(0);

        // Step 4: Check if each song has the required fields
        const firstSong = response.body[0];
        expect(firstSong).toHaveProperty('title');
        expect(firstSong).toHaveProperty('artist');
        expect(firstSong).toHaveProperty('audio_url');
        expect(firstSong).toHaveProperty('thumbnail');
    });

    // This test checks what happens when we search with no query
    test('Should return empty array when search query is empty', async () => {
        const response = await request(baseURL)
            .get('/api/search?q=')  // Empty search
            .expect(200);

        // We should get an empty array
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBe(0);
    });
});

// ========================================
// TEST: Get popular/trending tracks
// ========================================
describe('🔥 Popular Tracks API', () => {
    // This test checks if we can get popular tracks
    test('Should return a list of popular tracks', async () => {
        const response = await request(baseURL)
            .get('/api/tracks/popular')
            .expect(200);

        // Check if we got an array
        expect(Array.isArray(response.body)).toBe(true);

        // Check if we got some tracks (should be at least 1)
        expect(response.body.length).toBeGreaterThan(0);

        // Check if the first track has all the important info
        const firstTrack = response.body[0];
        expect(firstTrack).toHaveProperty('title');
        expect(firstTrack).toHaveProperty('artist');
        expect(firstTrack).toHaveProperty('duration');
        expect(firstTrack.duration).toBeGreaterThan(0);
    });
});

// ========================================
// TEST: Get tracks by mood
// ========================================
describe('😊 Mood-Based Tracks API', () => {
    // This test checks if we can get "chill" mood tracks
    test('Should return tracks for "chill" mood', async () => {
        const response = await request(baseURL)
            .get('/api/tracks/mood/chill')
            .expect(200);

        // Should return an array
        expect(Array.isArray(response.body)).toBe(true);

        // Should have at least some tracks
        expect(response.body.length).toBeGreaterThan(0);
    });

    // Test another mood
    test('Should return tracks for "happy" mood', async () => {
        const response = await request(baseURL)
            .get('/api/tracks/mood/happy')
            .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
    });

    // Test a mood that might not exist
    test('Should handle unknown mood gracefully', async () => {
        const response = await request(baseURL)
            .get('/api/tracks/mood/supercrazymoodnamehere')
            .expect(200);  // Should still return 200, just with search results

        // Even if mood is unknown, should return an array
        expect(Array.isArray(response.body)).toBe(true);
    });
});

// ========================================
// WHAT DO THESE TESTS DO?
// ========================================
// 
// 1. "describe()" - Groups related tests together
// 2. "test()" or "it()" - Defines a single test case
// 3. "expect()" - Checks if something is true
// 4. "toBe()" - Checks if values are exactly equal
// 5. "toBeGreaterThan()" - Checks if a number is bigger
// 6. "toHaveProperty()" - Checks if an object has a field
//
// HOW TO READ TEST OUTPUT:
// ✓ = Test passed (yay!)
// ✗ = Test failed (need to fix something)
//
// ========================================
// HOW TO RUN THESE TESTS:
// ========================================
// 1. Make sure your server is running (npm start)
// 2. Open a new terminal
// 3. Run: npm test
// 4. Watch the results!
//
// ========================================
