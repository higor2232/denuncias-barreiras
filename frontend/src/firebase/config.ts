// src/firebase/config.ts
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBG2jrhM6krfaJUUMpbgsWGTEkz0E9c4vY",
  authDomain: "app-denuncias-ambientais-higor.firebaseapp.com",
  projectId: "app-denuncias-ambientais-higor",
  storageBucket: "app-denuncias-ambientais-higor.firebasestorage.app",
  messagingSenderId: "1094765728298",
  appId: "1:1094765728298:web:c00cceba70331d1ba26953",
  measurementId: "G-SS4JEGEM6V"
};

// Initialize Firebase
// Check if an app is already initialized to prevent errors during hot reloading
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

export { app, db, storage, auth };
