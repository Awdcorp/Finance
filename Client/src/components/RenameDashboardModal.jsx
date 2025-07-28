import React, { useState, useEffect } from "react"
import { Dialog } from "@headlessui/react"

export default function RenameDashboardModal({
  isOpen,
  onClose,
  initialName = "",
  onRename,
  existingNames = [], // ✅ Optional: prevent duplicates
}) {
  const [newName, setNewName] = useState(initialName)
  const [error, setError] = useState("")

  // ✅ Reset input on open
  useEffect(() => {
    if (isOpen) {
      setNewName(initialName)
      setError("")
    }
  }, [isOpen, initialName])

  // ✅ Submit handler
  const handleSubmit = () => {
    const trimmed = newName.trim()
    if (trimmed === "") {
      setError("Name cannot be empty.")
      return
    }
    if (trimmed !== initialName && existingNames.includes(trimmed)) {
      setError("Name already exists.")
      return
    }
    onRename(trimmed)
    onClose()
  }

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      {/* Background overlay */}
      <div className="fixed inset-0 bg-black/40" />
      
      {/* Centered modal panel */}
      <div className="fixed inset-0 flex items-center justify-center">
        <Dialog.Panel className="bg-neutral-800 p-6 rounded-xl text-white w-72 border border-neutral-600">
          <Dialog.Title className="text-lg font-semibold mb-4">
            Rename Dashboard
          </Dialog.Title>

          {/* Input field */}
          <input
            className="w-full p-2 rounded bg-neutral-700 mb-2 border border-zinc-600 text-white"
            placeholder="Enter new name"
            value={newName}
            onChange={(e) => {
              setNewName(e.target.value)
              setError("")
            }}
          />

          {/* Error message */}
          {error && <p className="text-sm text-red-400 mb-2">{error}</p>}

          {/* Action buttons */}
          <div className="flex justify-end gap-2">
            <button
              onClick={onClose}
              className="text-sm px-3 py-1 bg-gray-600 hover:bg-gray-500 rounded"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="text-sm px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded"
            >
              Save
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}
