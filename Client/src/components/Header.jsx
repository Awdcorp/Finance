// components/Header.jsx
import { ChevronDown, Star, Search } from "lucide-react";

export default function Header() {
  return (
    <div className="flex items-center justify-between px-4 py-2 text-white">
      {/* Left icon (search) */}
      <Search className="w-5 h-5 text-gray-400" />

      {/* Title + Subtitle */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-1 text-lg font-medium">
          <span>💰</span>
          <span>My Budget</span>
          <ChevronDown className="w-4 h-4" />
        </div>
        <div className="text-sm text-gray-400 -mt-1">Monthly Balance</div>
      </div>

      {/* Right icon (yellow star) */}
      <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
    </div>
  );
}
