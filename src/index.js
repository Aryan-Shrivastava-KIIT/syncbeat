// ============================================================
//  📁 src/index.js
//  🚀 Entry point — mounts the React app into index.html's #root
// ============================================================

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Find the <div id="root"> in public/index.html and render our app into it
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // StrictMode helps catch bugs in development (renders twice in dev, once in production)
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
