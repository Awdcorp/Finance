import React from "react"
import { Home, PieChart, User } from "lucide-react"
import { useNavigate, useLocation } from "react-router-dom"

const tabs = [
  { name: "Home", icon: Home, path: "/" },
  { name: "Stats", icon: PieChart, path: "/stats" },
  { name: "Profile", icon: User, path: "/profile" },
]

export default function SidebarNav() {
  const navigate = useNavigate()
  const location = useLocation()
  const currentPath = location.pathname

  return (
    <div className="hidden lg:flex flex-col w-64 h-screen bg-neutral-950 text-white p-6 justify-between fixed left-0 top-0 z-50 shadow-lg border-r border-neutral-800">

      {/* Top Profile */}
      <div>
        <div className="mb-8 text-center">
          <img src="/avatar.png" className="w-16 h-16 rounded-full mx-auto mb-3" />
          <h2 className="text-lg font-bold">My Budget</h2>
          <p className="text-xs text-gray-400">Monthly Balance</p>
        </div>

        {/* Route-based Menu Items */}
        <nav className="space-y-4">
          {tabs.map(({ name, icon: Icon, path }) => {
            const isActive = currentPath === path
            return (
              <button
                key={name}
                onClick={() => navigate(path)}
                className={`flex items-center gap-3 text-sm px-2 py-1 rounded-md transition-colors ${
                  isActive ? "text-yellow-400 bg-neutral-800" : "text-gray-300 hover:text-yellow-300"
                }`}
              >
                <Icon className="w-5 h-5" />
                {name}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Bottom Brand */}
      <div className="text-center text-yellow-400 font-semibold text-sm tracking-wide">
        📊 Finance Tracker
      </div>
    </div>
  )
}
