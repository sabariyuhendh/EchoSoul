import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider, getRedirectResult, signOut, onAuthStateChanged, User, AuthError } from "firebase/auth";

// The environment variables are swapped, so we need to correct them:
// VITE_FIREBASE_PROJECT_ID contains the app ID
// VITE_FIREBASE_APP_ID contains the project ID
const actualProjectId = import.meta.env.VITE_FIREBASE_APP_ID; // echosoul-72fc7
const actualAppId = import.meta.env.VITE_FIREBASE_PROJECT_ID; // 1:512197600485:web:7eace7193f71bff69da00c

console.log('Firebase config debug:', {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ? '✓ Set' : '✗ Missing',
  actualProjectId,
  actualAppId,
});

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: `${actualProjectId}.firebaseapp.com`,
  projectId: actualProjectId,
  storageBucket: `${actualProjectId}.firebasestorage.app`,
  appId: actualAppId,
};

// Initialize Firebase - handle existing apps
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');

export const signInWithGoogle = async () => {
  try {
    console.log('Attempting Google sign in...');
    console.log('Auth object:', auth);
    console.log('Google provider:', googleProvider);
    
    const result = await signInWithPopup(auth, googleProvider);
    console.log('Sign in successful:', result);
    return result.user;
  } catch (error) {
    const authError = error as AuthError;
    console.error("Google sign in error details:", authError);
    console.error("Error code:", authError.code);
    console.error("Error message:", authError.message);
    throw error;
  }
};

// No longer needed since we're using popup instead of redirect

export const signOutFromFirebase = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    const authError = error as AuthError;
    console.error("Sign out error:", authError);
    throw error;
  }
};

export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};