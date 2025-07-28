import React, { useState, useRef, useEffect } from "react"
import {
  ChevronDown,
  Pencil,
  Trash2,
  PlusCircle,
  FileChartColumn,
} from "lucide-react"
import useFinance from "../state/finance"
import TextInputModal from "./TextInputModal"
import ConfirmDialog from "./ConfirmDialog"
import toast from "react-hot-toast"

export default function DashboardSelector() {
  const dashboards = useFinance((state) => state.dashboards) || []
  const currentDashboardId = useFinance((state) => state.currentDashboardId)
  const setCurrentDashboard = useFinance((state) => state.setCurrentDashboard)
  const addDashboard = useFinance((state) => state.addDashboard)
  const removeDashboard = useFinance((state) => state.removeDashboard)
  const renameDashboard = useFinance((state) => state.renameDashboard)

  const [isOpen, setIsOpen] = useState(false)
  const [renameModal, setRenameModal] = useState({ open: false, id: "", name: "" })
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [pendingDelete, setPendingDelete] = useState(null)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleSelect = (id) => {
    setCurrentDashboard(id)
    setIsOpen(false)
  }

  const handleRename = (id, name) => {
    setRenameModal({ open: true, id, name })
  }

  const handleDelete = (dashboard) => {
    if (dashboards.length === 1) {
      toast.error("At least one dashboard must remain.")
      return
    }
    setPendingDelete(dashboard)
  }

  const currentName = dashboards.find((d) => d.id === currentDashboardId)?.name || "Dashboard"

  return (
    <div ref={dropdownRef} className="relative text-center z-50">
      {/* Current Dashboard Display */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex flex-col items-center justify-center cursor-pointer"
      >
        <div className="flex items-center gap-2 text-white text-lg font-semibold">
          <FileChartColumn size={20} className="text-yellow-400" />
          <span>{currentName}</span>
          <ChevronDown size={16} className="text-white" />
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 w-64 bg-neutral-800 text-white rounded-xl shadow-lg p-2 border border-neutral-700">
          {dashboards.map((dash) => (
            <div
              key={dash.id}
              className="flex items-center justify-between px-3 py-2 rounded"
            >
              <span
                onClick={() => handleSelect(dash.id)}
                className={`cursor-pointer truncate ${
                  dash.id === currentDashboardId ? "text-yellow-300 font-semibold" : ""
                }`}
              >
                {dash.name}
              </span>
              <div className="flex gap-2">
                <Pencil
                  size={16}
                  onClick={() => handleRename(dash.id, dash.name)}
                  className="hover:text-yellow-300 cursor-pointer"
                />
                <Trash2
                  size={16}
                  onClick={() => handleDelete(dash)}
                  className="hover:text-red-400 cursor-pointer"
                />
              </div>
            </div>
          ))}

          <hr className="my-2 border-neutral-600" />

          {/* Add New */}
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
        initialValue={renameModal.name}
        confirmLabel="Save"
        onConfirm={(newName) => {
          renameDashboard(renameModal.id, newName)
          toast.success(`Dashboard renamed to "${newName}"`)
        }}
        validate={(name) => name.trim() !== ""}
        onClose={() => setRenameModal({ open: false, id: "", name: "" })}
      />

      {/* Create New Modal */}
      <TextInputModal
        isOpen={createModalOpen}
        title="Create New Dashboard"
        confirmLabel="Save"
        onConfirm={(name) => {
          addDashboard(name)
          toast.success(`Created new dashboard: "${name}"`)
        }}
        validate={(name) =>
          name.trim() !== "" && !dashboards.some((d) => d.name === name.trim())
        }
        errorMessage="Name must be unique and non-empty"
        onClose={() => setCreateModalOpen(false)}
      />

      {/* Confirm Delete */}
      <ConfirmDialog
        isOpen={!!pendingDelete}
        title="Delete Dashboard?"
        description={`Are you sure you want to delete "${pendingDelete?.name}"?`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={() => {
          removeDashboard(pendingDelete.id)
          toast.success(`"${pendingDelete.name}" dashboard deleted`)
          if (pendingDelete.id === currentDashboardId) {
            const next = dashboards.find((d) => d.id !== pendingDelete.id)
            if (next) setCurrentDashboard(next.id)
          }
          setPendingDelete(null)
        }}
        onCancel={() => {
          toast("Delete cancelled")
          setPendingDelete(null)
        }}
      />
    </div>
  )
}
