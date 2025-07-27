import React, { useState, useRef, useEffect } from "react"
import useFinance from "../state/finance"
import AddScheduleModal from "./AddScheduleModal"
import TextInputModal from "./TextInputModal"
import ConfirmDialog from "./ConfirmDialog"
import AddPendingItemModal from "./AddPendingItemModal"
import { iconMap, categoryIcons, categoryColors } from "../constants/categories"
import { Dialog } from "@headlessui/react"
import {
  Pencil,
  Trash2,
  Edit3,
  MoreVertical,
  FileClock,
  CirclePlus,IndianRupee,ReceiptIndianRupee,
} from "lucide-react"
import toast from "react-hot-toast"

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
  const [deleteGroupIndex, setDeleteGroupIndex] = useState(null)
  const [deleteDraftInfo, setDeleteDraftInfo] = useState(null)

  const menuRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpenIndex(null)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

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
                  <span
                    className={`font-semibold text-xs inline-flex items-center gap-1 ${
                      totalAmount < 0 ? "text-red-400" : "text-green-400"
                    }`}
                  >
                    <IndianRupee size={12} />
                    {totalAmount.toFixed(2)}
                  </span>
              </div>

              <div className="relative">
                <button
                  onClick={() =>
                    setMenuOpenIndex(menuOpenIndex === groupIndex ? null : groupIndex)
                  }
                  className="text-gray-400 hover:text-white px-2"
                >
                  <MoreVertical size={18} />
                </button>

                {menuOpenIndex === groupIndex && (
                  <div
                    ref={menuRef}
                    className="absolute right-0 mt-2 w-40 bg-neutral-800 shadow-lg rounded-lg z-10 border border-neutral-700"
                  >
                    <button
                      className="flex items-center w-full text-left px-4 py-2 hover:bg-neutral-700 text-sm text-yellow-400"
                      onClick={() => {
                        setEditGroupInfo({ index: groupIndex, title: group.title })
                        setMenuOpenIndex(null)
                      }}
                    >
                      <Edit3 size={14} className="mr-2" />
                      Rename
                    </button>
                    <button
                      className="flex items-center w-full text-left px-4 py-2 hover:bg-neutral-700 text-sm text-red-400"
                      onClick={() => {
                        setDeleteGroupIndex(groupIndex)
                        setMenuOpenIndex(null)
                      }}
                    >
                      <Trash2 size={14} className="mr-2" />
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
                  No pending items in this group yet
                </div>
              ) : (
                groupItems.map((item, i) => (
                <div
                  key={i}
                  className="py-3 flex justify-between items-start text-sm cursor-pointer border-b border-neutral-700 last:border-b-0"
                  onClick={() => setSelectedItem({ groupIndex, itemIndex: i })}
                >
                  <div className="flex gap-3 items-center">
                    <div className="text-xl">
                      {iconMap[item.icon] || <ReceiptIndianRupee size={20} className="text-yellow-400" />}
                    </div>
                    <div className="text-white flex flex-col items-start">
                      <span className="font-medium">{item.title}</span>
                      {item.category && (
                        <span
                          className={`text-xs capitalize px-2 py-0.5 rounded w-fit mt-1 ${
                            categoryColors[item.category?.toLowerCase()] || "bg-neutral-700 text-gray-300"
                          }`}
                        >
                          {item.category}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="text-xs text-gray-400">
                      Unscheduled
                      {item.date && (
                        <>
                          {" • "}
                          {new Date(item.date).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </>
                      )}
                    </div>

                    <div
                      className={`text-sm font-semibold px-2 py-1 rounded-md inline-flex items-center ${
                        item.amount < 0
                          ? "bg-red-500/20 text-red-400"
                          : "bg-green-500/20 text-green-400"
                      }`}
                    >
                      <IndianRupee size={14} />
                      {item.amount.toFixed(2)}
                    </div>
                  </div>
                </div>
                ))
              )}

              <button
                onClick={() => setAddItemGroupIndex(groupIndex)}
                className="text-white-400 hover:text-yellow-300 text-sm mt-2 flex items-center gap-2"
              >
                <CirclePlus size={16} />
                <span>Add Item</span>
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
              <Dialog.Title className="text-lg font-semibold mb-4">
                What do you want to do?
              </Dialog.Title>
              <div className="space-y-3">
                <button
                  className="w-full flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded text-left"
                  onClick={() => {
                    setActionChoice("edit")
                    setEditInfo(selectedItem)
                    setSelectedItem(null)
                  }}
                >
                  <Pencil size={16} />
                  <span>Edit this draft</span>
                </button>

                <button
                  className="w-full flex items-center gap-2 bg-red-600 hover:bg-red-500 px-4 py-2 rounded text-left text-white font-semibold"
                  onClick={() => {
                    setDeleteDraftInfo(selectedItem)
                    setSelectedItem(null)
                  }}
                >
                  <Trash2 size={16} />
                  <span>Delete this draft</span>
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
          groupIndex={editInfo.groupIndex}
          itemIndex={editInfo.itemIndex}   
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

      {/* Add New Pending Item Modal */}
      {typeof addItemGroupIndex === "number" && (
        <AddPendingItemModal
          isOpen={true}
          groupIndex={addItemGroupIndex}
          onClose={() => setAddItemGroupIndex(null)}
          onSave={(newItem) => {
            useFinance.getState().addPendingItemToGroup(addItemGroupIndex, newItem)
            toast.success("Item added")
            setAddItemGroupIndex(null)
          }}
        />
      )}

      {/* Rename Group Modal */}
      {editGroupInfo && (
        <TextInputModal
          isOpen={!!editGroupInfo}
          title="Rename Group"
          initialValue={editGroupInfo?.title || ""}
          confirmLabel="Save"
          validate={(val) => val.trim() !== ""}
          onConfirm={(newTitle) => {
            renamePendingGroup(editGroupInfo.index, newTitle)
            toast.success("Group renamed")
            setEditGroupInfo(null)
          }}
          onClose={() => setEditGroupInfo(null)}
        />
      )}

      {/* Confirm Group Delete */}
      {typeof deleteGroupIndex === "number" && (
        <ConfirmDialog
          isOpen={true}
          title="Delete this group?"
          description="All unsaved items in this group will be lost."
          confirmLabel="Delete"
          onConfirm={() => {
            deletePendingGroup(deleteGroupIndex)
            toast.success("Group deleted")
            setDeleteGroupIndex(null)
          }}
          onCancel={() => setDeleteGroupIndex(null)}
        />
      )}

      {/* Confirm Draft Delete */}
      {deleteDraftInfo && (
        <ConfirmDialog
          isOpen={true}
          title="Delete this draft?"
          description="This will remove the unscheduled transaction permanently."
          confirmLabel="Delete"
          onConfirm={() => {
            const { groupIndex, itemIndex } = deleteDraftInfo
            removePendingItemFromGroup(groupIndex, itemIndex)
            toast.success("Item deleted")
            setDeleteDraftInfo(null)
          }}
          onCancel={() => setDeleteDraftInfo(null)}
        />
      )}
    </div>
  )
}
