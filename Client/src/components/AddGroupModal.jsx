// src/components/AddGroupModal.jsx
import React, { useState, useEffect } from "react"
import { Dialog } from "@headlessui/react"
import useFinance from "../state/finance"

export default function AddGroupModal({
  isOpen,
  onClose,
  isEditMode = false,
  initialTitle = "",
  onSaveCustom, // Optional override for editing mode
}) {
  const addScheduleGroup = useFinance((state) => state.addScheduleGroup)
  const [title, setTitle] = useState(initialTitle)

  // Reset title when modal opens or closes
  useEffect(() => {
    if (isOpen) setTitle(initialTitle)
  }, [isOpen, initialTitle])

  const handleSubmit = () => {
    const trimmed = title.trim()
    if (trimmed === "") return

    if (isEditMode && typeof onSaveCustom === "function") {
      onSaveCustom(trimmed)
    } else {
      addScheduleGroup({ title: trimmed, items: [] }) // Add mode
    }

    onClose()
  }

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/40" />
      <div className="fixed inset-0 flex items-center justify-center">
        <Dialog.Panel className="bg-neutral-800 p-6 rounded-xl text-white w-72">
          <Dialog.Title className="text-lg font-semibold mb-4">
            {isEditMode ? "Edit Group Title" : "Add New Block"}
          </Dialog.Title>

          <input
            className="w-full p-2 rounded bg-neutral-700 mb-4"
            placeholder="Enter group title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <div className="flex justify-end gap-2">
            <button
              onClick={onClose}
              className="text-sm px-3 py-1 bg-gray-600 rounded"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className={`text-sm px-3 py-1 rounded ${
                isEditMode ? "bg-blue-600" : "bg-green-600"
              }`}
            >
              {isEditMode ? "Save" : "Add"}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}
