// ============================================================
//  📁 src/components/NowPlaying.jsx
//  🎵 Displays the current track, artwork, and a pulse visualizer
// ============================================================

import React, { useEffect, useState } from 'react';
import { db } from '../config/firebase';
import { ref, onValue } from 'firebase/database';

const NowPlaying = ({ roomId, isHost, colors }) => {
  const [trackData, setTrackData] = useState(null);

  // Subscribe to Firebase to read the latest track info
  // Both host and listeners use this to display the UI
  useEffect(() => {
    if (!roomId) return;

    const roomRef = ref(db, `rooms/${roomId}/playback`);

    const unsubscribe = onValue(roomRef, (snapshot) => {
      const data = snapshot.val();
      if (data) setTrackData(data);
    });

    return () => unsubscribe(); // Cleanup on unmount
  }, [roomId]);

  if (!trackData) {
    return (
      <div className="now-playing-empty glass-card">
        <div className="waiting-spinner" />
        <p>{isHost ? '▶ Play a song on Spotify to start syncing!' : '⏳ Waiting for the host to play something...'}</p>
      </div>
    );
  }

  const { track_name, artist_name, album_art, is_playing, position_ms } = trackData;

  // Format ms into MM:SS
  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

  return (
    <div className="now-playing glass-card">

      {/* Album Artwork with pulsing ring when playing */}
      <div className={`album-art-wrapper ${is_playing ? 'is-playing' : ''}`}>
        <div
          className="album-art-pulse"
          style={{ '--pulse-color': colors.vibrant }}
        />
        {album_art ? (
          <img className="album-art" src={album_art} alt={track_name} />
        ) : (
          <div className="album-art-placeholder">🎵</div>
        )}
      </div>

      {/* Track Info */}
      <div className="track-info">
        <h2 className="track-name">{track_name || '—'}</h2>
        <p className="artist-name">{artist_name || '—'}</p>
      </div>

      {/* Position timestamp */}
      <div className="track-position">
        <span style={{ opacity: 0.6, fontSize: '0.8rem' }}>
          {is_playing ? '▶' : '⏸'} {formatTime(position_ms || 0)}
        </span>
      </div>

      {/* Audio bars visualizer (CSS animation only, decorative) */}
      {is_playing && (
        <div className="audio-bars">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="audio-bar"
              style={{
                '--bar-color': colors.lightVibrant,
                animationDelay: `${i * 0.1}s`,
                animationDuration: `${0.5 + Math.random() * 0.7}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Role badge */}
      <div className="role-badge" style={{ '--badge-color': colors.vibrant }}>
        {isHost ? '👑 Host' : '🎧 Listening'}
      </div>
    </div>
  );
};

export default NowPlaying;
