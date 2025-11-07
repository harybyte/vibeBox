# **Vibebox 🎵**

Vibebox is a theme-based, web-based music player designed to curate and stream music that matches your vibe. Instead of relying on local files, Vibebox streams directly from the YouTube Music API, providing an endless library of tracks. The core of Vibebox is its smart recommendation system, which suggests songs based on moods, tags, and your listening behavior.

This project is submitted as part of the Bachelor of Computer Application (BCSP-064) program.

* **Author:** Harsh Kumar Barnwal  
* **Supervisor:** Prof. Arshad Usmani

## **🚀 Core Objectives**

* **Stream, Don't Store:** Develop a web player that fetches and streams music on-demand from the YouTube Music API, eliminating the need for local uploads.  
* **Find Your Vibe:** Implement smart tagging and genre-based filtering so users can easily find music that fits their current mood.  
* **Smart Suggestions:** Incorporate an AI-based recommendation engine to suggest songs based on user behavior, listening history, and created playlists.  
* **Responsive & Intuitive:** Design a sleek, responsive user interface that works flawlessly across all devices.  
* **Theme-Based Experience:** Align the platform's design to create an emotional connection and enhance the "vibe" of the music.

## **✨ Features**

* **Dynamic Search:** Instantly search and fetch tracks from the YouTube Music database.  
* **AI Recommendations:** Get personalized song suggestions powered by an AI engine.  
* **Playlist Management:** Create, update, and delete your own custom playlists.  
* **Full Playback Control:** All essential controls, including play, pause, next/previous track, and volume adjustment.  
* **Mood-Based Filtering:** Discover new music by filtering by genre, tags, and mood.

## **💻 Tech Stack**

The project utilizes the following technologies:

* **Frontend:** HTML5, CSS3, JavaScript  
* **Backend:** Node.js  
* **Database:** MySQL  
* **API:** YouTube Music API / YouTube Data API v3  
* **Version Control:** Git & GitHub  
* **Development Tools:** Visual Studio

## **🔧 Project Modules**

The application is broken down into the following key modules:

1. **User Interface (UI):** The interactive frontend that includes the search bar, player controls, and navigation.  
2. **Search and Fetch:** Handles user search queries and communicates with the YouTube API to retrieve song metadata.  
3. **AI Engine (Recommendation):** Recommends songs based on tags, genres, moods, and user play history.  
4. **Playlist Management:** Allows users to create, modify, and delete their playlists.  
5. **Playback Module:** Controls all audio playback, ensuring smooth streaming and responsive controls.

## **🔮 Future Enhancements**

This project lays the foundation for several exciting future developments:

* **Voice Commands:** Integrate voice controls for hands-free searching and playback.  
* **Cloud Storage:** Allow users to save their playlists to the cloud (e.g., using Firebase or MongoDB) and access them from any device.  
* **Mobile App:** Develop a native mobile application using React Native or Kotlin.  
* **Multi-Platform Support:** Integrate other music APIs like Spotify and SoundCloud.  
* **Full User Accounts:** Add user authentication for saved history, preferences, and playlists.

## **🏁 Getting Started**

To get a local copy up and running, follow these steps.

(This is a template; you will need to fill this out as you build the project)

1. **Clone the repo**  
   git clone \[https://github.com/harybyte/vibebox.git\]

2. **Install NPM packages**  
   * Navigate to the backend folder: cd vibebox/backend  
   * Install dependencies: npm install  
3. **Set up Environment Variables**  
   * Create a .env file in the backend directory.  
   * Add your YouTube Data API key: YOUTUBE\_API\_KEY='YOUR\_API\_KEY'  
   * Add your MySQL database credentials.  
4. **Run the server**  
   npm start

5. **Open the application**  
   * Open the index.html file in your browser to view the application.