// src/components/AddPendingItemModal.jsx
import React, { useState, useEffect } from "react"
import { Dialog } from "@headlessui/react"
import useFinance from "../state/finance"
import toast from "react-hot-toast"

export default function AddPendingItemModal({
  isOpen,
  onClose,
  isEditMode = false,
  defaultValues = {},
  groupIndex = 0,
  itemIndex = 0,
  onSave,
}) {
  const [title, setTitle] = useState("")
  const [amount, setAmount] = useState("")
  const [showSchedule, setShowSchedule] = useState(false)
  const [selectedScheduleGroup, setSelectedScheduleGroup] = useState(0)
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0])
  const [repeat, setRepeat] = useState("none")
  const [repeatEndDate, setRepeatEndDate] = useState("")
  const [icon, setIcon] = useState("📝") // simple emoji selector for now

  const scheduleGroups = useFinance((state) => state.scheduleGroups)

  useEffect(() => {
    if (isEditMode && defaultValues) {
      setTitle(defaultValues.title || "")
      setAmount(defaultValues.amount?.toString() || "")
    }
  }, [defaultValues, isEditMode])

  const handleSave = () => {
    if (!title.trim() || !amount.trim()) {
      toast.error("Please fill in both fields")
      return
    }

    const parsedAmount = parseFloat(amount)
    if (isNaN(parsedAmount)) {
      toast.error("Amount must be a number")
      return
    }

    const updatedItem = { title: title.trim(), amount: parsedAmount }
    if (isEditMode && onSave) {
      onSave(updatedItem)
      toast.success("Item updated")
      onClose()
    }
  }

  const handleSchedule = () => {
    const parsedAmount = parseFloat(amount)
    if (isNaN(parsedAmount) || !title.trim()) {
      toast.error("Fill valid title and amount first")
      return
    }

    const itemToSchedule = {
      title: title.trim(),
      amount: parsedAmount,
      date,
      repeat: repeat === "none" ? null : repeat,
      repeatEndDate: repeat !== "none" && repeatEndDate ? repeatEndDate : null,
      icon
    }

    useFinance.getState().addItemToGroup(selectedScheduleGroup, itemToSchedule)
    useFinance.getState().removePendingItemFromGroup(groupIndex, itemIndex)
    toast.success("Item moved to schedule")
    onClose()
  }

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/40" />
      <div className="fixed inset-0 flex items-center justify-center">
        <Dialog.Panel className="bg-neutral-800 p-6 rounded-xl text-white w-80">
          <Dialog.Title className="text-lg font-semibold mb-4">
            {isEditMode ? "Edit Draft Item" : "Add Pending Item"}
          </Dialog.Title>

          <div className="space-y-3">
            <input
              className="w-full p-2 rounded bg-neutral-700"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <input
              className="w-full p-2 rounded bg-neutral-700"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />

            <div className="flex justify-between mt-4">
              <button
                onClick={onClose}
                className="text-sm px-3 py-1 bg-gray-600 rounded"
              >
                Cancel
              </button>

              {isEditMode && (
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    className="text-sm px-3 py-1 bg-yellow-500 text-black font-semibold rounded"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setShowSchedule((prev) => !prev)}
                    className="text-sm px-3 py-1 bg-green-500 text-black font-semibold rounded"
                  >
                    Schedule This Item
                  </button>
                </div>
              )}

              {!isEditMode && (
                <button
                  onClick={() => {
                    useFinance.getState().addPendingItemToGroup(groupIndex, {
                      title: title.trim(),
                      amount: parseFloat(amount),
                      date: new Date().toISOString(),
                    })
                    toast.success("Item added")
                    setTitle("")
                    setAmount("")
                    onClose()
                  }}
                  className="text-sm px-3 py-1 bg-yellow-500 text-black font-semibold rounded"
                >
                  Add
                </button>
              )}
            </div>

            {/* Scheduling Form */}
            {showSchedule && (
              <div className="mt-4 space-y-2">
                <label className="block text-sm text-gray-400">Select Schedule Group:</label>
                <select
                  value={selectedScheduleGroup}
                  onChange={(e) => setSelectedScheduleGroup(parseInt(e.target.value))}
                  className="w-full p-2 rounded bg-neutral-700"
                >
                  {scheduleGroups.map((group, i) => (
                    <option key={i} value={i}>
                      {group.title || `Group ${i + 1}`}
                    </option>
                  ))}
                </select>

                <label className="block text-sm text-gray-400 mt-2">Date:</label>
                <input
                  type="date"
                  className="w-full p-2 rounded bg-neutral-700"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />

                <label className="block text-sm text-gray-400 mt-2">Repeat:</label>
                <select
                  className="w-full p-2 rounded bg-neutral-700"
                  value={repeat}
                  onChange={(e) => setRepeat(e.target.value)}
                >
                  <option value="none">None</option>
                  <option value="monthly">Monthly</option>
                  <option value="weekly">Weekly</option>
                </select>

                {repeat !== "none" && (
                  <>
                    <label className="block text-sm text-gray-400 mt-2">Repeat End Date:</label>
                    <input
                      type="date"
                      className="w-full p-2 rounded bg-neutral-700"
                      value={repeatEndDate}
                      onChange={(e) => setRepeatEndDate(e.target.value)}
                    />
                  </>
                )}

                <label className="block text-sm text-gray-400 mt-2">Icon (optional):</label>
                <select
                  className="w-full p-2 rounded bg-neutral-700"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                >
                  <option value="📝">📝 Note</option>
                  <option value="💸">💸 Salary</option>
                  <option value="🏠">🏠 Rent</option>
                  <option value="🍔">🍔 Food</option>
                  <option value="🚌">🚌 Travel</option>
                  <option value="⚡">⚡ Electricity</option>
                </select>

                <button
                  onClick={handleSchedule}
                  className="w-full mt-3 text-sm py-2 bg-blue-500 text-white rounded font-semibold"
                >
                  Confirm Schedule
                </button>
              </div>
            )}
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}
