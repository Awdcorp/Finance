// src/components/TotalBalance.jsx
import React from "react"
import useFinance from "../state/finance"

export default function TotalBalance() {
  const scheduleGroups = useFinance((state) => state.scheduleGroups)

  // Flatten all items from all groups
  const allItems = scheduleGroups?.flatMap((group) => group.items) || []

  const income = allItems
    .filter((item) => item.amount > 0)
    .reduce((acc, item) => acc + item.amount, 0)

  const expenses = allItems
    .filter((item) => item.amount < 0)
    .reduce((acc, item) => acc + item.amount, 0)

  const total = income + expenses

  return (
    <div className="text-center">
      <div className="text-sm text-gray-400">Total Balance</div>
      <div className="text-4xl font-bold text-white">
        {total.toFixed(2)} €
      </div>
    </div>
  )
}
