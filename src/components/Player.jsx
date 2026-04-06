// ============================================================
//  📁 src/components/Player.jsx
//  🎮 Playback controls (only visible and functional for the Host)
// ============================================================

import React, { useState } from 'react';

const Player = ({ isHost, isReady, controls, colors, roomId, playerState }) => {
  const { togglePlay, nextTrack, prevTrack, playTrack } = controls;

  // State for the "play by URI" input (Host can type a Spotify track URI)
  const [trackInput, setTrackInput] = useState('');

  const isPaused = playerState?.paused ?? true;

  // Play a specific Spotify URI the host typed
  const handlePlayUri = () => {
    const uri = trackInput.trim();
    if (!uri.startsWith('spotify:track:')) {
      alert('Please enter a valid Spotify Track URI.\nExample: spotify:track:6rqhFgbbKwnb9MLmUQDhG6\n\nFind it in Spotify: right-click a song → Share → Copy Spotify URI');
      return;
    }
    playTrack(uri);
    setTrackInput('');
  };

  // Don't show controls to listeners at all
  if (!isHost) return null;

  return (
    <div className="player-panel glass-card">
      <h3 className="panel-title">🎮 Host Controls</h3>

      {!isReady && (
        <p className="player-status">⏳ Connecting player to Spotify...</p>
      )}

      {/* Main Playback Controls */}
      <div className="controls-row">
        <button
          className="ctrl-btn"
          onClick={prevTrack}
          disabled={!isReady}
          title="Previous Track"
        >
          ⏮
        </button>

        <button
          className="ctrl-btn ctrl-btn-primary"
          onClick={togglePlay}
          disabled={!isReady}
          title={isPaused ? 'Play' : 'Pause'}
          style={{ '--btn-color': colors.vibrant }}
        >
          {isPaused ? '▶' : '⏸'}
        </button>

        <button
          className="ctrl-btn"
          onClick={nextTrack}
          disabled={!isReady}
          title="Next Track"
        >
          ⏭
        </button>
      </div>

      {/* Room Code Display */}
      <div className="room-code-display glass-card">
        <p className="room-code-label">📋 Room Code — share with friends:</p>
        <p className="room-code">{roomId}</p>
        <button
          className="copy-btn"
          onClick={() => {
            navigator.clipboard.writeText(roomId);
            alert('Room code copied!');
          }}
        >
          Copy
        </button>
      </div>

      {/* Play by Spotify URI */}
      <div className="uri-input-row">
        <input
          className="room-input"
          type="text"
          placeholder="spotify:track:...  (paste a Track URI)"
          value={trackInput}
          onChange={(e) => setTrackInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handlePlayUri()}
        />
        <button
          className="btn-spotify btn-small"
          onClick={handlePlayUri}
          disabled={!isReady}
        >
          ▶ Play
        </button>
      </div>

      <p className="uri-hint">
        💡 Get a Track URI: Open Spotify → right-click any song → Share → Copy Spotify URI
      </p>
    </div>
  );
};

export default Player;
