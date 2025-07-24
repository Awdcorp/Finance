import React, { useState } from "react"
import useFinance from "../state/finance"
import AddScheduleModal from "./AddScheduleModal"
import AddPendingGroupModal from "./AddPendingGroupModal"
import AddPendingItemModal from "./AddPendingItemModal"
import { Dialog } from "@headlessui/react"

export default function PendingGroupList() {
  const pendingGroups = useFinance((state) => state.pendingGroups)
  const removePendingItemFromGroup = useFinance((state) => state.removePendingItemFromGroup)
  const renamePendingGroup = useFinance((state) => state.renamePendingGroup)
  const deletePendingGroup = useFinance((state) => state.deletePendingGroup)

  const [editInfo, setEditInfo] = useState(null)
  const [menuOpenIndex, setMenuOpenIndex] = useState(null)
  const [editGroupInfo, setEditGroupInfo] = useState(null)
  const [addItemGroupIndex, setAddItemGroupIndex] = useState(null)
  const [selectedItem, setSelectedItem] = useState(null)
  const [actionChoice, setActionChoice] = useState(null)

  return (
    <div className="px-4 mt-4 relative">
      {pendingGroups.map((group, groupIndex) => {
        const groupItems = group.items || []
        const totalAmount = groupItems.reduce((acc, item) => acc + item.amount, 0)

        return (
          <div key={groupIndex} className="mb-6 relative">
            {/* Group Header */}
            <div className="flex justify-between items-center text-sm text-gray-400 mb-2 px-1">
              <div className="flex items-center gap-2">
                <span className="uppercase">{group.title || "Untitled"}</span>
                <span className="text-red-400 font-semibold text-xs">
                  {totalAmount.toFixed(2)} €
                </span>
              </div>

              <div className="relative">
                <button
                  onClick={() =>
                    setMenuOpenIndex(menuOpenIndex === groupIndex ? null : groupIndex)
                  }
                  className="text-gray-400 hover:text-white text-lg px-2"
                >
                  ⋮
                </button>

                {menuOpenIndex === groupIndex && (
                  <div className="absolute right-0 mt-2 w-40 bg-neutral-800 shadow-lg rounded-lg z-10 border border-neutral-700">
                    <button
                      className="block w-full text-left px-4 py-2 hover:bg-neutral-700 text-sm text-yellow-400"
                      onClick={() => {
                        setEditGroupInfo({ index: groupIndex, title: group.title })
                        setMenuOpenIndex(null)
                      }}
                    >
                      Rename
                    </button>
                    <button
                      className="block w-full text-left px-4 py-2 hover:bg-neutral-700 text-sm text-red-400"
                      onClick={() => {
                        if (confirm("Are you sure you want to delete this group?")) {
                          deletePendingGroup(groupIndex)
                          setMenuOpenIndex(null)
                        }
                      }}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Group Card */}
            <div className="bg-neutral-800 rounded-xl p-4 flex flex-col gap-3">
              {groupItems.length === 0 ? (
                <div className="text-center text-gray-500 text-sm italic">
                  No items in this group yet
                </div>
              ) : (
                groupItems.map((item, i) => (
                  <div
                    key={i}
                    className="py-3 flex justify-between items-start text-sm cursor-pointer border-b border-neutral-700 last:border-b-0"
                    onClick={() => setSelectedItem({ groupIndex, itemIndex: i })}
                  >
                    {/* Left */}
                    <div className="flex gap-3 items-start">
                      <span className="text-xl">{item.icon || "📝"}</span>
                      <div className="text-white">
                        <div className="font-medium">{item.title}</div>
                      </div>
                    </div>

                    {/* Right */}
                    <div className="text-right space-y-1">
                      <div className="text-xs text-gray-400">Unscheduled</div>
                      <div
                        className={`text-sm font-semibold px-2 py-1 rounded-md inline-block ${
                          item.amount < 0
                            ? "bg-red-500/20 text-red-400"
                            : "bg-green-500/20 text-green-400"
                        }`}
                      >
                        {item.amount.toFixed(2)} €
                      </div>
                    </div>
                  </div>
                ))
              )}

              <button
                onClick={() => setAddItemGroupIndex(groupIndex)}
                className="text-yellow-400 hover:text-yellow-300 text-sm mt-2"
              >
                + Add Item
              </button>
            </div>
          </div>
        )
      })}

      {/* Choose Action Popup */}
      {selectedItem && (
        <Dialog open={true} onClose={() => setSelectedItem(null)} className="relative z-50">
          <div className="fixed inset-0 bg-black/40" />
          <div className="fixed inset-0 flex items-center justify-center">
            <Dialog.Panel className="bg-neutral-800 p-6 rounded-xl text-white w-72">
              <Dialog.Title className="text-lg font-semibold mb-4">What do you want to do?</Dialog.Title>
              <div className="space-y-3">
                <button
                  className="w-full bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded text-left"
                  onClick={() => {
                    setActionChoice("edit")
                    setEditInfo(selectedItem)
                    setSelectedItem(null)
                  }}
                >
                  ✏️ Edit this draft
                </button>
                <button
                  className="w-full bg-red-600 hover:bg-red-500 px-4 py-2 rounded text-left text-white font-semibold"
                  onClick={() => {
                    const { groupIndex, itemIndex } = selectedItem
                    if (confirm("Are you sure you want to delete this draft?")) {
                      removePendingItemFromGroup(groupIndex, itemIndex)
                      setSelectedItem(null)
                    }
                  }}
                >
                  🗑️ Delete this draft
                </button>

                <button
                  className="w-full text-sm text-gray-400 underline mt-1"
                  onClick={() => setSelectedItem(null)}
                >
                  Cancel
                </button>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      )}

      {/* Add/Edit Item Modal */}
      {editInfo && actionChoice === "edit" && (
        <AddPendingItemModal
          isOpen={true}
          isEditMode={true}
          defaultValues={pendingGroups[editInfo.groupIndex].items[editInfo.itemIndex]}
          onSave={(updatedItem) => {
            const { editPendingItemInGroup } = useFinance.getState()
            editPendingItemInGroup(editInfo.groupIndex, editInfo.itemIndex, updatedItem)
            setEditInfo(null)
            setActionChoice(null)
          }}
          onClose={() => {
            setEditInfo(null)
            setActionChoice(null)
          }}
        />
      )}

      {editInfo && actionChoice === "schedule" && (
        <AddScheduleModal
          isOpen={true}
          defaultValues={pendingGroups[editInfo.groupIndex].items[editInfo.itemIndex]}
          onSave={(scheduledItem) => {
            const { addItemToGroup, removePendingItemFromGroup } = useFinance.getState()
            addItemToGroup(0, scheduledItem)
            removePendingItemFromGroup(editInfo.groupIndex, editInfo.itemIndex)
            setEditInfo(null)
            setActionChoice(null)
          }}
          onClose={() => {
            setEditInfo(null)
            setActionChoice(null)
          }}
        />
      )}

      {/* Add New Pending Item Popup */}
      {typeof addItemGroupIndex === "number" && (
        <AddPendingItemModal
          isOpen={true}
          onClose={() => setAddItemGroupIndex(null)}
          onSave={(newItem) => {
            useFinance.getState().addPendingItemToGroup(addItemGroupIndex, newItem)
            setAddItemGroupIndex(null)
          }}
        />
      )}

      {/* Rename Group Modal */}
      {editGroupInfo && (
        <AddPendingGroupModal
          isOpen={true}
          isEditMode={true}
          initialTitle={editGroupInfo.title}
          onSaveCustom={(newTitle) => {
            renamePendingGroup(editGroupInfo.index, newTitle)
            setEditGroupInfo(null)
          }}
          onClose={() => setEditGroupInfo(null)}
        />
      )}
    </div>
  )
}
