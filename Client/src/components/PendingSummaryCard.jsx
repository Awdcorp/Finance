import React from "react";
import useFinance from "../state/finance";
import { IndianRupee, FileClock } from "lucide-react";

export default function PendingSummaryCard() {
  const scheduleGroups = useFinance((state) => state.scheduleGroups) || {};

  const pendingGroups = Object.values(scheduleGroups).filter((group) => group.isPending);

  const allPendingItems = pendingGroups.flatMap((group) =>
    Object.values(group.items || {})
  );

  const totalAmount = allPendingItems
    .reduce((acc, item) => acc + (parseFloat(item.amount) || 0), 0)
    .toFixed(2);

  const itemCount = allPendingItems.length;

  return (
    <div className="bg-gradient-to-br from-[#1E1E1E] to-[#2A2A2A] text-white rounded-xl p-5 mb-4 shadow-lg border border-neutral-700">
      <div className="flex items-center gap-2 mb-3">
        <FileClock size={20} className="text-blue-400" />
        <h2 className="text-lg font-semibold text-blue-300">Pending Summary</h2>
      </div>

      <div className="flex justify-between items-center text-sm text-gray-300 mb-1">
        <span>Total Pending</span>
        <span className="text-red-400 font-semibold">{totalAmount} ₹</span>
      </div>

      <div className="flex justify-between items-center text-sm text-gray-300">
        <span>Items Pending</span>
        <span className="text-white font-medium">{itemCount}</span>
      </div>
    </div>
  );
}
