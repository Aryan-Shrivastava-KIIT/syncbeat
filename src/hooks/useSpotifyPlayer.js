// ============================================================
//  📁 src/hooks/useSpotifyPlayer.js
//  🎵 Custom React hook that manages the Spotify Web Playback SDK
// ============================================================
//
//  What this hook does:
//  - Waits for the Spotify SDK script to load
//  - Creates a Spotify Player in the user's browser (acts as a virtual device)
//  - Connects the player so Spotify knows it exists
//  - Returns the player instance and current playback state
// ============================================================

import { useState, useEffect, useRef } from 'react';

const useSpotifyPlayer = (accessToken) => {
  // The Spotify Player object (our virtual speaker)
  const [player, setPlayer] = useState(null);

  // Spotify's internal ID for this browser tab's player
  const [deviceId, setDeviceId] = useState(null);

  // The current track info, position, paused/playing state
  const [playerState, setPlayerState] = useState(null);

  // Whether the player is ready to receive commands
  const [isReady, setIsReady] = useState(false);

  // Use a ref so we can clean up the player on unmount
  const playerRef = useRef(null);

  useEffect(() => {
    // Don't do anything until we have a valid Spotify token
    if (!accessToken) return;

    // Helper: actually creates the player (called once SDK is ready)
    const initPlayer = () => {
      // window.Spotify is injected by the SDK script in index.html
      const spotifyPlayer = new window.Spotify.Player({
        name: 'BeatSync 🎵',       // Name shown in Spotify's device list
        getOAuthToken: (cb) => {
          // Spotify calls this function whenever it needs a fresh token
          cb(accessToken);
        },
        volume: 0.8,               // Start at 80% volume
      });

      // ---- Event Listeners ----

      // Fires when the player is successfully connected to Spotify
      spotifyPlayer.addListener('ready', ({ device_id }) => {
        console.log('✅ Spotify Player ready! Device ID:', device_id);
        setDeviceId(device_id);
        setIsReady(true);
      });

      // Fires if the player disconnects
      spotifyPlayer.addListener('not_ready', ({ device_id }) => {
        console.warn('⚠️ Player device went offline:', device_id);
        setIsReady(false);
      });

      // Fires every time the playback state changes (new track, pause, seek…)
      spotifyPlayer.addListener('player_state_changed', (state) => {
        if (!state) return;
        setPlayerState(state); // Save the whole state object
      });

      // Log any errors from the SDK
      spotifyPlayer.addListener('initialization_error', ({ message }) =>
        console.error('Init error:', message)
      );
      spotifyPlayer.addListener('authentication_error', ({ message }) =>
        console.error('Auth error:', message)
      );
      spotifyPlayer.addListener('account_error', ({ message }) =>
        console.error('Account error (Premium required):', message)
      );

      // Connect the player to Spotify's servers
      spotifyPlayer.connect().then((success) => {
        if (success) console.log('🔗 Connected to Spotify');
      });

      // Save references so we can clean up later
      playerRef.current = spotifyPlayer;
      setPlayer(spotifyPlayer);
    };

    // If the SDK already loaded before this component mounted, init immediately
    if (window.spotifySDKReady) {
      initPlayer();
    } else {
      // Otherwise wait for the custom event we fire in index.html
      const handleSDKReady = () => initPlayer();
      window.addEventListener('spotify-sdk-ready', handleSDKReady);
      return () => window.removeEventListener('spotify-sdk-ready', handleSDKReady);
    }

    // Cleanup: disconnect the player when the component unmounts
    return () => {
      if (playerRef.current) {
        playerRef.current.disconnect();
        console.log('🔌 Spotify player disconnected');
      }
    };
  }, [accessToken]); // Re-run if token changes (e.g. user re-logs in)

  return { player, deviceId, playerState, isReady };
};

export default useSpotifyPlayer;
