// ============================================================
//  📁 src/config/firebase.js
//  🔥 PASTE YOUR FIREBASE CONFIG BELOW
// ============================================================
//
//  HOW TO SET UP FIREBASE:
//  1. Go to https://console.firebase.google.com
//  2. Click "Add project" → name it "spotify-beatsync" → create
//  3. In your project, click the Web icon (</>)
//  4. Register the app (name: "beatsync-web"), then COPY the config object
//  5. Paste it into the firebaseConfig below
//
//  ENABLE THE REALTIME DATABASE:
//  1. In the left sidebar → Build → Realtime Database → Create Database
//  2. Choose "Start in test mode" (allows read/write for 30 days — fine for dev)
//  3. Pick any region and click Enable
//
//  DATABASE RULES (for test mode, already set):
//  {
//    "rules": {
//      ".read": true,
//      ".write": true
//    }
//  }
// ============================================================

import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// 👇 REPLACE THIS ENTIRE OBJECT with your Firebase project config
const firebaseConfig = {
  apiKey: 'AIzaSyDEZ2n7nC0ZFvLf79vwEfFB9ksBpWcc6Sg',
  authDomain: 'syncbeat-ad366.firebaseapp.com',
  databaseURL: 'https://syncbeat-ad366-default-rtdb.asia-southeast1.firebasedatabase.app/',   // ⚠️ Must include the Realtime DB URL
  projectId: 'syncbeat-ad366',
  storageBucket: 'syncbeat-ad366.firebasestorage.app',
  messagingSenderId: '58590354443',
  appId: '1:58590354443:web:6daa645472c0160414bb0e',
};

// Initialize Firebase app (only once)
const app = initializeApp(firebaseConfig);

// Get a reference to the Realtime Database
// This is what we use to sync the song position across all users
export const db = getDatabase(app);

export default app;
