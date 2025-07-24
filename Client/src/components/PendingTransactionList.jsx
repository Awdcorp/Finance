import React, { useState } from "react"
import useFinance from "../state/finance"
import AddScheduleModal from "./AddScheduleModal"
import AddPendingGroupModal from "./AddPendingGroupModal"
import AddPendingItemModal from "./AddPendingItemModal"

export default function PendingGroupList() {
  const pendingGroups = useFinance((state) => state.pendingGroups)
  const removePendingItemFromGroup = useFinance((state) => state.removePendingItemFromGroup)
  const renamePendingGroup = useFinance((state) => state.renamePendingGroup)
  const deletePendingGroup = useFinance((state) => state.deletePendingGroup)

  const [editInfo, setEditInfo] = useState(null)
  const [menuOpenIndex, setMenuOpenIndex] = useState(null)
  const [editGroupInfo, setEditGroupInfo] = useState(null)
  const [addItemGroupIndex, setAddItemGroupIndex] = useState(null)

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
                    onClick={() => setEditInfo({ groupIndex, itemIndex: i })}
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
                className="bg-yellow-500 hover:bg-yellow-600 text-black text-sm rounded-md py-2 font-semibold mt-2"
              >
                + Add Item
              </button>
            </div>
          </div>
        )
      })}

      {/* Add/Edit Item Modal */}
      {editInfo && (
        <AddScheduleModal
          isOpen={true}
          isEditMode={false}
          defaultValues={
            pendingGroups[editInfo.groupIndex].items[editInfo.itemIndex]
          }
          groupIndex={0}
          onSave={(itemData) => {
            useFinance.getState().addItemToGroup(0, {
              ...itemData,
              date: itemData.date || new Date().toISOString().split("T")[0],
            })
            removePendingItemFromGroup(editInfo.groupIndex, editInfo.itemIndex)
            setEditInfo(null)
          }}
          onClose={() => setEditInfo(null)}
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