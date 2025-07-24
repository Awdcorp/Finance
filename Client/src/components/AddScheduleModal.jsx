import React, { useState, useEffect } from 'react'
import useFinance from '../state/finance'
import { Dialog } from '@headlessui/react'
import { X } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AddScheduleModal({
  isOpen,
  onClose,
  isEditMode = false,
  initialData = null,
  onSave = null,
  onDelete = null,
  groupIndex = 0, // NEW PROP: to know which group to add to
}) {
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState('')
  const [category, setCategory] = useState('')
  const [icon, setIcon] = useState('')
  const [isRecurring, setIsRecurring] = useState(true)
  const scheduleGroups = useFinance((state) => state.scheduleGroups)
  const groupTitle = scheduleGroups[groupIndex]?.title || "Untitled"
  const addItemToGroup = useFinance((state) => state.addItemToGroup)

  useEffect(() => {
    if (isEditMode && initialData) {
      setTitle(initialData.title || '')
      setAmount(initialData.amount || '')
      setDate(initialData.date || '')
      setCategory(initialData.category || '')
      setIcon(initialData.icon || '')
      setIsRecurring(initialData.isRecurring || false)
    } else {
      setTitle('')
      setAmount('')
      setDate('')
      setCategory('')
      setIcon('')
      setIsRecurring(true)
    }
  }, [isOpen, isEditMode, initialData])

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
      icon: icon || '📅',
      category,
      isRecurring,
    }

    if (isEditMode && onSave) {
      onSave(newItem)
      toast.success('Item updated successfully')
    } else {
      addItemToGroup(groupIndex, newItem) // ✅ Use new group logic
      toast.success('Item added successfully')
    }

    onClose()
  }

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this item?')) {
      onDelete?.()
      toast.success('Item deleted')
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-zinc-900 rounded-xl w-full max-w-md p-6 shadow-lg border border-zinc-700">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-lg font-bold text-white">
              {isEditMode ? 'Edit Schedule Item' : `Add Item to ${groupTitle}`}
            </Dialog.Title>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-sm text-white">
            {/* Title */}
            <div>
              <label className="block mb-1">Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2 bg-zinc-800 rounded-md border border-zinc-600 focus:outline-none"
                placeholder="e.g. Rent, EMI"
              />
            </div>

            {/* Amount */}
            <div>
              <label className="block mb-1">Amount (€) *</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full p-2 bg-zinc-800 rounded-md border border-zinc-600 focus:outline-none"
                placeholder="-1200"
              />
            </div>

            {/* Date */}
            <div>
              <label className="block mb-1">Date *</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2 bg-zinc-800 rounded-md border border-zinc-600"
              />
            </div>

            {/* Icon */}
            <div>
              <label className="block mb-1">Icon (Emoji)</label>
              <input
                type="text"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                maxLength={2}
                className="w-full p-2 bg-zinc-800 rounded-md border border-zinc-600"
                placeholder="🏠"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block mb-1">Category</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2 bg-zinc-800 rounded-md border border-zinc-600"
                placeholder="e.g. Utilities, Rent"
              />
            </div>

            {/* Recurring */}
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="mr-2"
              />
              <label>Repeat every month</label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-2 rounded-md"
            >
              {isEditMode ? 'Save Changes' : 'Add Item'}
            </button>

            {/* Delete */}
            {isEditMode && (
              <button
                type="button"
                className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded-md mt-2"
                onClick={handleDelete}
              >
                Delete Item
              </button>
            )}
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}
