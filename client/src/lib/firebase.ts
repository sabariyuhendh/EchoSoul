import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, User } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCyj8a9D4igdwn8SBfMGXsVGhAq2EJhj9g",
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID || "echosoul-72fc7"}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "echosoul-72fc7",
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID || "echosoul-72fc7"}.firebasestorage.app`,
  messagingSenderId: "512197600485",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:512197600485:web:7eace7193f71bff69da00c",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Google sign in error:", error);
    throw error;
  }
};

export const signOutFromFirebase = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Sign out error:", error);
    throw error;
  }
};

export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};