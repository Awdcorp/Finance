import React, { useState } from "react"
import useFinance from "../state/finance"
import getItemsForMonth from "../utils/getItemsForMonth"
import { toast } from "react-hot-toast"
import { Pencil } from "lucide-react"

export default function TotalBalance({ selectedDate }) {
  const scheduleGroups = useFinance((state) => state.scheduleGroups)
  const addItemToGroup = useFinance((state) => state.addItemToGroup)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [actualBalance, setActualBalance] = useState("")

  // Get current month's items
  const items = getItemsForMonth(scheduleGroups, selectedDate)

  const income = items
    .filter((item) => item.amount > 0)
    .reduce((acc, item) => acc + item.amount, 0)

  const expenses = items
    .filter((item) => item.amount < 0)
    .reduce((acc, item) => acc + item.amount, 0)

  const total = income + expenses

  const handleUpdateBalance = () => {
    const actual = parseFloat(actualBalance.trim())
    console.log("User entered balance:", actual)

    if (isNaN(actual) || actual <= 0) {
      console.warn("Invalid balance entered")
      toast.error("Please enter a valid balance")
      return
    }

    const diff = actual - total
    if (diff === 0) {
      toast("Balance already matches")
      setIsModalOpen(false)
      return
    }

    const selectedMonth = selectedDate.getMonth()
    const selectedYear = selectedDate.getFullYear()

    const matchingGroupIndex = scheduleGroups.findIndex((group) =>
      group.items.some((item) => {
        const date = new Date(item.date)
        return (
          date.getMonth() === selectedMonth &&
          date.getFullYear() === selectedYear
        )
      })
    )

    const targetGroupIndex = matchingGroupIndex !== -1 ? matchingGroupIndex : 0

    try {
      // ✅ Correct order: groupIndex first, then item object
      addItemToGroup(targetGroupIndex, {
        title: "⚙️ Balance Adjustment",
        amount: diff,
        date: new Date().toISOString().split("T")[0], // Format: yyyy-mm-dd
        category: "Miscellaneous",
        notes: "Auto-added from Update Balance"
      })

      console.log("✅ Adjustment added")
      toast.success("Balance adjustment added")
      setIsModalOpen(false)
      setActualBalance("")
    } catch (e) {
      console.error("🔥 Failed to add item:", e)
      toast.error("Failed to update balance")
    }
  }

  return (
    <div className="text-center relative">
      <div className="text-sm text-gray-400">Total Balance</div>
      <div className="text-4xl font-bold text-white flex justify-center items-center gap-2">
        {total.toFixed(2)} €
        <button
          onClick={() => setIsModalOpen(true)}
          className="text-yellow-400 hover:scale-110 transition"
        >
          <Pencil className="w-4 h-4" />
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
          <div className="bg-neutral-900 text-white p-6 rounded-xl w-[300px] z-50">
            <h2 className="text-lg font-semibold mb-2">Update Actual Balance</h2>
            <div className="text-sm text-gray-400 mb-1">
              Projected Balance: {total.toFixed(2)} €
            </div>
            <input
              type="number"
              step="0.01"
              value={actualBalance}
              onChange={(e) => setActualBalance(e.target.value)}
              placeholder="Enter actual balance"
              className="w-full p-2 rounded bg-neutral-800 text-white mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-3 py-1 text-sm bg-gray-700 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateBalance}
                className="px-3 py-1 text-sm bg-yellow-500 text-black font-semibold rounded"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
