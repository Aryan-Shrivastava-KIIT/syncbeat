// ============================================================
//  📁 src/App.jsx
//  🏠 Root component — manages auth state, routing between screens
// ============================================================
//
//  App flow:
//  1. Check for Spotify token in URL (after login redirect)
//  2. If no token → show <Login />
//  3. If token but no room → show <RoomManager />
//  4. If token + room → show the main sync screen
// ============================================================

import React, { useState, useEffect, useCallback } from 'react';
import Login from './components/Login';
import RoomManager from './components/RoomManager';
import NowPlaying from './components/NowPlaying';
import Player from './components/Player';
import useSpotifyPlayer from './hooks/useSpotifyPlayer';
import useFirebaseSync from './hooks/useFirebaseSync';
import { getTokenFromUrl } from './config/spotify';
import { extractColors } from './utils/colorExtractor';
import { db } from './config/firebase';
import { ref, onValue } from 'firebase/database';
import './App.css';

function App() {
  // ---- Auth State ----
  const [accessToken, setAccessToken] = useState(null);

  // ---- Room State ----
  const [roomId, setRoomId] = useState(null);
  const [isHost, setIsHost] = useState(false);

  // ---- Dynamic Colors (from album art via Vibrant.js) ----
  const [colors, setColors] = useState({
    vibrant: '#1db954',
    darkVibrant: '#0d0d1a',
    lightVibrant: '#7b68ee',
    muted: '#2d2d44',
  });

  // ============================================================
  //  STEP 1: Extract Spotify token from URL after login redirect
  // ============================================================
  useEffect(() => {
    const { access_token } = getTokenFromUrl();

    if (access_token) {
      // Save the token to state
      setAccessToken(access_token);
      // Clean the token out of the URL so it doesn't show in the address bar
      
      console.log('✅ Got Spotify access token');
    } else {
      // Check if we saved a token earlier in sessionStorage
      const saved = sessionStorage.getItem('spotify_token');
      if (saved) setAccessToken(saved);
    }
  }, []);

  // Save token to sessionStorage so it survives a page refresh
  useEffect(() => {
    if (accessToken) sessionStorage.setItem('spotify_token', accessToken);
  }, [accessToken]);

  // ============================================================
  //  STEP 2: Initialize the Spotify Web Playback SDK
  // ============================================================
  const { player, deviceId, playerState, isReady } = useSpotifyPlayer(accessToken);

  // ============================================================
  //  STEP 3: Set up Firebase real-time sync (host or listener)
  // ============================================================
  const controls = useFirebaseSync({
    roomId,
    isHost,
    player,
    playerState,
    deviceId,
    accessToken,
  });

  // ============================================================
  //  STEP 4: Watch album art and update background colors
  // ============================================================
  useEffect(() => {
    if (!roomId) return;

    // Listen for album art URL changes in Firebase
    const roomRef = ref(db, `rooms/${roomId}/playback/album_art`);
    const unsubscribe = onValue(roomRef, async (snapshot) => {
      const albumArtUrl = snapshot.val();
      if (albumArtUrl) {
        const newColors = await extractColors(albumArtUrl);
        setColors(newColors);
      }
    });

    return () => unsubscribe();
  }, [roomId]);

  // ============================================================
  //  STEP 5: Apply dynamic CSS variables for color theming
  // ============================================================
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--color-vibrant', colors.vibrant);
    root.style.setProperty('--color-dark', colors.darkVibrant);
    root.style.setProperty('--color-light', colors.lightVibrant);
    root.style.setProperty('--color-muted', colors.muted);
  }, [colors]);

  // ---- Handle entering a room ----
  const handleEnterRoom = useCallback((id, hostMode) => {
    setRoomId(id);
    setIsHost(hostMode);
    console.log(`🚪 Entered room: ${id} as ${hostMode ? 'Host' : 'Listener'}`);
  }, []);

  // ---- Handle logout ----
  const handleLogout = () => {
    sessionStorage.removeItem('spotify_token');
    setAccessToken(null);
    setRoomId(null);
    setIsHost(false);
  };

  // ============================================================
  //  RENDER: Pick the right screen based on app state
  // ============================================================

  // No token → Login screen
  if (!accessToken) {
    return <Login />;
  }

  // Token but no room → Room picker
  if (!roomId) {
    return <RoomManager onEnterRoom={handleEnterRoom} />;
  }

  // Token + Room → Main sync screen
  return (
    <div className="app-container">
      {/* Dynamic gradient background — colors come from Vibrant.js */}
      <div
        className="dynamic-bg"
        style={{
          background: `
            radial-gradient(ellipse at top left, ${colors.vibrant}55 0%, transparent 60%),
            radial-gradient(ellipse at bottom right, ${colors.lightVibrant}33 0%, transparent 60%),
            linear-gradient(135deg, ${colors.darkVibrant} 0%, #0a0a0f 50%, ${colors.muted}44 100%)
          `,
        }}
      />

      {/* Noise texture overlay for depth */}
      <div className="noise-overlay" />

      {/* Top Bar */}
      <header className="top-bar glass-card">
        <div className="top-bar-left">
          <span className="logo-icon small">🎵</span>
          <span className="logo-title small">BeatSync</span>
        </div>
        <div className="top-bar-right">
          <span className="room-pill">Room: <strong>{roomId}</strong></span>
          <button className="btn-logout" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {/* Now Playing Card */}
        <NowPlaying
          roomId={roomId}
          isHost={isHost}
          colors={colors}
        />

        {/* Host Controls (only rendered for Host) */}
        <Player
          isHost={isHost}
          isReady={isReady}
          controls={controls}
          colors={colors}
          roomId={roomId}
          playerState={playerState}
        />
      </main>
    </div>
  );
}

export default App;
