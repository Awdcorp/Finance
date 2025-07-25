// ✅ App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/home';
import Stats from './pages/stats';
import Profile from './pages/profile';
import { Toaster } from 'react-hot-toast';
import useAuth from './auth/useAuth'; // ✅ New custom hook
import LoginScreen from './components/LoginScreen'; // ✅ New login component
import PrivateRoute from './components/PrivateRoute'; // ✅ Optional secure route
import './App.css';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="animate-pulse text-xl font-semibold">Loading ...</div>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <Router>
      <div className="min-h-screen">
        <Routes>
          <Route path="/" element={<Dashboard user={user} />} />
          <Route path="/stats" element={<PrivateRoute user={user}><Stats user={user} /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute user={user}><Profile user={user} /></PrivateRoute>} />
        </Routes>
        <Toaster position="top-right" />
      </div>
    </Router>
  );
}

export default App;
