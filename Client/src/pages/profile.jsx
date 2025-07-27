import React, { useState } from "react";
import BottomNav from "../components/BottomNav";
import SidebarNav from "../components/SidebarNav";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../state/auth";
import useAuth from "../auth/useAuth";

export default function Profile() {
  const user = useAuthStore().currentUser; // ✅ Zustand-based user
  const { logout } = useAuth(); // ✅ logout function
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);

  return (
    <div className="min-h-screen bg-neutral-900 text-white flex flex-col lg:flex-row">
      <SidebarNav />

      <div className="flex-1 lg:ml-64 px-4 pt-6 pb-24 max-w-screen-xl mx-auto">
        {user ? (
          <div className="bg-neutral-800 p-6 rounded-xl text-center text-gray-300">
            {user?.photoURL && !imgError ? (
              <img
                src={user.photoURL}
                alt="Profile"
                className="w-24 h-24 rounded-full mx-auto mb-4 border border-yellow-400 object-cover"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center bg-yellow-400 text-black text-3xl font-bold">
                {user?.displayName?.charAt(0).toUpperCase() || "U"}
              </div>
            )}

            <h3 className="text-xl font-semibold text-white">{user.displayName}</h3>
            <p className="text-sm text-gray-400 mb-4">{user.email}</p>

            <div className="text-left text-sm text-gray-400 mt-6 space-y-2 max-w-xs mx-auto">
              <div>
                <span className="text-white">🆔 UID:</span>{" "}
                <span className="break-all">{user.uid}</span>
              </div>
              <div>
                <span className="text-white">🕒 Joined:</span>{" "}
                {new Date(user.metadata.creationTime).toLocaleString()}
              </div>
              <div>
                <span className="text-white">🔄 Last Login:</span>{" "}
                {new Date(user.metadata.lastSignInTime).toLocaleString()}
              </div>
            </div>

            <button
              onClick={async () => {
                await logout();
                navigate("/login");
              }}
              className="bg-red-500 hover:bg-red-600 px-6 py-2 rounded text-white font-semibold mt-6"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="text-center text-gray-400">
            Not logged in. Please sign in.
          </div>
        )}

        {/* Bottom nav for mobile */}
        <div className="lg:hidden mt-6">
          <BottomNav />
        </div>
      </div>
    </div>
  );
}
