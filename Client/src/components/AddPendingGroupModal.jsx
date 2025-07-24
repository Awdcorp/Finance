import React, { useEffect, useState } from "react"
import { Dialog } from "@headlessui/react"
import useFinance from "../state/finance"
import toast from "react-hot-toast"

export default function AddPendingGroupModal({
  isOpen,
  onClose,
  isEditMode = false,
  initialTitle = "",
  onSaveCustom = null,
}) {
  const [title, setTitle] = useState("")
  const addPendingGroup = useFinance((state) => state.addPendingGroup)

  useEffect(() => {
    if (isEditMode) {
      setTitle(initialTitle || "")
    } else {
      setTitle("")
    }
  }, [isOpen, isEditMode, initialTitle])

  const handleSubmit = () => {
    const trimmed = title.trim()
    if (!trimmed) {
      toast.error("Title is required")
      return
    }

    if (isEditMode && onSaveCustom) {
      onSaveCustom(trimmed)
      toast.success("Group renamed")
    } else {
      addPendingGroup({ title: trimmed, items: [] })
      toast.success("Pending group added")
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
