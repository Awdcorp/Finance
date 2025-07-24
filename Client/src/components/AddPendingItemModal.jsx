// src/components/AddPendingItemModal.jsx
import React, { useState, useEffect } from "react"
import { Dialog } from "@headlessui/react"
import useFinance from "../state/finance"
import toast from "react-hot-toast"

export default function AddPendingItemModal({
  isOpen,
  onClose,
  groupIndex = 0,
  defaultValues = null,
  isEditMode = false,
  onSave = null
}) {
  const [title, setTitle] = useState("")
  const [amount, setAmount] = useState("")
  const addPendingItemToGroup = useFinance((state) => state.addPendingItemToGroup)

  useEffect(() => {
    if (defaultValues) {
      setTitle(defaultValues.title || "")
      setAmount(defaultValues.amount?.toString() || "")
    } else {
      setTitle("")
      setAmount("")
    }
  }, [defaultValues])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title.trim() || !amount.trim()) {
      toast.error("Please fill in both fields")
      return
    }

    const parsedAmount = parseFloat(amount)
    if (isNaN(parsedAmount)) {
      toast.error("Amount must be a number")
      return
    }

    const item = {
      title: title.trim(),
      amount: parsedAmount,
      date: new Date().toISOString()
    }

    if (isEditMode && onSave) {
      onSave(item)
      toast.success("Item updated")
    } else {
      addPendingItemToGroup(groupIndex, item)
      toast.success("Item added")
    }

    onClose()
  }

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/40" />
      <div className="fixed inset-0 flex items-center justify-center">
        <Dialog.Panel className="bg-neutral-800 p-6 rounded-xl text-white w-72">
          <Dialog.Title className="text-lg font-semibold mb-4">
            {isEditMode ? "Edit Pending Item" : "Add Pending Item"}
          </Dialog.Title>

          <form onSubmit={handleSubmit} className="space-y-3">
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

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="text-sm px-3 py-1 bg-gray-600 rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="text-sm px-3 py-1 bg-yellow-500 text-black font-semibold rounded"
              >
                {isEditMode ? "Save" : "Add"}
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}
