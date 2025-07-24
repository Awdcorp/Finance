// BottomNav.jsx
import React from "react";
import { Home, PieChart, PlusCircle, User } from "lucide-react";

export default function BottomNav({ active = "home" }) {
  const tabs = [
    { name: "home", icon: Home },
    { name: "stats", icon: PieChart },
    { name: "profile", icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-neutral-900 text-white flex justify-around items-center h-16 shadow-inner">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = active === tab.name;
        return (
          <button
            key={tab.name}
            className={`flex flex-col items-center text-xs ${
              isActive ? "text-yellow-400" : "text-gray-400"
            }`}
          >
            <Icon className="w-5 h-5 mb-1" />
            {tab.name.charAt(0).toUpperCase() + tab.name.slice(1)}
          </button>
        );
      })}
    </div>
  );
}
