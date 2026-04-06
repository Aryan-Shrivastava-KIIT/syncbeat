// ============================================================
//  📁 src/config/spotify.js
//  🔑 PASTE YOUR SPOTIFY CLIENT ID BELOW
// ============================================================
//
//  HOW TO GET YOUR CLIENT ID:
//  1. Go to https://developer.spotify.com/dashboard
//  2. Log in with your Spotify account
//  3. Click "Create App"
//  4. Fill in:
//       App Name: Spotify BeatSync
//       Redirect URI: http://localhost:3000  (for local dev)
//                     https://YOUR-GITHUB-USERNAME.github.io/spotify-beatsync  (for production)
//  5. Copy the "Client ID" and paste it below
//
// ⚠️  NEVER commit a Client Secret here. We use the Implicit Grant
//     flow which only needs the Client ID (safe for frontend code).
// ============================================================

export const SPOTIFY_CLIENT_ID = '345ee47d24cf46ed98ad4fc8c7b1c43a'; // 👈 Replace this

// The URI Spotify redirects back to after the user logs in.
// For local development, use http://localhost:3000
// For GitHub Pages, use https://YOUR_USERNAME.github.io/spotify-beatsync
export const REDIRECT_URI = 'https://syncbeat-psi.vercel.app/'; // 👈 Change for production

// These are the Spotify permission scopes we need:
// - streaming: play music via the Web Playback SDK
// - user-read-email / user-read-private: needed to use the SDK
// - user-modify-playback-state: let the host control playback
// - user-read-playback-state: read what's currently playing
export const SCOPES = [
  'streaming',
  'user-read-email',
  'user-read-private',
  'user-modify-playback-state',
  'user-read-playback-state',
].join(' ');

// Builds the full Spotify login URL
export const getAuthUrl = () => {
  const params = new URLSearchParams({
    client_id: SPOTIFY_CLIENT_ID,
    response_type: 'code',       // Implicit Grant — returns token in URL hash
    redirect_uri: REDIRECT_URI,
    scope: SCOPES,
    show_dialog: true,            // Always show the login dialog (good for testing)
  });
  return `https://accounts.spotify.com/authorize?${params.toString()}`;
};

// Pulls the access_token out of the URL hash after Spotify redirects back
// Example URL: http://localhost:3000/#access_token=BQA...&expires_in=3600
export const getTokenFromUrl = () => {
  const hash = window.location.hash.substring(1); // Remove the leading '#'
  const params = new URLSearchParams(hash);
  return {
    access_token: params.get('access_token'),
    expires_in: params.get('expires_in'),
  };
};
