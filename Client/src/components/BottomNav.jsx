import React from "react"
import { Home, PieChart, User } from "lucide-react"
import { useNavigate, useLocation } from "react-router-dom"

export default function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()

  // Active tab detection based on route
  const currentPath = location.pathname

  const tabs = [
    { name: "home", icon: Home, path: "/" },
    { name: "stats", icon: PieChart, path: "/stats" },
    { name: "profile", icon: User, path: "/profile" },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-neutral-900 text-white flex justify-around items-center h-16 shadow-inner z-50">
      {tabs.map((tab) => {
        const Icon = tab.icon
        const isActive = currentPath === tab.path
        return (
          <button
            key={tab.name}
            onClick={() => navigate(tab.path)} // ✅ Add navigation
            className={`flex flex-col items-center text-xs ${
              isActive ? "text-yellow-400" : "text-gray-400"
            }`}
          >
            <Icon className="w-5 h-5 mb-1" />
            {tab.name.charAt(0).toUpperCase() + tab.name.slice(1)}
          </button>
        )
      })}
    </div>
  )
}
