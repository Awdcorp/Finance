// ✅ ScheduleList.jsx — Updated to route items based on isPending toggle

import React, { useState, useRef, useEffect } from "react"
import useFinance from "../state/finance"
import AddScheduleModal from "./AddScheduleModal"
import TextInputModal from "./TextInputModal"
import ConfirmDialog from "./ConfirmDialog"
import toast from "react-hot-toast"
import { IndianRupee, CirclePlus } from "lucide-react"
import { categoryIcons, categoryColors, iconMap } from "../constants/categories"

export default function ScheduleList({ selectedDate }) {
  const scheduleGroups = useFinance((state) => state.scheduleGroups)
  const editItemInGroup = useFinance((state) => state.editItemInGroup)
  const addItemToGroup = useFinance((state) => state.addItemToGroup)
  const deleteItemFromGroup = useFinance((state) => state.deleteItemFromGroup)
  const renameGroup = useFinance((state) => state.renameGroup)
  const deleteGroup = useFinance((state) => state.deleteGroup)

  const [editInfo, setEditInfo] = useState(null)
  const [menuOpenId, setMenuOpenId] = useState(null)
  const [editGroupInfo, setEditGroupInfo] = useState(null)
  const [deleteGroupId, setDeleteGroupId] = useState(null)

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
    <div className="px-4 relative">
      {Object.values(scheduleGroups).filter((g) => !g.isPending).map((group) => {
        const items = Object.values(group.items || {})
        const totalAmount = items
          .filter((item) => item && typeof item.amount === "number")
          .reduce((acc, item) => acc + item.amount, 0)

        return (
          <div key={group.id} className="mb-6 relative">
            {/* Group header with title and total */}
            <div className="flex justify-between items-center text-sm text-gray-400 mb-2 px-1">
              <div className="flex items-center gap-2">
                <span className="uppercase">{group.title || "Untitled"}</span>
                <span className={`font-semibold text-xs inline-flex items-center gap-1 ${totalAmount < 0 ? "text-red-400" : "text-green-400"}`}>
                  <IndianRupee size={12} />
                  {totalAmount.toFixed(2)}
                </span>
              </div>

              <div className="relative">
                <button
                  onClick={() => setMenuOpenId(menuOpenId === group.id ? null : group.id)}
                  className="text-gray-400 hover:text-white text-lg px-2"
                >
                  ⋮
                </button>

                {menuOpenId === group.id && (
                  <div
                    ref={menuRef}
                    className="absolute right-0 mt-2 w-40 bg-neutral-800 shadow-lg rounded-lg z-10 border border-neutral-700"
                  >
                    <button
                      className="block w-full text-left px-4 py-2 hover:bg-neutral-700 text-sm text-yellow-400"
                      onClick={() => {
                        setEditGroupInfo({ id: group.id, title: group.title })
                        setMenuOpenId(null)
                      }}
                    >
                      Rename
                    </button>
                    <button
                      className="block w-full text-left px-4 py-2 hover:bg-neutral-700 text-sm text-red-400"
                      onClick={() => {
                        setDeleteGroupId(group.id)
                        setMenuOpenId(null)
                      }}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Group items */}
            <div className="bg-neutral-800 rounded-xl p-4 flex flex-col gap-3">
              {items.length === 0 ? (
                <div className="text-center text-gray-500 text-sm italic">
                  No items in this group yet
                </div>
              ) : (
                items.map((item) => {
                  const Icon = categoryIcons[item.category?.toLowerCase()] || categoryIcons.default
                  const colorClass = categoryColors[item.category?.toLowerCase()] ||
                    (item.amount < 0 ? "bg-red-500/20 text-red-400" : "bg-green-500/20 text-green-400")

                  return (
                    <div
                      key={item.id}
                      className="py-3 flex justify-between items-start text-sm cursor-pointer border-b border-neutral-700 last:border-b-0"
                      onClick={() => setEditInfo({ groupId: group.id, itemId: item.id })}
                    >
                      <div className="flex gap-3 items-center">
                        <div className="text-xl">
                          {iconMap[item.icon] || <Icon size={20} className="text-yellow-400" />}
                        </div>
                        <div className="text-white flex flex-col items-start">
                          <span className="font-medium">{item.title}</span>
                          {item.category && (
                            <span
                              className={`text-xs capitalize px-2 py-0.5 rounded w-fit mt-1 ${colorClass}`}
                            >
                              {typeof item.category === "string"
                                ? item.category
                                : JSON.stringify(item.category)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <div className="text-xs text-gray-400">
                          {item.date && new Date(item.date).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </div>
                        <div className={`text-sm font-semibold px-2 py-1 rounded-md inline-flex items-center ${colorClass}`}>
                          <IndianRupee size={14} />
                          {item.amount.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}

              <button
                onClick={() => setEditInfo({ groupId: group.id, itemId: null })}
                className="text-white-400 hover:text-yellow-300 text-sm mt-2 flex items-center gap-2"
              >
                <CirclePlus size={16} />
                <span>Add Item</span>
              </button>
            </div>
          </div>
        )
      })}

      {/* Modals */}
      {editInfo && (
        <AddScheduleModal
          isOpen={true}
          isEditMode={!!editInfo.itemId}
          defaultValues={
            editInfo.itemId ?
              scheduleGroups[editInfo.groupId]?.items[editInfo.itemId] :
              { title: "", amount: 0, date: "", icon: "ReceiptIndianRupee", category: "", repeat: false, repeatEndDate: "" }
          }
          groupId={editInfo.groupId}
          fallbackMonthDate={selectedDate}
          onSave={() => {
            setEditInfo(null)
            toast.success("Item saved")
          }}
          onDelete={editInfo.itemId ? () => {
            deleteItemFromGroup(editInfo.groupId, editInfo.itemId)
            toast.success("Item deleted")
            setEditInfo(null)
          } : undefined}
          onClose={() => setEditInfo(null)}
        />
      )}

      <TextInputModal
        isOpen={!!editGroupInfo}
        title="Edit Group Title"
        initialValue={editGroupInfo?.title || ""}
        confirmLabel="Save"
        onConfirm={(newTitle) => {
          renameGroup(editGroupInfo.id, newTitle)
          toast.success("Group renamed")
          setEditGroupInfo(null)
        }}
        validate={(val) => val.trim() !== ""}
        onClose={() => setEditGroupInfo(null)}
      />

      <ConfirmDialog
        isOpen={!!deleteGroupId}
        title="Delete this group?"
        description="This will permanently delete the group and its items."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={() => {
          deleteGroup(deleteGroupId)
          toast.success("Group deleted")
          setDeleteGroupId(null)
        }}
        onCancel={() => setDeleteGroupId(null)}
      />
    </div>
  )
}
