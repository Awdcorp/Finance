// ✅ App.jsx
import React, { useEffect } from 'react';
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
        <Toaster position="top-right" />
      </div>
    </Router>
  );
}
export default App;
