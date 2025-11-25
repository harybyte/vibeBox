// --- Geolocation Configuration ---
const GEOLOCATION_OPTIONS = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 300000 // Cache for 5 minutes
};

/**
 * Step 1: Fetches the user's current location (latitude and longitude).
 * @returns {Promise<object>} Lat/Lon coordinates.
 */
function getLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            console.warn("Geolocation not supported. Using fallback location.");
            const fallback = { lat: 51.5074, lon: -0.1278 }; // London
            console.log("[Location] Using fallback location (London):", fallback);
            resolve(fallback);
            return;
        }

        console.log('[Location] Requesting geolocation...');
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const coords = {
                    lat: position.coords.latitude,
                    lon: position.coords.longitude,
                };
                console.log('[Location] Got location:', coords);
                resolve(coords);
            },
            (error) => {
                console.warn("[Location] Geolocation Error:", error.message);
                // Fallback: If user denies location, use a default city's lat/lon
                const fallback = { lat: 51.5074, lon: -0.1278 }; // London
                console.log("[Location] Using fallback location (London):", fallback);
                resolve(fallback);
            },
            GEOLOCATION_OPTIONS
        );
    });
}

/**
 * Fetches real weather data from Open-Meteo API (free, no key required).
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Promise<object>} Weather object with condition and temperature
 */
async function fetchWeatherData(lat, lon) {
    try {
        console.log(`[Weather] Fetching weather for lat=${lat}, lon=${lon}`);
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&timezone=auto`;
        console.log(`[Weather] URL: ${url}`);
        
        const response = await fetch(url);
        console.log(`[Weather] Response status: ${response.status}`);
        
        if (!response.ok) {
            throw new Error(`Weather API returned ${response.status}`);
        }
        
        const data = await response.json();
        console.log(`[Weather] Data received:`, data);
        
        const current = data.current;
        
        // Map WMO weather codes to human-readable conditions
        const weatherCodeMap = {
            0: 'Clear',
            1: 'Mainly Clear',
            2: 'Partly Cloudy',
            3: 'Overcast',
            45: 'Foggy',
            48: 'Foggy',
            51: 'Light Drizzle',
            53: 'Moderate Drizzle',
            55: 'Heavy Drizzle',
            61: 'Slight Rain',
            63: 'Moderate Rain',
            65: 'Heavy Rain',
            71: 'Slight Snow',
            73: 'Moderate Snow',
            75: 'Heavy Snow',
            77: 'Snow Grains',
            80: 'Slight Rain Showers',
            81: 'Moderate Rain Showers',
            82: 'Violent Rain Showers',
            85: 'Slight Snow Showers',
            86: 'Heavy Snow Showers',
            95: 'Thunderstorm',
            96: 'Thunderstorm with Hail',
            99: 'Thunderstorm with Hail'
        };
        
        const condition = weatherCodeMap[current.weather_code] || 'Unknown';
        
        console.log(`[Weather] Condition: ${condition}, Temp: ${current.temperature_2m}°C, Code: ${current.weather_code}`);
        
        return {
            condition,
            temperature: Math.round(current.temperature_2m),
            weather_code: current.weather_code
        };
    } catch (error) {
        console.error('[Weather] Error fetching weather:', error);
        // Return fallback weather
        return {
            condition: 'Clear',
            temperature: 20,
            weather_code: 0
        };
    }
}

/**
 * Calls the backend API to get a vibe recommendation based on weather.
 * @param {string} weatherCondition - The current weather (e.g., 'Rain', 'Clear').
 * @param {number} temperature - Current temperature in Celsius
 * @returns {Promise<string>} A musical vibe/genre suggested by AI.
 */
async function getVibeFromBackend(weatherCondition, temperature) {
    try {
        console.log(`[Recommender] Requesting vibe for weather: ${weatherCondition}, temp: ${temperature}°C`);
        
        const response = await fetch('/api/vibe/recommend', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                weather: weatherCondition,
                temperature: temperature
            })
        });

        if (!response.ok) {
            throw new Error(`Vibe API returned ${response.status}`);
        }

        const data = await response.json();
        console.log(`[Recommender] Backend response:`, data);
        
        return data.vibe || 'Happy, Feel-Good Mix';

    } catch (error) {
        console.error('[Recommender] Backend API error:', error);
        // Fallback to simple weather-based logic
        return getFallbackVibe(weatherCondition, temperature);
    }
}

/**
 * Fallback vibe generation based on simple weather logic
 * @param {string} weatherCondition - Weather condition
 * @param {number} temperature - Temperature in Celsius
 * @returns {string} A vibe suggestion
 */
function getFallbackVibe(weatherCondition, temperature) {
    console.log('[Recommender] Using fallback vibe logic');
    
    const condition = weatherCondition.toLowerCase();
    
    // Rainy weather
    if (condition.includes('rain') || condition.includes('drizzle')) {
        return 'Cozy Lo-fi Jazz';
    }
    
    // Stormy weather
    if (condition.includes('thunder') || condition.includes('storm')) {
        return 'Epic Cinematic Rock';
    }
    
    // Snowy weather
    if (condition.includes('snow')) {
        return 'Peaceful Piano & Acoustic';
    }
    
    // Cloudy/Foggy weather
    if (condition.includes('cloud') || condition.includes('fog') || condition.includes('overcast')) {
        return 'Mellow Indie Folk';
    }
    
    // Clear/Sunny weather
    if (condition.includes('clear') || condition.includes('sun')) {
        if (temperature > 25) {
            return 'Upbeat Summer Pop';
        } else if (temperature > 15) {
            return 'Uplifting Indie Pop';
        } else {
            return 'Energetic Electronic';
        }
    }
    
    // Default fallback
    return 'Happy Feel-Good Mix';
}

/**
 * Public export function to generate a recommendation tag.
 * @returns {Promise<object>} Object with weather, vibe, and recommendation phrase
 */
export async function getRecommendedVibeTag() {
    try {
        console.log('[Recommender] Starting recommendation flow...');
        
        // Step 1: Get user location
        const location = await getLocation();
        console.log(`[Recommender] Location obtained: ${location.lat}, ${location.lon}`);
        
        // Step 2: Fetch weather data
        const weather = await fetchWeatherData(location.lat, location.lon);
        console.log(`[Recommender] Weather: ${weather.condition} at ${weather.temperature}°C`);
        
        // Step 3: Get vibe recommendation (try backend, fallback to simple logic)
        let vibe;
        try {
            vibe = await getVibeFromBackend(weather.condition, weather.temperature);
        } catch (error) {
            console.warn('[Recommender] Backend failed, using fallback');
            vibe = getFallbackVibe(weather.condition, weather.temperature);
        }
        
        console.log(`[Recommender] Final Vibe Recommendation: ${vibe}`);
        
        // Return comprehensive data
        return {
            weather: weather.condition,
            temperature: weather.temperature,
            weather_code: weather.weather_code,
            vibe: vibe,
            searchQuery: `${vibe} music playlist`
        };

    } catch (error) {
        console.error("[Recommender] Failed to execute full recommendation flow:", error);
        throw new Error(`Recommendation failed: ${error.message}`);
    }
}