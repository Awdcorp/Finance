// ✅ components/LoginScreen.jsx
import React from 'react';
import { login } from '../firebase';

export default function LoginScreen() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
      <h1 className="text-2xl mb-4">Welcome to Finance Tracker</h1>
      <button
        onClick={login}
        className="bg-yellow-400 text-black font-semibold px-6 py-3 rounded-lg hover:bg-yellow-300"
      >
        Sign in with Google
      </button>
    </div>
  );
}
