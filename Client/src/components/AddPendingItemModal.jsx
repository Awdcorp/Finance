import React, { useState, useEffect } from "react"
import { Dialog } from "@headlessui/react"
import useFinance from "../state/finance"
import toast from "react-hot-toast"
import { X } from "lucide-react"
import { categoryOptions, iconOptions } from "../constants/categories"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"

export default function AddPendingItemModal({
  isOpen,
  onClose,
  isEditMode = false,
  defaultValues = {},
  groupIndex,
  itemIndex = 0,
  onSave,
}) {
  const [title, setTitle] = useState("")
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState("")
  const [icon, setIcon] = useState("ReceiptIndianRupee")
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0])

  const [showSchedule, setShowSchedule] = useState(false)
  const [selectedScheduleGroup, setSelectedScheduleGroup] = useState(0)
  const [repeat, setRepeat] = useState("none")
  const [repeatEndDate, setRepeatEndDate] = useState("")

  const scheduleGroups = useFinance((state) => state.scheduleGroups)

  useEffect(() => {
    if (isEditMode && defaultValues) {
      setTitle(defaultValues.title || "")
      setAmount(defaultValues.amount?.toString() || "")
      setCategory(defaultValues.category || "")
      setIcon(defaultValues.icon || "ReceiptIndianRupee")
      setDate(defaultValues.date || new Date().toISOString().split("T")[0])
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

    const updatedItem = {
      title: title.trim(),
      amount: parsedAmount,
      category,
      icon,
      date,
    }

    if (isEditMode && onSave) {
      onSave(updatedItem)
      toast.success("Item updated")
      onClose()
    }
  }

  const handleSchedule = () => {
    const parsedAmount = parseFloat(amount)
    if (!title.trim() || isNaN(parsedAmount)) {
      toast.error("Fill valid title and amount")
      return
    }

    const itemToSchedule = {
      title: title.trim(),
      amount: parsedAmount,
      category,
      icon,
      date,
      repeat: repeat === "none" ? null : repeat,
      repeatEndDate: repeat !== "none" ? repeatEndDate : null,
    }

    useFinance.getState().addItemToGroup(selectedScheduleGroup, itemToSchedule)
    useFinance.getState().removePendingItemFromGroup(groupIndex, itemIndex)
    toast.success("Item scheduled")
    onClose()
  }

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-3">
        <Dialog.Panel className="bg-zinc-900 rounded-lg w-full max-w-sm p-4 shadow-xl border border-zinc-700">
          {/* Header */}
          <div className="flex justify-between items-center mb-3">
            <Dialog.Title className="text-base font-semibold text-white">
              {isEditMode ? "Edit Draft Item" : "Add Pending Item"}
            </Dialog.Title>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <X size={18} />
            </button>
          </div>

          {/* Form */}
          <form className="space-y-3 text-sm text-white">
            <div className="flex gap-2">
              <div className="w-2/3">
                <label className="block mb-0.5 text-sm">Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-2 py-1.5 bg-zinc-800 rounded-md border border-zinc-600"
                />
              </div>

              <div className="w-1/3">
                <label className="block mb-0.5 text-sm">Amount (₹) *</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-2 py-1.5 bg-zinc-800 rounded-md border border-zinc-600"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <div className="w-1/2">
                <label className="block mb-0.5 text-sm">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-2 py-1.5 bg-zinc-800 border border-zinc-600 rounded-md text-white"
                >
                  <option value="">Select Category</option>
                  {categoryOptions.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="w-1/2">
                <label className="block mb-0.5 text-sm text-white">
                  Date <span className="text-red-400">*</span>
                </label>
                <DatePicker
                  selected={date ? new Date(date) : null}
                  onChange={(date) => setDate(date.toISOString().split("T")[0])}
                  dateFormat="dd-MM-yyyy"
                  placeholderText="Select a date"
                  className="w-full px-2 py-1.5 text-sm bg-zinc-800 border rounded-md text-white focus:outline-none"
                  calendarClassName="custom-calendar"
                />
              </div>
            </div>

            <div>
              <label className="block mb-1 text-sm">Choose Icon</label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(iconOptions).map(([key, Icon]) => (
                  <button
                    key={key}
                    type="button"
                    className={`p-1.5 rounded-md w-8 h-8 flex items-center justify-center
                      ${icon === key ? "bg-blue-500 text-white" : "bg-neutral-800 text-white"}`}
                    onClick={() => setIcon(key)}
                  >
                    <Icon size={16} />
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between mt-4 gap-2">
              <button
                type="button"
                onClick={onClose}
                className="w-full bg-gray-600 hover:bg-gray-500 text-white font-semibold py-2 rounded-md"
              >
                Cancel
              </button>

              {isEditMode ? (
                <>
                  <button
                    type="button"
                    onClick={handleSave}
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-2 rounded-md"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowSchedule(true)}
                    className="w-full bg-green-500 hover:bg-green-600 text-black font-semibold py-2 rounded-md"
                  >
                    Schedule
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    const parsedAmount = parseFloat(amount)
                    if (isNaN(parsedAmount)) {
                      toast.error("Invalid amount")
                      return
                    }

                    useFinance.getState().addPendingItemToGroup(groupIndex, {
                      title: title.trim(),
                      amount: parsedAmount,
                      icon,
                      category,
                      date,
                    })
                    toast.success("Item added")
                    setTitle("")
                    setAmount("")
                    setCategory("")
                    setIcon("ReceiptIndianRupee")
                    setDate(new Date().toISOString().split("T")[0])
                    onClose()
                  }}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-2 rounded-md"
                >
                  Add Item
                </button>
              )}
            </div>
          </form>

          {/* Schedule Section */}
          {showSchedule && (
            <div className="mt-6 text-white text-sm space-y-3 border-t border-zinc-700 pt-4">
              <div>
                <label className="block text-sm mb-1">Schedule Group</label>
                <select
                  value={selectedScheduleGroup}
                  onChange={(e) => setSelectedScheduleGroup(parseInt(e.target.value))}
                  className="w-full px-2 py-1.5 bg-zinc-800 border border-zinc-600 rounded-md"
                >
                  {scheduleGroups.map((group, i) => (
                    <option key={i} value={i}>
                      {group.title || `Group ${i + 1}`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end gap-2">
              {/* Repeat Toggle */}
              <div className="flex flex-col gap-1">
                <label htmlFor="repeat-toggle" className="text-sm text-white mb-0.5">
                  Repeat Every Month
                </label>

                {/* ✅ This part aligns toggle + label */}
                <div className="flex items-center gap-2">
                  <button
                    id="repeat-toggle"
                    type="button"
                    role="switch"
                    aria-checked={repeat}
                    onClick={() => setRepeat(!repeat)}
                    className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors 
                      ${repeat ? "bg-blue-500" : "bg-zinc-600"}`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform 
                      ${repeat ? "translate-x-5" : "translate-x-1"}`}
                    />
                  </button>

                  {/* 👇 Appears inline with toggle */}
                  {repeat && (
                    <span className="text-xs text-white-400 font-medium">Select date</span>
                  )}
                </div>
              </div>


              {/* Repeat Until Date Picker (only shown if repeat is true) */}
              {repeat && (
                <div className="flex-1">
                  <DatePicker
                    selected={repeatEndDate ? new Date(repeatEndDate) : null}
                    onChange={(date) => setRepeatEndDate(date.toISOString().split("T")[0])}
                    dateFormat="dd-MM-yyyy"
                    placeholderText="Select end date"
                    className="w-full px-2 py-1.5 text-sm bg-zinc-800 border rounded-md text-white focus:outline-none"
                    calendarClassName="custom-calendar"
                  />
                </div>
              )}
              </div>

              <button
                onClick={handleSchedule}
                className="w-full mt-2 bg-green-500 hover:bg-green-600 text-black font-semibold py-2 rounded-md"
              >
                Confirm Schedule
              </button>
            </div>
          )}
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}
