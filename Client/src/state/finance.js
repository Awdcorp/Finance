import { create } from 'zustand'

const useFinance = create((set) => ({
  // ✅ Schedule blocks like "This Month", "Next Month", etc.
  scheduleGroups: [
    {
      title: "This Month’s Schedule",
      items: [],
    },
  ],

  // ✅ Add a new group (block)
  addScheduleGroup: (group) =>
    set((state) => ({
      scheduleGroups: [...state.scheduleGroups, group],
    })),

  renameGroup: (index, newTitle) =>
    set((state) => {
      const updated = [...state.scheduleGroups]
      updated[index].title = newTitle
      return { scheduleGroups: updated }
    }),

  deleteGroup: (index) =>
    set((state) => {
      const updated = [...state.scheduleGroups]
      updated.splice(index, 1)
      return { scheduleGroups: updated }
    }),

  // ✅ Add item to a specific group
  addItemToGroup: (groupIndex, item) =>
    set((state) => {
      const groups = [...state.scheduleGroups]
      groups[groupIndex].items.push(item)
      return { scheduleGroups: groups }
    }),

  // ✅ Edit an item in a specific group
  editItemInGroup: (groupIndex, itemIndex, updatedItem) =>
    set((state) => {
      const groups = [...state.scheduleGroups]
      groups[groupIndex].items[itemIndex] = {
        ...groups[groupIndex].items[itemIndex],
        ...updatedItem,
      }
      return { scheduleGroups: groups }
    }),

  // ✅ Delete an item from a specific group
  deleteItemFromGroup: (groupIndex, itemIndex) =>
    set((state) => {
      const groups = [...state.scheduleGroups]
      groups[groupIndex].items.splice(itemIndex, 1)
      return { scheduleGroups: groups }
    }),

  // 🧾 Custom tracking lists (like "Loan", "Trip")
  customLists: [],

  addCustomList: (list) =>
    set((state) => ({
      customLists: [...state.customLists, list],
    })),

  // 💸 Transactions tied to a list
  transactionsByList: {},

  addTransactionToList: (listId, transaction) =>
    set((state) => ({
      transactionsByList: {
        ...state.transactionsByList,
        [listId]: [
          ...(state.transactionsByList[listId] || []),
          transaction,
        ],
      },
    })),

  // ✅ New: Pending Transactions (Unassigned Payments)
    pendingItems: [],

    addPendingItem: (item) =>
    set((state) => ({
        pendingItems: [
        ...state.pendingItems,
        {
            title: item.title || "",
            amount: item.amount || 0,
            date: null,
            notes: item.notes || "",
            icon: item.icon || null,
            isDraft: true,
        },
        ],
    })),

    removePendingItem: (index) =>
    set((state) => ({
        pendingItems: state.pendingItems.filter((_, i) => i !== index),
    })),

    editPendingItem: (index, updated) =>
    set((state) => {
        const items = [...state.pendingItems]
        items[index] = { ...items[index], ...updated }
        return { pendingItems: items }
    }),
}))

export default useFinance
