import React, { useState, useRef, useEffect } from "react"
import {
  ChevronDown,
  Pencil,
  Trash2,
  PlusCircle,
  FileChartColumn , 
} from "lucide-react"
import useFinance from "../state/finance"
import TextInputModal from "./TextInputModal"
import ConfirmDialog from "./ConfirmDialog"

export default function DashboardSelector() {
  const dashboards = useFinance((state) => state.dashboards)
  const currentDashboard = useFinance((state) => state.currentDashboard)
  const setCurrentDashboard = useFinance((state) => state.setCurrentDashboard)
  const addDashboard = useFinance((state) => state.addDashboard)
  const removeDashboard = useFinance((state) => state.removeDashboard)
  const renameDashboard = useFinance((state) => state.renameDashboard)

  const [isOpen, setIsOpen] = useState(false)
  const [renameModal, setRenameModal] = useState({ open: false, oldName: "" })
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [pendingDelete, setPendingDelete] = useState(null)
  const dropdownRef = useRef(null)

   useEffect(() => {
  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsOpen(false)
    }
  }

  if (isOpen) {
    document.addEventListener("mousedown", handleClickOutside)
  } else {
    document.removeEventListener("mousedown", handleClickOutside)
  }

  return () => {
    document.removeEventListener("mousedown", handleClickOutside)
  }
}, [isOpen])

  const handleSelect = (name) => {
    setCurrentDashboard(name)
    setIsOpen(false)
  }

  const handleRename = (oldName) => {
    setRenameModal({ open: true, oldName })
  }

  const handleDelete = (name) => {
    if (dashboards.length === 1) {
      alert("At least one dashboard must remain.")
      return
    }
    setPendingDelete(name)
  }

  return (
    <div ref={dropdownRef} className="relative text-center z-50">
      {/* Centered Selector */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex flex-col items-center justify-center cursor-pointer"
      >
        <div className="flex items-center gap-2 text-white text-lg font-semibold">
          <FileChartColumn size={20} className="text-yellow-400" />
          <span>{currentDashboard}</span>
          <ChevronDown size={16} className="text-white" />
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 w-64 bg-neutral-800 text-white rounded-xl shadow-lg p-2 border border-neutral-700">
          {dashboards.map((name, index) => (
            <div
              key={index}
              className="flex items-center justify-between px-3 py-2 rounded"
            >
              <span
                onClick={() => handleSelect(name)}
                className={`cursor-pointer truncate ${
                  name === currentDashboard
                    ? "text-yellow-300 font-semibold"
                    : ""
                }`}
              >
                {name}
              </span>
              <div className="flex gap-2">
                <Pencil
                  size={16}
                  onClick={() => handleRename(name)}
                  className="hover:text-yellow-300 cursor-pointer"
                />
                <Trash2
                  size={16}
                  onClick={() => handleDelete(name)}
                  className="hover:text-red-400 cursor-pointer"
                />
              </div>
            </div>
          ))}

          <hr className="my-2 border-neutral-600" />

          <div
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center gap-2 justify-center text-white hover:text-yellow-300 py-2 cursor-pointer"
          >
            <PlusCircle size={16} />
            <span>Create New Budget</span>
          </div>
        </div>
      )}

      {/* Rename Modal */}
      <TextInputModal
        isOpen={renameModal.open}
        title="Rename Dashboard"
        initialValue={renameModal.oldName}
        confirmLabel="Save"
        onConfirm={(newName) => {
          renameDashboard(renameModal.oldName, newName)
          if (renameModal.oldName === currentDashboard) {
            setCurrentDashboard(newName)
          }
        }}
        validate={(name) => name.trim() !== ""}
        onClose={() => setRenameModal({ open: false, oldName: "" })}
      />

      {/* Create Modal */}
      <TextInputModal
        isOpen={createModalOpen}
        title="Create New Dashboard"
        confirmLabel="Save"
        onConfirm={(name) => {
          addDashboard(name)
          setCurrentDashboard(name)
        }}
        validate={(name) =>
          name.trim() !== "" && !dashboards.includes(name.trim())
        }
        errorMessage="Name must be unique and non-empty"
        onClose={() => setCreateModalOpen(false)}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={!!pendingDelete}
        title="Delete Dashboard?"
        description={`Are you sure you want to delete "${pendingDelete}"?`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={() => {
          removeDashboard(pendingDelete)
          if (pendingDelete === currentDashboard) {
            setCurrentDashboard(
              dashboards.find((d) => d !== pendingDelete) || dashboards[0]
            )
          }
          setPendingDelete(null)
        }}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  )
}
