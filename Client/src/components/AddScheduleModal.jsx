// ✅ AddScheduleModal.jsx — Routes items based on `isPending` to correct group

import React, { useState, useEffect, useRef } from 'react'
import useFinance from '../state/finance'
import { Dialog } from '@headlessui/react'
import { X } from 'lucide-react'
import toast from 'react-hot-toast'
import ConfirmDialog from './ConfirmDialog'
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { categoryOptions, iconOptions } from "../constants/categories"
import AmountInput from "./AmountInput"
import GroupSelectorModal from './GroupSelectorModal'
import DateSelector from "./DateSelector";

const isMobile = typeof window !== "undefined" && /Mobi|Android/i.test(navigator.userAgent);
const formatDisplayDate = (dateStr) =>
  dateStr ? new Date(dateStr).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "Select Date";

export default function AddScheduleModal({
  isOpen,
  onClose,
  isEditMode = false,
  defaultValues = {},
  onSave = null,
  onDelete = null,
  groupId = null,
  fallbackMonthDate = null,
}) {
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState('')
  const [category, setCategory] = useState('')
  const [icon, setIcon] = useState('ReceiptIndianRupee')
  const [repeat, setRepeat] = useState(true)
  const [repeatEndDate, setRepeatEndDate] = useState('')
  const [isPositive, setIsPositive] = useState(true)
  const [isPending, setIsPending] = useState(false)
  const [targetGroupId, setTargetGroupId] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showGroupSelector, setShowGroupSelector] = useState(false)
  const [showDesktopCalendar, setShowDesktopCalendar] = useState(false);
  const [showRepeatCalendar, setShowRepeatCalendar] = useState(false);
  const hiddenDateInputRef = useRef(null);
  const hiddenRepeatInputRef = useRef(null);
  const dashboards = useFinance((state) => state.dashboards)
  const currentDashboardId = useFinance((state) => state.currentDashboardId)
  const dashboardData = useFinance((state) => state.dashboardData)
  const addTransferTransaction = useFinance((state) => state.addTransferTransaction)
  const [showTransferCategoryWarning, setShowTransferCategoryWarning] = useState(false);

  const [toDashboardId, setToDashboardId] = useState(null)

  const scheduleGroups = useFinance((state) => state.scheduleGroups)
  const addItemToGroup = useFinance((state) => state.addItemToGroup)
  const editItemInGroup = useFinance((state) => state.editItemInGroup)
  const deleteItemFromGroup = useFinance((state) => state.deleteItemFromGroup)

  useEffect(() => {
    if (defaultValues) {
      setTitle(defaultValues.title || '')
      const rawAmount = parseFloat(defaultValues.amount)
      setIsPositive(rawAmount >= 0)
      setAmount(!isNaN(rawAmount) && rawAmount !== 0 ? Math.abs(rawAmount).toString() : '')
      setDate(defaultValues.date || '')
      setCategory(defaultValues.category || '')
      setIcon(defaultValues.icon || 'ReceiptIndianRupee')
      setRepeat(defaultValues.repeat ?? true)
      setRepeatEndDate(defaultValues.repeatEndDate || '')
      setIsPending(defaultValues.isPending || false)
      setTargetGroupId(groupId || null)
      setToDashboardId(defaultValues.transferTo || defaultValues.transferFrom || null)
    }
  }, [isOpen, defaultValues])

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !amount || !date) {
      toast.error("Please fill required fields");
      return;
    }

    const parsedAmount = parseFloat(isPositive ? amount : "-" + amount);
    const newItem = {
      title,
      amount: parsedAmount,
      date,
      icon,
      category,
      repeat,
      repeatEndDate: repeat ? repeatEndDate : "",
      isPending,
    };

    if (!targetGroupId) {
      toast.error("No group found for this item type");
      return;
    }

    // ✅ Handle Edit Mode with possible transfer conversion
    if (isEditMode && onSave) {
      const isNowTransfer = category === "Transfer";
      const wasTransfer = defaultValues.category === "Transfer";

      if (!wasTransfer && isNowTransfer) {
        // 🔁 Convert normal item → transfer
        if (!toDashboardId) {
          toast.error("Select target dashboard for transfer");
          return;
        }

        // Delete old item
        deleteItemFromGroup(groupId, defaultValues.id);

        // Get receiver group
        const toGroups = dashboardData[toDashboardId]?.scheduleGroups || {};
        const toGroupId = Object.values(toGroups).find((g) => g.title === "Daily Transactions")?.id;

        if (!toGroupId) {
          toast.error("No valid group in target dashboard");
          return;
        }

        addTransferTransaction(
          currentDashboardId,
          targetGroupId,
          toDashboardId,
          toGroupId,
          {
            ...newItem,
            transferTo: toDashboardId,
            transferDirection: "outgoing",
          }
        );

        onSave?.(newItem);
        onClose();
        return;
      }

      // ✅ Existing transfer
      if (wasTransfer && isNowTransfer) {
        const editTransfer = useFinance.getState().editTransferTransaction;
        editTransfer(currentDashboardId, groupId, defaultValues.id, newItem);
      } else {
        // ✅ Regular edit (with or without group change)
        const isSameGroup = groupId === targetGroupId;
        if (isSameGroup) {
          editItemInGroup(groupId, defaultValues.id, newItem);
        } else {
          deleteItemFromGroup(groupId, defaultValues.id);
          addItemToGroup(targetGroupId, newItem, defaultValues.id);
        }
      }

      onSave(newItem);
      onClose();
      return;
    }

    // ✅ Create new
    if (!isEditMode) {
      if (category === "Transfer") {
        if (!toDashboardId) {
          toast.error("Select target dashboard for transfer");
          return;
        }

        const toGroups = dashboardData[toDashboardId]?.scheduleGroups || {};
        const toGroupId = Object.values(toGroups).find((g) => g.title === "Daily Transactions")?.id;

        if (!toGroupId) {
          toast.error("No valid group in target dashboard");
          return;
        }

        addTransferTransaction(
          currentDashboardId,
          targetGroupId,
          toDashboardId,
          toGroupId,
          {
            ...newItem,
            transferTo: toDashboardId,
            transferDirection: "outgoing",
          }
        );

        onSave?.(newItem);
      } else {
        addItemToGroup(targetGroupId, newItem);
        onSave?.(newItem);
      }
    }

    onClose();
  };


  const selectedDateForCalendar = date
    ? new Date(date)
    : fallbackMonthDate
      ? new Date(fallbackMonthDate)
      : null

  const selectedRepeatEndDate = repeatEndDate
    ? new Date(repeatEndDate)
    : fallbackMonthDate
      ? new Date(fallbackMonthDate)
      : null;

  const handleToggleIsPending = () => {
    const otherGroups = Object.values(scheduleGroups).filter((g) => g.isPending === !isPending)
    if (otherGroups.length === 0) {
      toast.error("No group available for this type")
      return
    }
    setIsPending(!isPending)
    setShowGroupSelector(true)
  }

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-3">
        <Dialog.Panel className="bg-zinc-900 rounded-lg w-full max-w-sm p-4 shadow-xl border border-zinc-700">
          <div className="flex justify-between items-center mb-3">
            <Dialog.Title className="text-base font-semibold text-white">
              {isEditMode ? 'Edit Schedule Item' : 'Add New Item'}
            </Dialog.Title>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 text-sm text-white">
            {/* Title and Amount */}
            <div className="flex gap-2">
              <div className="w-1/2">
                <label className="block mb-0.5 text-sm">Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-2 py-1.5 text-sm bg-zinc-800 rounded-md border border-zinc-600"
                  placeholder="e.g. Rent, EMI"
                />
              </div>
              <div className="w-1/2">
                <AmountInput
                  value={amount}
                  setValue={setAmount}
                  isPositive={isPositive}
                  setIsPositive={setIsPositive}
                  label="Amount (₹) *"
                />
              </div>
            </div>

            {/* Category and Date */}
            <div className="flex gap-2">
              <div className="w-1/2">
                <label className="block mb-0.5 text-sm">Category</label>
                <select
                  value={category}
                  onChange={(e) => {
                    if (
                      isEditMode &&
                      defaultValues.category === "Transfer" &&
                      e.target.value !== "Transfer"
                    ) {
                      setShowTransferCategoryWarning(true); // 🚫 Block change attempt
                    } else {
                      setCategory(e.target.value); // ✅ Normal change
                    }
                  }}
                  className="w-full px-2 py-1.5 bg-zinc-800 rounded-md border border-zinc-600"
                >

                  <option value="">Select Category</option>
                  {categoryOptions.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                {category === "Transfer" && (
                  <div>
                    <label className="block mb-0.5 text-sm">Send To Dashboard</label>
                    <select
                      value={toDashboardId || ""}
                      onChange={(e) => setToDashboardId(e.target.value)}
                      className="w-full px-2 py-1.5 bg-zinc-800 rounded-md border border-zinc-600"
                    >
                      <option value="">Select Dashboard</option>
                      {dashboards
                        .filter((d) => d.id !== currentDashboardId)
                        .map((d) => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                    </select>
                  </div>
                )}

              </div>
              <div className="w-1/2">
                {/* 📅 Primary Date Selector */}
                <DateSelector
                  label="Date *"
                  date={date}
                  setDate={setDate}
                  fallbackMonthDate={fallbackMonthDate}
                /></div>
            </div>

            {/* Icon Picker */}
            <div>
              <label className="block text-sm mb-1">Select Icon</label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(iconOptions).map(([key, Icon]) => (
                  <button
                    key={key}
                    type="button"
                    className={`p-1.5 rounded-md w-8 h-8 flex items-center justify-center ${icon === key ? "bg-blue-500" : "bg-neutral-800"
                      }`}
                    onClick={() => setIcon(key)}
                  >
                    <Icon size={16} />
                  </button>
                ))}
              </div>
            </div>

            {/* Toggles */}
            <div className="flex items-center gap-4">
              {/* Repeat toggle */}
              <div className="flex flex-col">
                <label className="text-sm mb-0.5">Repeat Monthly</label>
                <button
                  type="button"
                  onClick={() => setRepeat(!repeat)}
                  className={`w-10 h-5 rounded-full ${repeat ? "bg-blue-500" : "bg-zinc-600"}`}
                >
                  <span
                    className={`block w-4 h-4 bg-white rounded-full transition-transform ${repeat ? "translate-x-5" : "translate-x-0"
                      }`}
                  />
                </button>
              </div>

              {/* Save as Draft toggle */}
              <div className="flex flex-col">
                <label className="text-sm mb-0.5">Save as Draft</label>
                <button
                  type="button"
                  onClick={handleToggleIsPending}
                  className={`w-10 h-5 rounded-full ${isPending ? "bg-yellow-500" : "bg-zinc-600"}`}
                >
                  <span
                    className={`block w-4 h-4 bg-white rounded-full transition-transform ${isPending ? "translate-x-5" : "translate-x-0"
                      }`}
                  />
                </button>
              </div>
            </div>

            {/* Repeat End Date */}
            {repeat && (
              <DateSelector
                label="Repeat Until"
                date={repeatEndDate}
                setDate={setRepeatEndDate}
                fallbackMonthDate={fallbackMonthDate}
              />
            )}


            {targetGroupId && (
              <div>
                <label className="text-sm mb-0.5 flex items-center justify-between">
                  Selected Group
                  <button
                    type="button"
                    onClick={() => {
                      if (isEditMode && defaultValues.category === "Transfer") {
                        toast.error("Transfers cannot be moved to another group");
                        return;
                      }
                      setShowGroupSelector(true);
                    }}

                    className="text-xs text-blue-400 hover:underline"
                  >
                    Change
                  </button>
                </label>
                <div className="w-full px-3 py-2 bg-zinc-800 rounded-md text-white border border-zinc-700">
                  {scheduleGroups[targetGroupId]?.title || "Untitled Group"}
                </div>
              </div>
            )}



            {/* Submit */}
            <div className="flex gap-2">
              <button
                type="submit"
                className="w-1/2 bg-green-500 hover:bg-yellow-600 text-black font-semibold py-2 rounded-md"
              >
                {isEditMode ? 'Save Changes' : 'Add Item'}
              </button>
              {isEditMode && (
                <button
                  type="button"
                  className="w-1/2 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded-md"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  Delete
                </button>
              )}
            </div>
          </form>

          {showDeleteConfirm && (
            <ConfirmDialog
              isOpen={true}
              title="Delete this item?"
              description="This will permanently delete the item."
              confirmLabel="Delete"
              cancelLabel="Cancel"
              onConfirm={() => {
                const isTransfer = defaultValues.category === "Transfer"
                if (isTransfer) {
                  const deleteTransfer = useFinance.getState().deleteTransferTransaction
                  deleteTransfer(currentDashboardId, groupId, defaultValues.id)
                } else {
                  deleteItemFromGroup(groupId, defaultValues.id)
                }

                onDelete?.()
                setShowDeleteConfirm(false)
                onClose()
              }}

              onCancel={() => setShowDeleteConfirm(false)}
            />
          )}
          {showGroupSelector && (
            <GroupSelectorModal
              isOpen={true}
              isPending={isPending}
              onClose={() => setShowGroupSelector(false)}
              title="Select Group"
              groupOptions={Object.values(scheduleGroups).filter(g => g.isPending === isPending)}
              onSelect={(id) => {
                setTargetGroupId(id)
                setShowGroupSelector(false)
              }}
            />
          )}
          {showTransferCategoryWarning && (
            <ConfirmDialog
              isOpen={true}
              title="Cannot Change Category"
              description="Transfer items are linked between dashboards. To change the category, please delete and create a new item."
              confirmLabel="Got it"
              onConfirm={() => setShowTransferCategoryWarning(false)}
              onCancel={() => setShowTransferCategoryWarning(false)}
            />
          )}

        </Dialog.Panel>
      </div>
    </Dialog>
  )
}
