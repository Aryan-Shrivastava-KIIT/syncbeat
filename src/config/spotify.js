// 1. Your Spotify Client ID from the Dashboard
export const SPOTIFY_CLIENT_ID = '345ee47d24cf46ed98ad4fc8c7b1c43a';

// 2. Your EXACT Redirect URI (must match Spotify Dashboard exactly)
// Since you are using Vercel, ensure this is your production URL
export const REDIRECT_URI = 'https://syncbeat.vercel.app/'; 

// 3. Spotify Scopes (Permissions your app needs to sync music)
export const SCOPES = [
  'user-read-currently-playing',
  'user-read-playback-state',
  'user-modify-playback-state',
  'user-top-read',
  'streaming',
  'user-read-email',
  'user-read-private',
].join('%20');

// 4. The Authorization Endpoint
export const AUTH_ENDPOINT = 'https://accounts.spotify.com/authorize';

// 5. Function to generate the Login URL
export const getAuthUrl = () => {
  const params = new URLSearchParams({
    client_id: SPOTIFY_CLIENT_ID,
    response_type: 'code', // Changed from 'token' to 'code' for the 2025 update
    redirect_uri: REDIRECT_URI,
    scope: SCOPES,
    show_dialog: 'true',
  });
  
  return `${AUTH_ENDPOINT}?${params.toString()}`;
};

// 6. Function to extract the 'code' from the URL after login
export const getCodeFromUrl = () => {
  return new URLSearchParams(window.location.search).get('code');
};
