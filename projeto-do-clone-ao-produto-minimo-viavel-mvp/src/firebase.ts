import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, getDocs, deleteDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { getRemoteConfig, fetchAndActivate, getValue } from 'firebase/remote-config';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const remoteConfig = getRemoteConfig(app);
export const googleProvider = new GoogleAuthProvider();

// Configure Remote Config
remoteConfig.settings.minimumFetchIntervalMillis = 3600000; // 1 hour
remoteConfig.defaultConfig = {
  'max_presets_per_user': 10,
  'enable_experimental_features': false
};

export { 
  signInWithPopup, signOut, onAuthStateChanged, 
  collection, doc, setDoc, getDocs, deleteDoc, query, orderBy, onSnapshot, serverTimestamp,
  fetchAndActivate, getValue
};
export type { User };
