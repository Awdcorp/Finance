import React, { useState, useEffect } from "react"
import { Dialog } from "@headlessui/react"

export default function RenameDashboardModal({
  isOpen,
  onClose,
  initialName = "",
  onRename,
}) {
  const [newName, setNewName] = useState(initialName)

  // Reset input when modal opens
  useEffect(() => {
    if (isOpen) setNewName(initialName)
  }, [isOpen, initialName])

  const handleSubmit = () => {
    const trimmed = newName.trim()
    if (trimmed === "") return
    onRename(trimmed)
    onClose()
  }

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/40" />
      {/* Centered modal */}
      <div className="fixed inset-0 flex items-center justify-center">
        <Dialog.Panel className="bg-neutral-800 p-6 rounded-xl text-white w-72">
          <Dialog.Title className="text-lg font-semibold mb-4">
            Rename Dashboard
          </Dialog.Title>

          <input
            className="w-full p-2 rounded bg-neutral-700 mb-4"
            placeholder="Enter new name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
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
              className="text-sm px-3 py-1 bg-blue-600 rounded"
            >
              Save
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}
