import React from "react"
import BottomNav from "../components/BottomNav"
import SidebarNav from "../components/SidebarNav" // ✅ Add Sidebar

export default function Profile() {
  return (
    <div className="min-h-screen bg-neutral-900 text-white flex flex-col lg:flex-row">
      
      {/* Sidebar for Desktop */}
      <SidebarNav />

      {/* Main Content */}
      <div className="flex-1 lg:ml-64 px-4 pt-6 pb-24 max-w-screen-xl mx-auto">
        <h2 className="text-2xl font-semibold mb-4 text-center lg:text-left">👤 Profile</h2>

        <div className="bg-neutral-800 p-6 rounded-xl text-center text-gray-300">
          Profile management and settings will be available soon.
        </div>

        {/* Bottom Navigation for Mobile Only */}
        <div className="lg:hidden mt-6">
          <BottomNav />
        </div>
      </div>
    </div>
  )
}
