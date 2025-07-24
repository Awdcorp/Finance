import React, { useState } from "react"
import useFinance from "../state/finance"
import AddScheduleModal from "./AddScheduleModal"
import AddGroupModal from "./AddGroupModal"

export default function ScheduleList({ items = [] }) {
  const scheduleGroups = useFinance((state) => state.scheduleGroups)
  const editItemInGroup = useFinance((state) => state.editItemInGroup)
  const addItemToGroup = useFinance((state) => state.addItemToGroup)
  const deleteItemFromGroup = useFinance((state) => state.deleteItemFromGroup)
  const renameGroup = useFinance((state) => state.renameGroup)
  const deleteGroup = useFinance((state) => state.deleteGroup)

  const [editInfo, setEditInfo] = useState(null)
  const [menuOpenIndex, setMenuOpenIndex] = useState(null)
  const [editGroupInfo, setEditGroupInfo] = useState(null)

  return (
    <div className="px-4 mt-4 relative">
      {scheduleGroups.map((group, groupIndex) => {
        // Show both real + repeated items by matching groupIndex
        const groupItems = items.filter((item) => item.groupIndex === groupIndex)
        const totalAmount = groupItems.reduce((acc, item) => acc + item.amount, 0)

        return (
          <div key={groupIndex} className="mb-6 relative">
            {/* Section Header */}
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
                          deleteGroup(groupIndex)
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
                groupItems.map((item, i) => {
                  const realItemIndex = scheduleGroups[groupIndex].items.findIndex((stored) => {
                    const original = item.originalDate || item.date
                    return stored.date === original
                    });

                  return (
                    <div
                      key={i}
                      className="py-3 flex justify-between items-start text-sm cursor-pointer border-b border-neutral-700 last:border-b-0"
                      onClick={() => {
                        // Only allow editing if item is original, not generated
                        if (realItemIndex !== -1) {
                          setEditInfo({ groupIndex, itemIndex: realItemIndex });
                        }
                      }}
                    >
                      {/* Left */}
                      <div className="flex gap-3 items-start">
                        <span className="text-xl">{item.icon}</span>
                        <div className="text-white">
                          <div className="font-medium">{item.title}</div>
                        </div>
                      </div>

                      {/* Right */}
                      <div className="text-right space-y-1">
                        <div className="text-xs text-gray-400">{item.date}</div>
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
                  );
                })
              )}

              {/* Add New Item Button */}
              <button
                className="text-yellow-400 hover:text-yellow-300 text-sm mt-2"
                onClick={() => setEditInfo({ groupIndex, itemIndex: null })}
              >
                + Add Item
              </button>
            </div>
          </div>
        );
      })}

      {/* Add/Edit Item Modal */}
      {editInfo && (
        <AddScheduleModal
          isOpen={true}
          isEditMode={editInfo.itemIndex != null}
          defaultValues={
            editInfo.itemIndex != null
              ? scheduleGroups[editInfo.groupIndex].items[editInfo.itemIndex]
              : {
                  title: "",
                  amount: 0,
                  date: "",
                  icon: "💰",
                  category: "",
                  repeat: false,
                  repeatEndDate: "",
                }
          }
          groupIndex={editInfo.groupIndex}
          onSave={(itemData) => {
            if (editInfo.itemIndex != null) {
              editItemInGroup(editInfo.groupIndex, editInfo.itemIndex, itemData)
            } else {
              addItemToGroup(editInfo.groupIndex, itemData)
            }
            setEditInfo(null)
          }}
          onDelete={
            editInfo.itemIndex != null
              ? () => {
                  deleteItemFromGroup(editInfo.groupIndex, editInfo.itemIndex)
                  setEditInfo(null)
                }
              : undefined
          }
          onClose={() => setEditInfo(null)}
        />
      )}

      {/* Rename Group Modal */}
      {editGroupInfo && (
        <AddGroupModal
          isOpen={true}
          isEditMode={true}
          initialTitle={editGroupInfo.title}
          onSaveCustom={(newTitle) => {
            renameGroup(editGroupInfo.index, newTitle)
            setEditGroupInfo(null)
          }}
          onClose={() => setEditGroupInfo(null)}
        />
      )}
    </div>
  );
}
