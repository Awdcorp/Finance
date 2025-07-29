// ✅ App.jsx
import React, { useEffect, useState } from 'react';
import { Download } from "lucide-react"
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/home';
import Stats from './pages/stats';
import Profile from './pages/profile';
import { Toaster } from 'react-hot-toast';
import useAuth from './auth/useAuth';
import LoginScreen from './components/LoginScreen';
import PrivateRoute from './components/PrivateRoute';
import useFinance from './state/finance'; // Zustand sync actions
import './App.css';

function App() {
  const { user, loading } = useAuth(); // still needed for Firebase onAuthStateChanged
  const setSyncStatus = useFinance((state) => state.setSyncStatus);
  const loadUserData = useFinance((state) => state.loadUserData);
  const storedUserId = useFinance((state) => state.userId);
  const saveUserData = useFinance((state) => state.saveUserData);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };
    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        console.log("✅ App installed");
      }
      setShowInstallBanner(false);
      setDeferredPrompt(null);
    }
  };

  useEffect(() => {
    if (user?.uid && storedUserId !== user.uid) {
      loadUserData(user.uid);
    }
  }, [user]);

  // ✅ Detect online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setSyncStatus("synced");
      saveUserData(); // ✅ auto-save to Firestore when back online
    };
    const handleOffline = () => setSyncStatus("offline");

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    if (!navigator.onLine) setSyncStatus("offline");

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // ✅ Show loading screen until Firebase is ready
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="animate-pulse text-xl font-semibold">Loading ...</div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen">
        <Routes>
          <Route path="/login" element={<LoginScreen />} />

          {/* ✅ Protected routes */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                {user ? <Dashboard /> : <LoginScreen />} {/* fallback safeguard */}
              </PrivateRoute>
            }
          />
          <Route
            path="/stats"
            element={
              <PrivateRoute>
                <Stats />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
        </Routes>
        <Toaster position="bottom-center" />
      </div>
      {showInstallBanner && (
        <div className="fixed bottom-4 left-4 right-4 bg-neutral-900 border border-yellow-500 text-white px-4 py-3 rounded-xl shadow-lg flex justify-between items-center z-50">
          <div className="flex items-center gap-2">
            <Download className="text-yellow-400" size={18} />
            <span className="text-sm">Install this app on your home screen</span>
          </div>
          <button
            onClick={handleInstallClick}
            className="ml-4 px-3 py-1.5 bg-blue-500 hover:bg-yellow-400 text-white font-medium rounded-md text-sm"
          >
            Install
          </button>
        </div>
      )}
    </Router>
  );
}
export default App;
