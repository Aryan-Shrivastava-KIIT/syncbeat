// ============================================================
//  📁 src/components/RoomManager.jsx
//  🚪 Screen where users create a new room (Host) or join one (Listener)
// ============================================================

import React, { useState } from 'react';

const RoomManager = ({ onEnterRoom }) => {
  const [roomInput, setRoomInput] = useState('');
  const [mode, setMode] = useState(null); // 'host' or 'join'

  // Generate a random 6-character room code like "XK9P2M"
  const generateRoomId = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleCreateRoom = () => {
    const newRoomId = generateRoomId();
    onEnterRoom(newRoomId, true); // true = isHost
  };

  const handleJoinRoom = () => {
    const id = roomInput.trim().toUpperCase();
    if (!id) {
      alert('Please enter a Room Code!');
      return;
    }
    onEnterRoom(id, false); // false = isListener
  };

  return (
    <div className="room-manager">
      <div className="blob blob-1" />
      <div className="blob blob-2" />

      <div className="room-card glass-card">
        <h2 className="room-title">
          <span className="logo-icon" style={{ fontSize: '1.8rem' }}>🎵</span>
          BeatSync
        </h2>
        <p className="room-subtitle">Create a room to host, or enter a code to listen</p>

        {/* MODE SELECTION */}
        {!mode && (
          <div className="mode-buttons">
            <button className="btn-mode btn-host" onClick={() => setMode('host')}>
              <span className="btn-mode-icon">👑</span>
              <span className="btn-mode-label">Create Room</span>
              <span className="btn-mode-desc">Become the Host</span>
            </button>
            <button className="btn-mode btn-join" onClick={() => setMode('join')}>
              <span className="btn-mode-icon">🎧</span>
              <span className="btn-mode-label">Join Room</span>
              <span className="btn-mode-desc">Listen along</span>
            </button>
          </div>
        )}

        {/* HOST MODE */}
        {mode === 'host' && (
          <div className="mode-panel">
            <p className="mode-info">
              You'll control playback. Share the room code with friends so they can join.
            </p>
            <button className="btn-spotify" onClick={handleCreateRoom}>
              ✨ Generate Room & Start
            </button>
            <button className="btn-back" onClick={() => setMode(null)}>← Back</button>
          </div>
        )}

        {/* LISTENER MODE */}
        {mode === 'join' && (
          <div className="mode-panel">
            <p className="mode-info">
              Enter the 6-character room code your host shared with you.
            </p>
            <input
              className="room-input"
              type="text"
              placeholder="e.g. XK9P2M"
              maxLength={6}
              value={roomInput}
              onChange={(e) => setRoomInput(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handleJoinRoom()}
            />
            <button className="btn-spotify" onClick={handleJoinRoom}>
              🎧 Join Room
            </button>
            <button className="btn-back" onClick={() => setMode(null)}>← Back</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomManager;
