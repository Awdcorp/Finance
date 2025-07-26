import React, { useState, useRef, useEffect } from "react"
import useFinance from "../state/finance"
import AddScheduleModal from "./AddScheduleModal"
import TextInputModal from "./TextInputModal"
import ConfirmDialog from "./ConfirmDialog"
import toast from "react-hot-toast"
import {
  IndianRupee,
  ShoppingCart,
  Utensils,
  Bus,
  Home,
  School,
  PiggyBank,
  Zap,
  FileText,CirclePlus,ReceiptIndianRupee,
} from "lucide-react"

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
  const [deleteGroupIndex, setDeleteGroupIndex] = useState(null)

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

  const categoryIcons = {
    groceries: ShoppingCart,
    food: Utensils,
    transport: Bus,
    rent: Home,
    education: School,
    savings: PiggyBank,
    bills: Zap,
    default: FileText,
  }

  const categoryColors = {
    groceries: "bg-pink-500/20 text-pink-400",
    food: "bg-amber-500/20 text-amber-400",
    transport: "bg-blue-500/20 text-blue-400",
    rent: "bg-purple-500/20 text-purple-400",
    education: "bg-teal-500/20 text-teal-400",
    savings: "bg-green-500/20 text-green-400",
    bills: "bg-red-500/20 text-red-400",
  }

  const iconMap = {
  ReceiptIndianRupee: <ReceiptIndianRupee size={20} className="text-yellow-400" />,
  IndianRupee: <IndianRupee size={20} className="text-yellow-400" />,
  ShoppingCart: <ShoppingCart size={20} className="text-yellow-400" />,
  Utensils: <Utensils size={20} className="text-yellow-400" />,
  Bus: <Bus size={20} className="text-yellow-400" />,
  Home: <Home size={20} className="text-yellow-400" />,
  School: <School size={20} className="text-yellow-400" />,
  PiggyBank: <PiggyBank size={20} className="text-yellow-400" />,
  Zap: <Zap size={20} className="text-yellow-400" />,
  FileText: <FileText size={20} className="text-yellow-400" />,
}

  return (
    <div className="px-4 mt-4 relative">
      {scheduleGroups.map((group, groupIndex) => {
        const groupItems = items.filter((item) => item.groupIndex === groupIndex)
        const totalAmount = groupItems.reduce((acc, item) => acc + item.amount, 0)

        return (
          <div key={groupIndex} className="mb-6 relative">
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
                  className="text-gray-400 hover:text-white text-lg px-2"
                >
                  ⋮
                </button>

                {menuOpenIndex === groupIndex && (
                  <div
                    ref={menuRef}
                    className="absolute right-0 mt-2 w-40 bg-neutral-800 shadow-lg rounded-lg z-10 border border-neutral-700"
                  >
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
                        setDeleteGroupIndex(groupIndex)
                        setMenuOpenIndex(null)
                      }}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-neutral-800 rounded-xl p-4 flex flex-col gap-3">
              {groupItems.length === 0 ? (
                <div className="text-center text-gray-500 text-sm italic">
                  No items in this group yet
                </div>
              ) : (
                groupItems.map((item, i) => {
                  const realItemIndex = scheduleGroups[groupIndex].items.findIndex((stored) => {
                    const original = item.originalDate || item.date
                    return (
                      stored.title === item.title &&
                      stored.amount === item.amount &&
                      stored.date === original &&
                      stored.icon === item.icon
                    )
                  })

                  const Icon =
                    categoryIcons[item.category?.toLowerCase()] || categoryIcons.default
                  const colorClass =
                    categoryColors[item.category?.toLowerCase()] ||
                    (item.amount < 0
                      ? "bg-red-500/20 text-red-400"
                      : "bg-green-500/20 text-green-400")

                  return (
                    <div
                      key={i}
                      className="py-3 flex justify-between items-start text-sm cursor-pointer border-b border-neutral-700 last:border-b-0"
                      onClick={() => {
                        if (realItemIndex !== -1) {
                          setEditInfo({ groupIndex, itemIndex: realItemIndex })
                        }
                      }}
                    >
                      <div className="flex gap-3 items-start">
                        <div className="text-xl">
                          {iconMap[item.icon] || <Icon size={20} className="text-yellow-400" />}
                        </div>
                        <div className="text-white">
                          <div className="font-medium">{item.title}</div>
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <div className="text-xs text-gray-400">{item.date}</div>
                        <div
                          className={`text-sm font-semibold px-2 py-1 rounded-md inline-flex items-center ${colorClass}`}
                        >
                          <IndianRupee size={14} />
                          {item.amount.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}

              <button
                onClick={() => setEditInfo({ groupIndex, itemIndex: null })}
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
          isEditMode={editInfo.itemIndex != null}
          defaultValues={
            editInfo.itemIndex != null
              ? scheduleGroups[editInfo.groupIndex].items[editInfo.itemIndex]
              : {
                  title: "",
                  amount: 0,
                  date: "",
                  icon: "ReceiptIndianRupee",
                  category: "",
                  repeat: false,
                  repeatEndDate: "",
                }
          }
          groupIndex={editInfo.groupIndex}
          onSave={(itemData) => {
            if (editInfo.itemIndex != null) {
              editItemInGroup(editInfo.groupIndex, editInfo.itemIndex, itemData)
              toast.success("Item updated successfully")
            } else {
              addItemToGroup(editInfo.groupIndex, itemData)
              toast.success("Item added successfully")
            }
            setEditInfo(null)
          }}
          onDelete={
            editInfo.itemIndex != null
              ? () => {
                  deleteItemFromGroup(editInfo.groupIndex, editInfo.itemIndex)
                  toast.success("Item deleted")
                  setEditInfo(null)
                }
              : undefined
          }
          onClose={() => setEditInfo(null)}
        />
      )}

      <TextInputModal
        isOpen={!!editGroupInfo}
        title="Edit Group Title"
        initialValue={editGroupInfo?.title || ""}
        confirmLabel="Save"
        onConfirm={(newTitle) => {
          renameGroup(editGroupInfo.index, newTitle)
          toast.success("Group renamed")
          setEditGroupInfo(null)
        }}
        validate={(val) => val.trim() !== ""}
        onClose={() => setEditGroupInfo(null)}
      />

      <ConfirmDialog
        isOpen={deleteGroupIndex !== null}
        title="Delete this group?"
        description="This will permanently delete the group and its items."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={() => {
          deleteGroup(deleteGroupIndex)
          toast.success("Group deleted")
          setDeleteGroupIndex(null)
        }}
        onCancel={() => setDeleteGroupIndex(null)}
      />
    </div>
  )
}
