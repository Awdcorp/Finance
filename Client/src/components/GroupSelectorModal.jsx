// ✅ GroupSelectorModal.jsx — Lets user pick a group when toggling draft mode

import React from "react"
import { Dialog } from "@headlessui/react"
import { X } from "lucide-react"

export default function GroupSelectorModal({
  isOpen,
  onClose,
  title = "Select Group",
  groupOptions = [], // [{ id, title }]
  onSelect,
}) {
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-3">
        <Dialog.Panel className="bg-zinc-900 rounded-lg w-full max-w-sm p-4 shadow-xl border border-zinc-700">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-base font-semibold text-white">
              {title}
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>

          <div className="space-y-2">
            {groupOptions.length === 0 ? (
              <p className="text-sm text-gray-400">No available groups</p>
            ) : (
              groupOptions.map((group) => (
                <button
                  key={group.id}
                  onClick={() => {
                    onSelect(group.id)
                    onClose()
                  }}
                  className="w-full px-3 py-2 text-left rounded-md bg-zinc-800 text-white hover:bg-blue-600 transition"
                >
                  {group.title || "Untitled Group"}
                </button>
              ))
            )}
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}
