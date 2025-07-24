import React from "react"
import useFinance from "../state/finance"
import getItemsForMonth from "../utils/getItemsForMonth"

export default function TotalBalance({ selectedDate }) {
  const scheduleGroups = useFinance((state) => state.scheduleGroups)

  // ✅ Filter only for current visible month
  const items = getItemsForMonth(scheduleGroups, selectedDate)

  const income = items
    .filter((item) => item.amount > 0)
    .reduce((acc, item) => acc + item.amount, 0)

  const expenses = items
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
