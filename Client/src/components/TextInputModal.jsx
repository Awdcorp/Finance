import React, { useState, useEffect } from "react"
import { Dialog } from "@headlessui/react"

export default function TextInputModal({
  isOpen,
  onClose,
  title = "Enter Value",
  initialValue = "",
  confirmLabel = "Save",
  onConfirm,
  validate = () => true,        // Optional validation function
  errorMessage = "",            // Optional custom error message
}) {
  const [value, setValue] = useState(initialValue)
  const [error, setError] = useState("")

  // 🔁 Reset input and error when modal opens
  useEffect(() => {
    if (isOpen) {
      setValue(initialValue)
      setError("")
    }
  }, [isOpen, initialValue])

  // ✅ Handle submit logic
  const handleSubmit = () => {
    const trimmed = value.trim()
    if (!validate(trimmed)) {
      setError(errorMessage || "Invalid input")
      return
    }
    onConfirm(trimmed)
    onClose()
  }

  const isDisabled = !validate(value.trim())

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/40" />
      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center">
        <Dialog.Panel className="bg-neutral-800 p-6 rounded-xl text-white w-72 border border-zinc-600 shadow-lg">
          <Dialog.Title className="text-lg font-semibold mb-4">
            {title}
          </Dialog.Title>

          <input
            className="w-full p-2 rounded bg-neutral-700 border border-neutral-600 mb-2 text-white"
            placeholder="Enter value"
            value={value}
            onChange={(e) => {
              setValue(e.target.value)
              setError("")
            }}
          />

          {/* Error message */}
          {error && (
            <p className="text-sm text-red-400 mb-2">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2 mt-2">
            <button
              onClick={onClose}
              className="text-sm px-3 py-1 bg-gray-600 hover:bg-gray-500 rounded"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isDisabled}
              className={`text-sm px-3 py-1 rounded ${
                isDisabled
                  ? "bg-gray-500 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-500"
              }`}
            >
              {confirmLabel}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}
