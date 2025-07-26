import React, { useState, useEffect } from 'react'
import useFinance from '../state/finance'
import { Dialog } from '@headlessui/react'
import { X } from 'lucide-react'
import toast from 'react-hot-toast'
import ConfirmDialog from './ConfirmDialog'
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { categoryOptions, iconOptions } from "../constants/categories"

export default function AddScheduleModal({
  isOpen,
  onClose,
  isEditMode = false,
  defaultValues = {},
  onSave = null,
  onDelete = null,
  groupIndex = 0,
}) {
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState('')
  const [category, setCategory] = useState('')
  const [icon, setIcon] = useState('ReceiptIndianRupee')
  const [repeat, setRepeat] = useState(true)
  const [repeatEndDate, setRepeatEndDate] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const scheduleGroups = useFinance((state) => state.scheduleGroups)
  const groupTitle = scheduleGroups[groupIndex]?.title || 'Untitled'
  const addItemToGroup = useFinance((state) => state.addItemToGroup)

  useEffect(() => {
    if (defaultValues) {
      setTitle(defaultValues.title || '')
      setAmount(defaultValues.amount || '')
      setDate(defaultValues.date || '')
      setCategory(defaultValues.category || '')
      setIcon(defaultValues.icon || 'ReceiptIndianRupee')
      setRepeat(defaultValues.repeat ?? true)
      setRepeatEndDate(defaultValues.repeatEndDate || '')
    }
  }, [isOpen, defaultValues])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title || !amount || !date) {
      toast.error('Please fill required fields')
      return
    }

    const newItem = {
      title,
      amount: parseFloat(amount),
      date,
      icon,
      category,
      repeat,
      repeatEndDate: repeat ? repeatEndDate : '',
    }

    if (isEditMode && onSave) {
      onSave(newItem)
    } else if (onSave) {
      onSave(newItem)
    } else {
      addItemToGroup(groupIndex, newItem)
    }

    onClose()
  }

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
            <div className="flex gap-2">
              {/* Title Field */}
              <div className="w-2/3">
                <label className="block mb-0.5 text-sm">Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-2 py-1.5 text-sm bg-zinc-800 rounded-md border border-zinc-600"
                  placeholder="e.g. Rent, EMI"
                />
              </div>

              {/* Amount Field */}
              <div className="w-1/3">
                <label className="block mb-0.5 text-sm">Amount (₹) *</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-2 py-1.5 text-sm bg-zinc-800 rounded-md border border-zinc-600"
                  placeholder="-1200"
                />
              </div>
            </div>


            <div className="flex gap-2">
              {/* Category Dropdown */}
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

              {/* Date Picker */}
              <div className="w-1/2">
                <label className="block mb-0.5 text-sm text-white">
                  Date <span className="text-red-400">*</span>
                </label>
                <DatePicker
                  selected={date ? new Date(date) : null}
                  onChange={(date) => setDate(date.toISOString().split("T")[0])}
                  dateFormat="dd-MM-yyyy"
                  placeholderText="Select a date"
                  className="w-full px-2 py-1.5 text-sm bg-zinc-800 border rounded-md text-white focus:outline-none"
                  calendarClassName="custom-calendar"
                />
              </div>
            </div>


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

            <div className="flex items-end gap-2">
              {/* Repeat Toggle */}
              <div className="flex flex-col gap-1">
                <label htmlFor="repeat-toggle" className="text-sm text-white mb-0.5">
                  Repeat Every Month
                </label>

                {/* ✅ This part aligns toggle + label */}
                <div className="flex items-center gap-2">
                  <button
                    id="repeat-toggle"
                    type="button"
                    role="switch"
                    aria-checked={repeat}
                    onClick={() => setRepeat(!repeat)}
                    className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors 
                      ${repeat ? "bg-blue-500" : "bg-zinc-600"}`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform 
                      ${repeat ? "translate-x-5" : "translate-x-1"}`}
                    />
                  </button>

                  {/* 👇 Appears inline with toggle */}
                  {repeat && (
                    <span className="text-xs text-white-400 font-medium">Select date</span>
                  )}
                </div>
              </div>


              {/* Repeat Until Date Picker (only shown if repeat is true) */}
              {repeat && (
                <div className="flex-1">
                  <DatePicker
                    selected={repeatEndDate ? new Date(repeatEndDate) : null}
                    onChange={(date) => setRepeatEndDate(date.toISOString().split("T")[0])}
                    dateFormat="dd-MM-yyyy"
                    placeholderText="Select end date"
                    className="w-full px-2 py-1.5 text-sm bg-zinc-800 border rounded-md text-white focus:outline-none"
                    calendarClassName="custom-calendar"
                  />
                </div>
              )}
            </div>


            <button
              type="submit"
              className="w-full bg-green-500 hover:bg-yellow-600 text-black font-semibold py-2 rounded-md"
            >
              {isEditMode ? 'Save Changes' : 'Add Item'}
            </button>

            {isEditMode && (
              <button
                type="button"
                className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded-md"
                onClick={() => setShowDeleteConfirm(true)}
              >
                Delete Item
              </button>
            )}
          </form>

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
