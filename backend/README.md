# Backend — lightweight local API (Spotify disabled)

This backend has had its Spotify integration removed. The server exposes simple stub endpoints so the frontend can run locally without contacting Spotify.

If you want to re-enable Spotify in the future, you can restore the integration and add Spotify credentials to `backend/.env` (Client ID, Client Secret, Refresh Token). For now the server returns safe defaults.

## Install and run

From the repository root or `backend/` folder:

```bash
cd backend
npm install
npm start
```

Or run with a specific port:

```bash
PORT=3001 node server.js
```

## Endpoints (stubs)

- `GET /api/search?q=...` — currently returns an empty array []
- `GET /api/spotify/top-tracks` — currently returns an empty array []

These endpoints are intentionally minimal so the frontend won't receive secrets or make external calls.

## Re-enabling Spotify integration

If you want me to re-add Spotify support I can:

- Add secure token handling and refresh logic on the server
- Add a guided helper to obtain a refresh token (OAuth flow)
- Add `.env.example` entries and instructions for keeping secrets out of the repo

Ask me to re-enable it and I will implement it with attention to security and a small test harness.
