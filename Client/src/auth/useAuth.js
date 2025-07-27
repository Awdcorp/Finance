// ✅ src/auth/useAuth.js
import { useState, useEffect } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "../firebase"; // ✅ FIXED: import from your firebase.js
import useAuthStore from "../state/auth";

export default function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      useAuthStore.getState().setCurrentUser(firebaseUser);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const register = async (email, password) => {
    await createUserWithEmailAndPassword(auth, email, password);
  };

  const login = async (email, password) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    await signOut(auth);
    useAuthStore.getState().clearUser();
  };

  return { user, loading, register, login, logout };
}
