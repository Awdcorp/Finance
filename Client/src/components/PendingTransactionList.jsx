// ✅ Updated PendingGroupList to work with unified ID-based structure
// Uses scheduleGroups with isPending: true instead of separate pendingGroups
// Handles edit, delete, and add operations using groupId/itemId (not index-based)

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
  CirclePlus,
  IndianRupee,
  ReceiptIndianRupee,
} from "lucide-react"
import toast from "react-hot-toast"

export default function PendingGroupList({ selectedDate }) {
  const scheduleGroups = useFinance((state) => state.scheduleGroups)
  const removeItem = useFinance((state) => state.deleteItemFromGroup)
  const renameGroup = useFinance((state) => state.renameGroup)
  const deleteGroup = useFinance((state) => state.deleteGroup)
  const addItem = useFinance((state) => state.addItemToGroup)
  const editItem = useFinance((state) => state.editItemInGroup)

  const [editInfo, setEditInfo] = useState(null)
  const [menuOpenId, setMenuOpenId] = useState(null)
  const [editGroupInfo, setEditGroupInfo] = useState(null)
  const [addItemGroupId, setAddItemGroupId] = useState(null)
  const [selectedItem, setSelectedItem] = useState(null)
  const [actionChoice, setActionChoice] = useState(null)
  const [deleteGroupId, setDeleteGroupId] = useState(null)
  const [deleteDraftInfo, setDeleteDraftInfo] = useState(null)
  const menuRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpenId(null)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="px-4 mt-4 relative">
      {Object.values(scheduleGroups).filter((g) => g.isPending).map((group) => {
        const groupItems = Object.values(group.items || {})
        const totalAmount = groupItems.reduce((acc, item) => acc + item.amount, 0)

        return (
          <div key={group.id} className="mb-6 relative">
            {/* Header */}
            <div className="flex justify-between items-center text-sm text-gray-400 mb-2 px-1">
              <div className="flex items-center gap-2">
                <span className="uppercase">{group.title || "Untitled"}</span>
                <span className={`font-semibold text-xs inline-flex items-center gap-1 ${totalAmount < 0 ? "text-red-400" : "text-green-400"}`}>
                  <IndianRupee size={12} />
                  {totalAmount.toFixed(2)}
                </span>
              </div>
              <div className="relative">
                <button onClick={() => setMenuOpenId(menuOpenId === group.id ? null : group.id)} className="text-gray-400 hover:text-white px-2">
                  <MoreVertical size={18} />
                </button>
                {menuOpenId === group.id && (
                  <div ref={menuRef} className="absolute right-0 mt-2 w-40 bg-neutral-800 shadow-lg rounded-lg z-10 border border-neutral-700">
                    <button className="flex items-center w-full text-left px-4 py-2 hover:bg-neutral-700 text-sm text-yellow-400" onClick={() => {
                      setEditGroupInfo({ id: group.id, title: group.title })
                      setMenuOpenId(null)
                    }}>
                      <Edit3 size={14} className="mr-2" /> Rename
                    </button>
                    <button className="flex items-center w-full text-left px-4 py-2 hover:bg-neutral-700 text-sm text-red-400" onClick={() => {
                      setDeleteGroupId(group.id)
                      setMenuOpenId(null)
                    }}>
                      <Trash2 size={14} className="mr-2" /> Delete
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Group Card */}
            <div className="bg-neutral-800 rounded-xl p-4 flex flex-col gap-3">
              {groupItems.length === 0 ? (
                <div className="text-center text-gray-500 text-sm italic">No pending items in this group yet</div>
              ) : (
                groupItems.map((item) => (
                  <div key={item.id} className="py-3 flex justify-between items-start text-sm cursor-pointer border-b border-neutral-700 last:border-b-0" onClick={() => setSelectedItem({ groupId: group.id, itemId: item.id })}>
                    <div className="flex gap-3 items-center">
                      <div className="text-xl">{iconMap[item.icon] || <ReceiptIndianRupee size={20} className="text-yellow-400" />}</div>
                      <div className="text-white flex flex-col items-start">
                        <span className="font-medium">{item.title}</span>
                        {item.category && (
                          <span className={`text-xs capitalize px-2 py-0.5 rounded w-fit mt-1 ${categoryColors[item.category?.toLowerCase()] || "bg-neutral-700 text-gray-300"}`}>
                            {item.category}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="text-xs text-gray-400">Unscheduled {item.date && <>• {new Date(item.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</>}</div>
                      <div className={`text-sm font-semibold px-2 py-1 rounded-md inline-flex items-center ${item.amount < 0 ? "bg-red-500/20 text-red-400" : "bg-green-500/20 text-green-400"}`}>
                        <IndianRupee size={14} /> {item.amount.toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))
              )}

              <button onClick={() => setAddItemGroupId(group.id)} className="text-white-400 hover:text-yellow-300 text-sm mt-2 flex items-center gap-2">
                <CirclePlus size={16} /> <span>Add Item</span>
              </button>
            </div>
          </div>
        )
      })}
      {/* Add Item Modal */}
      {addItemGroupId && (
        <AddScheduleModal
          isOpen={true}
          isEditMode={false}
          defaultValues={{
            title: "",
            amount: 0,
            date: "",
            icon: "ReceiptIndianRupee",
            category: "",
            repeat: false,
            repeatEndDate: "",
          }}
          groupId={addItemGroupId}
          fallbackMonthDate={selectedDate}
          onSave={(itemData) => {
            addItem(addItemGroupId, itemData)
            toast.success("Item added to pending group")
            setAddItemGroupId(null)
          }}
          onClose={() => setAddItemGroupId(null)}
        />
      )}

      {/* Edit Item Modal */}
      {selectedItem && (
        <AddScheduleModal
          isOpen={true}
          isEditMode={true}
          defaultValues={
            scheduleGroups[selectedItem.groupId]?.items[selectedItem.itemId] || {}
          }
          groupId={selectedItem.groupId}
          fallbackMonthDate={selectedDate}
          onSave={(itemData) => {
            editItem(selectedItem.groupId, selectedItem.itemId, itemData)
            toast.success("Pending item updated")
            setSelectedItem(null)
          }}
          onDelete={() => {
            removeItem(selectedItem.groupId, selectedItem.itemId)
            toast.success("Pending item deleted")
            setSelectedItem(null)
          }}
          onClose={() => setSelectedItem(null)}
        />
      )}

      {/* Rename Group Modal */}
      <TextInputModal
        isOpen={!!editGroupInfo}
        title="Rename Pending Group"
        initialValue={editGroupInfo?.title || ""}
        confirmLabel="Save"
        onConfirm={(newTitle) => {
          renameGroup(editGroupInfo.id, newTitle)
          toast.success("Pending group renamed")
          setEditGroupInfo(null)
        }}
        validate={(val) => val.trim() !== ""}
        onClose={() => setEditGroupInfo(null)}
      />

      {/* Confirm Delete Group */}
      <ConfirmDialog
        isOpen={!!deleteGroupId}
        title="Delete Pending Group?"
        description="This will remove the group and all its pending items."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={() => {
          deleteGroup(deleteGroupId)
          toast.success("Pending group deleted")
          setDeleteGroupId(null)
        }}
        onCancel={() => setDeleteGroupId(null)}
      />
    </div>
  )
}
