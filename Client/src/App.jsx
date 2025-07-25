// ✅ App.jsx
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/home';
import Stats from './pages/stats';
import Profile from './pages/profile';
import { Toaster } from 'react-hot-toast';
import { auth, login } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Monitor login state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-black text-white">Loading...</div>;
  }

  // Show login screen if not logged in
  if (!user) {
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

  return (
    <Router>
      <div className="min-h-screen bg-black text-white">
        <Routes>
          <Route path="/" element={<Dashboard user={user} />} />
          <Route path="/stats" element={<Stats user={user} />} />
          <Route path="/profile" element={<Profile user={user} />} />
        </Routes>
        <Toaster position="top-right" />
      </div>
    </Router>
  );
}

export default App;
