import React, { useState, useEffect } from "react"
import { Dialog } from "@headlessui/react"

export default function TextInputModal({
  isOpen,
  onClose,
  title = "Enter Value",
  initialValue = "",
  confirmLabel = "Save",
  onConfirm,
  validate = () => true, // optional validation function
  errorMessage = "",     // optional custom error message
}) {
  const [value, setValue] = useState(initialValue)
  const [error, setError] = useState("")

  useEffect(() => {
    if (isOpen) {
      setValue(initialValue)
      setError("")
    }
  }, [isOpen, initialValue])

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
      <div className="fixed inset-0 bg-black/40" />
      <div className="fixed inset-0 flex items-center justify-center">
        <Dialog.Panel className="bg-neutral-800 p-6 rounded-xl text-white w-72">
          <Dialog.Title className="text-lg font-semibold mb-4">{title}</Dialog.Title>

          <input
            className="w-full p-2 rounded bg-neutral-700 mb-2"
            placeholder="Enter value"
            value={value}
            onChange={(e) => {
              setValue(e.target.value)
              setError("")
            }}
          />

          {error && <p className="text-sm text-red-400 mb-2">{error}</p>}

          <div className="flex justify-end gap-2">
            <button
              onClick={onClose}
              className="text-sm px-3 py-1 bg-gray-600 rounded"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isDisabled}
              className={`text-sm px-3 py-1 rounded ${
                isDisabled ? "bg-gray-500 cursor-not-allowed" : "bg-green-600"
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
