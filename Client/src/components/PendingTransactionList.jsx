import React, { useState } from "react"
import useFinance from "../state/finance"
import { format } from "date-fns"
import AddScheduleModal from "./AddScheduleModal"

export default function PendingTransactionList() {
  const pendingItems = useFinance((state) => state.pendingItems)
  const removePendingItem = useFinance((state) => state.removePendingItem)

  const [newTitle, setNewTitle] = useState("")
  const [newAmount, setNewAmount] = useState("")
  const [editInfo, setEditInfo] = useState(null)  // { item, index }
  const [showModal, setShowModal] = useState(false)

  const handleAdd = () => {
    if (!newTitle.trim()) return
    useFinance.getState().addPendingItem({
      title: newTitle,
      amount: parseFloat(newAmount) || 0,
    })
    setNewTitle("")
    setNewAmount("")
  }

  const handleSchedule = (item, index) => {
    setEditInfo({ item, index })
    setShowModal(true)
  }

  return (
    <div className="px-4 mt-6">
      <h2 className="text-sm text-gray-400 mb-2">Pending Transactions</h2>

      {/* Input */}
      <div className="flex flex-col gap-2 mb-4">
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="e.g. Pay Aman"
          className="rounded-lg px-3 py-2 bg-zinc-800 text-white text-sm border border-zinc-700"
        />
        <input
          type="number"
          value={newAmount}
          onChange={(e) => setNewAmount(e.target.value)}
          placeholder="Amount (optional)"
          className="rounded-lg px-3 py-2 bg-zinc-800 text-white text-sm border border-zinc-700"
        />
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg"
        >
          Add Pending
        </button>
      </div>

      {/* Pending List */}
      <div className="flex flex-col gap-3">
        {pendingItems.length === 0 ? (
          <div className="text-xs text-gray-500 italic">No pending items</div>
        ) : (
          pendingItems.map((item, index) => (
            <div
              key={index}
              className="bg-zinc-800 px-4 py-3 rounded-xl flex flex-col gap-1"
            >
              <div className="flex justify-between items-center">
                <span className="text-white font-medium">{item.title}</span>
                <span className="text-green-400 text-sm">
                  {item.amount.toFixed(2)} €
                </span>
              </div>
              <div className="flex gap-3 text-xs mt-2">
                <button
                  className="text-blue-400 underline"
                  onClick={() => handleSchedule(item, index)}
                >
                  ➕ Schedule
                </button>
                <button
                  className="text-red-400 underline"
                  onClick={() => removePendingItem(index)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Schedule Modal */}
      {showModal && editInfo && (
        <AddScheduleModal
          isOpen={showModal}                             // ✅ Pass as boolean
          defaultValues={editInfo?.item || {}} 
          onClose={() => {
            setShowModal(false)
            setEditInfo(null)
          }}
          onSave={(finalItem) => {
            useFinance.getState().addItemToGroup(0, {
              ...finalItem,
              isDraft: false,
              date: finalItem.date || new Date().toISOString().split("T")[0],
            })
            useFinance.getState().removePendingItem(editInfo.index)
            setShowModal(false)
            setEditInfo(null)
          }}
        />
      )}
    </div>
  )
}
