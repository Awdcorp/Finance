import React from "react";
import { ArrowUpRight, ArrowDownRight, IndianRupee } from "lucide-react";

export default function BalanceCard({ label, amount, type }) {
  const isIncome = type === "income";
  const Icon = isIncome ? ArrowDownRight : ArrowUpRight;
  const borderColor = isIncome ? "border-green-500" : "border-red-500";
  const iconColor = isIncome ? "text-green-500" : "text-red-500";

  return (
    <div
      className={`flex-1 rounded-xl border ${borderColor} bg-neutral-800 p-4 flex flex-col gap-1 shadow-md`}
    >
      {/* Label and icon on top row */}
      <div className="flex items-center gap-2 text-sm text-gray-300">
        <Icon className={`w-4 h-4 ${iconColor}`} />
        <span className={iconColor}>{label}</span>
      </div>

      {/* Amount with ₹ icon */}
<div className="flex-1 flex items-center justify-center">
  <div className="text-2xl font-semibold text-white flex items-center gap-1">
    <IndianRupee size={14} className="-mt-[1px]" />
    {amount.toFixed(2)}
  </div>
</div>

    </div>
  );
}
