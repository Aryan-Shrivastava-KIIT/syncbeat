import React, { useEffect, useState } from "react";
import Login from "./components/Login";
import Player from "./components/Player";
import { getCodeFromUrl } from "./config/spotify";
import "./App.css";

function App() {
  const [accessToken, setAccessToken] = useState(null);

  useEffect(() => {
    // 1. Check if there is a 'code' in the URL (from Spotify redirect)
    const code = getCodeFromUrl();

    if (code) {
      // 2. Exchange the 'code' for an 'access_token'
      // This is the required flow for the 2025/2026 Spotify API update
      fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code: code,
          redirect_uri: "https://syncbeat.vercel.app/", // Must match your Dashboard exactly
          client_id: "345ee47d24cf46ed98ad4fc8c7b1c43a",
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.access_token) {
            setAccessToken(data.data.access_token);
            // Clean the URL so the 'code' doesn't stay there
            window.history.replaceState({}, document.title, "/");
          }
        })
        .catch((err) => console.error("Auth Error:", err));
    }
  }, []);

  return (
    <div className="app">
      {accessToken ? (
        <Player accessToken={accessToken} />
      ) : (
        <Login />
      )}
    </div>
  );
}

export default App;
