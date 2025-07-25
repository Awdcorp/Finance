import React, { useState } from "react"
import { ChevronDown, Pencil, Trash2 } from "lucide-react"
import useFinance from "../state/finance"

export default function DashboardSelector() {
  const dashboards = useFinance((state) => state.dashboards)
  const currentDashboard = useFinance((state) => state.currentDashboard)
  const setCurrentDashboard = useFinance((state) => state.setCurrentDashboard)
  const addDashboard = useFinance((state) => state.addDashboard)
  const removeDashboard = useFinance((state) => state.removeDashboard)
  const renameDashboard = useFinance((state) => state.renameDashboard)

  const [isOpen, setIsOpen] = useState(false)

  const handleSelect = (name) => {
    setCurrentDashboard(name)
    setIsOpen(false)
  }

  const handleAdd = () => {
    const newName = prompt("Enter new dashboard name:")
    if (newName && !dashboards.includes(newName)) {
      addDashboard(newName)
      setCurrentDashboard(newName)
    }
  }

  const handleRename = (oldName) => {
    const newName = prompt("Enter new name:", oldName)
    if (!newName || newName === oldName) return
    renameDashboard(oldName, newName)
    if (currentDashboard === oldName) {
      setCurrentDashboard(newName)
    }
  }

  const handleDelete = (name) => {
    if (dashboards.length === 1) {
      alert("At least one dashboard must remain.")
      return
    }

    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      removeDashboard(name)
      if (name === currentDashboard) {
        setCurrentDashboard(dashboards.find((d) => d !== name) || dashboards[0])
      }
    }
  }

  return (
    <div className="relative text-left cursor-pointer z-50">
      <div onClick={() => setIsOpen(!isOpen)} className="flex flex-col items-start px-4">
        <div className="flex items-center gap-2 text-white text-lg font-semibold">
          <span>📒 {currentDashboard}</span>
          <ChevronDown size={16} />
        </div>
        <div className="text-sm text-gray-400 -mt-1">Monthly Balance</div>
      </div>

      {isOpen && (
        <div className="absolute top-14 left-4 w-60 bg-neutral-800 text-white rounded shadow p-2 border border-neutral-700 z-50">
          {dashboards.map((name, index) => (
            <div key={index} className="flex items-center justify-between px-2 py-1 rounded hover:bg-neutral-700">
              <span
                onClick={() => handleSelect(name)}
                className={`cursor-pointer ${name === currentDashboard ? "text-yellow-300" : ""}`}
              >
                {name}
              </span>
              <div className="flex gap-2">
                <Pencil
                  size={14}
                  onClick={() => handleRename(name)}
                  className="hover:text-yellow-300"
                />
                <Trash2
                  size={14}
                  onClick={() => handleDelete(name)}
                  className="hover:text-red-400"
                />
              </div>
            </div>
          ))}

          <hr className="my-2 border-neutral-600" />

          <div
            onClick={handleAdd}
            className="text-yellow-400 hover:text-yellow-300 px-2 py-1 rounded cursor-pointer"
          >
            ➕ Create New Budget
          </div>
        </div>
      )}
    </div>
  )
}
