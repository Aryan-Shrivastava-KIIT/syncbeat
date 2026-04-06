// ============================================================
//  📁 src/hooks/useFirebaseSync.js
//  🔥 Core real-time sync logic using Firebase Realtime Database
// ============================================================
//
//  HOW THE SYNC WORKS (0-lag approach):
//
//  HOST:
//    Every second, the Host writes this to Firebase:
//    {
//      track_uri: "spotify:track:...",
//      position_ms: 45200,         ← current position in the song
//      is_playing: true,
//      server_timestamp: 1700000000000  ← when the host wrote this
//    }
//
//  LISTENER:
//    On each Firebase update, the Listener:
//    1. Reads position_ms and server_timestamp from Firebase
//    2. Calculates how much time has passed since the host wrote: delta = now - server_timestamp
//    3. Seeks to: position_ms + delta  (this compensates for network delay!)
//    4. Plays the same track
//
//  RESULT: ~0ms lag because we account for the time data took to travel.
// ============================================================

import { useEffect, useRef, useCallback } from 'react';
import { db } from '../config/firebase';
import { ref, set, onValue, serverTimestamp } from 'firebase/database';

const useFirebaseSync = ({
  roomId,        // A short room code like "ROOM123"
  isHost,        // true = this user controls playback
  player,        // Spotify Player object from useSpotifyPlayer
  playerState,   // Current Spotify playback state
  deviceId,      // This browser tab's Spotify device ID
  accessToken,   // Spotify access token (needed to start playback via HTTP API)
}) => {

  // Keep a ref to avoid stale closures in intervals
  const syncIntervalRef = useRef(null);

  // ---- Firebase path for this room ----
  // All sync data for a room lives at /rooms/{roomId}/playback
  const roomRef = ref(db, `rooms/${roomId}/playback`);

  // ============================================================
  //  HOST: Push current playback state to Firebase every second
  // ============================================================
  const startHostSync = useCallback(() => {
    if (!isHost || !player) return;

    console.log('👑 Starting HOST sync...');

    syncIntervalRef.current = setInterval(async () => {
      try {
        // Ask the Spotify SDK for the latest state
        const state = await player.getCurrentState();
        if (!state) return;

        const { track_window, position, paused } = state;
        const currentTrack = track_window.current_track;

        // Write to Firebase. serverTimestamp() is Firebase's built-in clock.
        await set(roomRef, {
          track_uri: currentTrack.uri,                   // e.g. "spotify:track:6rqhFgbbKwnb9MLmUQDhG6"
          track_name: currentTrack.name,
          artist_name: currentTrack.artists[0].name,
          album_art: currentTrack.album.images[0]?.url,
          position_ms: position,                         // Current ms position
          is_playing: !paused,
          host_timestamp: Date.now(),                    // Client timestamp for lag compensation
        });
      } catch (err) {
        console.error('Firebase write error:', err);
      }
    }, 1000); // Write every 1 second

  }, [isHost, player, roomRef]);

  // ============================================================
  //  LISTENER: Subscribe to Firebase and mirror the host's state
  // ============================================================
  const startListenerSync = useCallback(() => {
    if (isHost || !player || !accessToken || !deviceId) return;

    console.log('🎧 Starting LISTENER sync...');

    // onValue fires immediately and on every subsequent change
    const unsubscribe = onValue(roomRef, async (snapshot) => {
      const data = snapshot.val();
      if (!data) return;

      const {
        track_uri,
        position_ms,
        is_playing,
        host_timestamp,
      } = data;

      // ---- Lag compensation math ----
      // Calculate how many ms have passed since the host wrote to Firebase
      const networkDelta = Date.now() - host_timestamp;

      // The real position we should be at right now
      const correctedPosition = position_ms + networkDelta;

      console.log(`🔄 Syncing | Host pos: ${position_ms}ms | Delta: ${networkDelta}ms | Seeking to: ${correctedPosition}ms`);

      try {
        // Step 1: Tell Spotify to play this track on THIS device
        // We use the Web API (not the SDK) to transfer playback and seek
        await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            uris: [track_uri],
            position_ms: correctedPosition,  // Start exactly where the host is
          }),
        });

        // Step 2: Sync pause/play state
        if (!is_playing) {
          await fetch('https://api.spotify.com/v1/me/player/pause', {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${accessToken}` },
          });
        }
      } catch (err) {
        console.error('Listener sync error:', err);
      }
    });

    // Return the unsubscribe function so we can clean up
    return unsubscribe;
  }, [isHost, player, accessToken, deviceId, roomRef]);

  // ---- Run the right sync mode based on role ----
  useEffect(() => {
    let unsubscribe;

    if (isHost) {
      startHostSync();
    } else {
      unsubscribe = startListenerSync();
    }

    // Cleanup when component unmounts or role changes
    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [isHost, startHostSync, startListenerSync]);

  // ============================================================
  //  HOST CONTROLS: These functions are only used by the Host
  //  to control playback. Listeners just follow along.
  // ============================================================

  // Play a specific track (Host only)
  const playTrack = async (trackUri) => {
    if (!isHost || !deviceId || !accessToken) return;
    await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ uris: [trackUri] }),
    });
  };

  // Toggle pause/play (Host only)
  const togglePlay = async () => {
    if (!player || !isHost) return;
    await player.togglePlay();
  };

  // Skip to next track (Host only)
  const nextTrack = async () => {
    if (!player || !isHost) return;
    await player.nextTrack();
  };

  // Skip to previous track (Host only)
  const prevTrack = async () => {
    if (!player || !isHost) return;
    await player.previousTrack();
  };

  return { playTrack, togglePlay, nextTrack, prevTrack };
};

export default useFirebaseSync;
