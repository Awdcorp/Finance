// ✅ components/PrivateRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore from '../state/auth'; // Zustand store

export default function PrivateRoute({ children }) {
  const { currentUser } = useAuthStore(); // Get user from global auth state

  return currentUser ? children : <Navigate to="/login" />;
}
