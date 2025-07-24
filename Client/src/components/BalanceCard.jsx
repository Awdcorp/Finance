import React from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

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

      {/* Amount */}
      <div className="text-2xl font-semibold text-white mt-1">
        {amount.toFixed(2)} €
      </div>
    </div>
  );
}
