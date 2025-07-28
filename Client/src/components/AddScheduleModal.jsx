// ✅ AddScheduleModal.jsx — Updated to support Draft toggle with `isPending`

import React, { useState, useEffect } from 'react'
import useFinance from '../state/finance'
import { Dialog } from '@headlessui/react'
import { X } from 'lucide-react'
import toast from 'react-hot-toast'
import ConfirmDialog from './ConfirmDialog'
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { categoryOptions, iconOptions } from "../constants/categories"
import AmountInput from "./AmountInput"

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
  const [isPending, setIsPending] = useState(false) // ✅ new state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const scheduleGroups = useFinance((state) => state.scheduleGroups)
  const groupTitle = scheduleGroups[groupId]?.title || 'Untitled'
  const addItemToGroup = useFinance((state) => state.addItemToGroup)

  useEffect(() => {
    if (defaultValues) {
      setTitle(defaultValues.title || '')
      const rawAmount = parseFloat(defaultValues.amount)
      setIsPositive(rawAmount >= 0)
      setAmount(Math.abs(rawAmount).toString() || '')
      setDate(defaultValues.date || '')
      setCategory(defaultValues.category || '')
      setIcon(defaultValues.icon || 'ReceiptIndianRupee')
      setRepeat(defaultValues.repeat ?? true)
      setRepeatEndDate(defaultValues.repeatEndDate || '')
      setIsPending(defaultValues.isPending || false) // ✅ populate from edit
    }
  }, [isOpen, defaultValues])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title || !amount || !date) {
      toast.error('Please fill required fields')
      return
    }

    const parsedAmount = parseFloat(isPositive ? amount : "-" + amount)
    const newItem = {
      title,
      amount: parsedAmount,
      date,
      icon,
      category,
      repeat,
      repeatEndDate: repeat ? repeatEndDate : '',
      isPending // ✅ include in item
    }

    if (isEditMode && onSave) {
      onSave(newItem)
    } else if (onSave) {
      onSave(newItem)
    } else {
      addItemToGroup(groupId, newItem)
    }

    onClose()
  }

  const selectedDateForCalendar = date
    ? new Date(date)
    : fallbackMonthDate
    ? new Date(fallbackMonthDate)
    : null

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-3">
        <Dialog.Panel className="bg-zinc-900 rounded-lg w-full max-w-sm p-4 shadow-xl border border-zinc-700">
          <div className="flex justify-between items-center mb-3">
            <Dialog.Title className="text-base font-semibold text-white">
              {isEditMode ? 'Edit Schedule Item' : `Add Item to ${groupTitle}`}
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

            {/* Category & Date */}
            <div className="flex gap-2">
              <div className="w-1/2">
                <label className="block mb-0.5 text-sm text-white">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-2 py-1.5 text-sm bg-zinc-800 rounded-md border border-zinc-600 text-white"
                >
                  <option value="">Select Category</option>
                  {categoryOptions.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="w-1/2">
                <label className="block mb-0.5 text-sm text-white">
                  Date <span className="text-red-400">*</span>
                </label>
                <DatePicker
                  selected={selectedDateForCalendar}
                  onChange={(date) => setDate(date.toISOString().split("T")[0])}
                  dateFormat="dd-MM-yyyy"
                  placeholderText="Select a date"
                  className="w-full px-2 py-1.5 text-sm bg-zinc-800 border rounded-md text-white focus:outline-none"
                />
              </div>
            </div>

            {/* Icon Selection */}
            <div>
              <label className="block text-sm text-white mb-1">Select Icon</label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(iconOptions).map(([key, Icon]) => (
                  <button
                    key={key}
                    type="button"
                    className={`p-1.5 rounded-md w-8 h-8 flex items-center justify-center
                      ${icon === key ? "bg-blue-500 text-white" : "bg-neutral-800 text-white"}`}
                    onClick={() => setIcon(key)}
                  >
                    <Icon size={16} />
                  </button>
                ))}
              </div>
            </div>

            {/* Repeat & Draft Toggle */}
            <div className="flex items-center gap-4">
              <div className="flex flex-col">
                <label className="text-sm mb-0.5">Repeat Monthly</label>
                <button
                  type="button"
                  onClick={() => setRepeat(!repeat)}
                  className={`relative w-10 h-5 rounded-full ${repeat ? "bg-blue-500" : "bg-zinc-600"}`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform
                      ${repeat ? "translate-x-5" : "translate-x-0"}`}
                  />
                </button>
              </div>

              <div className="flex flex-col">
                <label className="text-sm mb-0.5">Save as Draft</label>
                <button
                  type="button"
                  onClick={() => setIsPending(!isPending)}
                  className={`relative w-10 h-5 rounded-full ${isPending ? "bg-yellow-500" : "bg-zinc-600"}`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform
                      ${isPending ? "translate-x-5" : "translate-x-0"}`}
                  />
                </button>
              </div>
            </div>

            {/* Repeat End Date */}
            {repeat && (
              <div>
                <label className="text-sm mb-0.5">Repeat Until</label>
                <DatePicker
                  selected={repeatEndDate ? new Date(repeatEndDate) : null}
                  onChange={(date) => setRepeatEndDate(date.toISOString().split("T")[0])}
                  dateFormat="dd-MM-yyyy"
                  placeholderText="Select end date"
                  className="w-full px-2 py-1.5 text-sm bg-zinc-800 border rounded-md text-white focus:outline-none"
                />
              </div>
            )}

            {/* Submit Buttons */}
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

          {/* Confirm Delete Dialog */}
          {showDeleteConfirm && (
            <ConfirmDialog
              isOpen={true}
              title="Delete this item?"
              description="This will permanently delete the scheduled item."
              confirmLabel="Delete"
              cancelLabel="Cancel"
              onConfirm={() => {
                onDelete?.()
                setShowDeleteConfirm(false)
                onClose()
              }}
              onCancel={() => setShowDeleteConfirm(false)}
            />
          )}
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}
