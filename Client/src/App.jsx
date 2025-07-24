// ✅ App.jsx (core wrapper)
import React from 'react';
import Dashboard from './pages/home'; // assuming Dashboard.jsx contains the full UI
import FloatingAddButton from "./components/FloatingAddButton";
import { Toaster } from 'react-hot-toast'
import './App.css';

function App() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Dashboard />
      <Toaster position="top-right" />
    </div>
  );
}

export default App;
