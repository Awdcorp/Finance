// ✅ components/PrivateRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';

export default function PrivateRoute({ user, children }) {
  return user ? children : <Navigate to="/" />;
}
