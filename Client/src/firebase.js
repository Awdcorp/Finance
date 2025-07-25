// Firebase setup
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Paste your Firebase config here 👇
const firebaseConfig = {
  apiKey: "AIzaSyDz-zT11TNRL2yUyih7N5wXy0lgWy7_sXo",
  authDomain: "financetracker-8cbd5.firebaseapp.com",
  projectId: "financetracker-8cbd5",
  storageBucket: "financetracker-8cbd5.firebasestorage.app",
  messagingSenderId: "740893767727",
  appId: "1:740893767727:web:99eeb5fece6de6bd586eda",
  measurementId: "G-7ERLRC4BR9"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const provider = new GoogleAuthProvider();

export const login = () => signInWithPopup(auth, provider);
export const logout = () => signOut(auth);
