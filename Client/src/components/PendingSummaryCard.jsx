// components/PendingSummaryCard.jsx
import React from "react"
import useFinance from "../state/finance"

export default function PendingSummaryCard() {
  const pendingGroups = useFinance((state) => state.pendingGroups)

  // Flatten all pending items across groups
  const allPendingItems = pendingGroups.flatMap(group => group.items || [])

  // Calculate total and count
  const totalAmount = allPendingItems.reduce((acc, item) => acc + item.amount, 0).toFixed(2)
  const itemCount = allPendingItems.length

  return (
    <div className="bg-[#1E1E1E] text-white rounded-xl p-4 mb-4 shadow-md">
      <h2 className="text-lg font-semibold mb-2 text-yellow-400">Pending Summary</h2>
      <div className="flex justify-between text-sm text-gray-300">
        <span>💰 Total Pending</span>
        <span className="text-red-400">{totalAmount} €</span>
      </div>
      <div className="flex justify-between text-sm text-gray-300 mt-1">
        <span>📂 Items Pending</span>
        <span>{itemCount}</span>
      </div>
    </div>
  )
}
