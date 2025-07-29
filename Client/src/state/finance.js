// ✅ Zustand store for Finance Tracker — unified structure with tags, versioning, shared support

import { create } from "zustand"
import { db } from "../firebase"
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore"
import { nanoid } from "nanoid"

const DEFAULT_DASHBOARD = { id: "default", name: "My Budget" }

const createDefaultGroups = () => {
  const scheduledId = nanoid()
  const scheduledId2 = nanoid()
  const pendingId = nanoid()
  return {
    [scheduledId]: {
      id: scheduledId,
      title: "This Month’s Schedule",
      isPending: false,
      items: {},
      tags: [],
      archived: false,
      createdAt: Date.now(),
      orderIndex: 0
    },
    [scheduledId2]: {
      id: scheduledId2,
      title: "Daily Transactions",
      isPending: false,
      items: {},
      tags: [],
      archived: false,
      createdAt: Date.now(),
      orderIndex: 1,
      protected: true,
    },
    [pendingId]: {
      id: pendingId,
      title: "General Drafts",
      isPending: true,
      items: {},
      tags: [],
      archived: false,
      createdAt: Date.now(),
      orderIndex: 1,
    },
  }
}

const createEmptyDashboardData = () => ({
  scheduleGroups: {},
  lastModified: Date.now(),
  sharedWith: [],
})

const useFinance = create((set, get) => ({
  userId: null,

  dashboards: [DEFAULT_DASHBOARD],
  currentDashboardId: "default",

  dashboardData: {
    default: {
      scheduleGroups: createDefaultGroups(),
      lastModified: Date.now(),
      sharedWith: [],
    },
  },

  version: 1,

  scheduleGroups: {},
  syncStatus: "idle",
  setSyncStatus: (status) => set({ syncStatus: status }),

  lastLoaded: 0,
  setLastLoaded: (ts) => set({ lastLoaded: ts }),

  syncDashboard: () => {
    const { currentDashboardId, dashboardData } = get()
    const current = dashboardData?.[currentDashboardId]
    const scheduleGroups = current?.scheduleGroups || {}
    set({ scheduleGroups })
  },

  loadUserData: async (userId) =>  {
    const userDocRef = doc(db, "users", userId)
    const fallbackGroups = createDefaultGroups()
    const fallback = {
      dashboards: [DEFAULT_DASHBOARD],
      currentDashboardId: "default",
      dashboardData: {
        default: {
          scheduleGroups: fallbackGroups,
          lastModified: Date.now(),
          sharedWith: [],
        },
      },
      version: 1,
      lastUpdated: Date.now(),
    }

    if (!navigator.onLine) {
      const success = get().loadBackupFromLocalStorage()
      if (success) set({ userId })
      return
    }

    try {
      const snap = await getDoc(userDocRef)
      const data = snap.exists() ? snap.data() : fallback

      // ✅ Protect against missing dashboards
      if (!data.dashboards || data.dashboards.length === 0) {
        data.dashboards = [DEFAULT_DASHBOARD]
        data.currentDashboardId = "default"
        data.dashboardData = { default: fallback.dashboardData.default }
      }

      onSnapshot(userDocRef, (snap) => {
        if (snap.exists()) {
          const d = snap.data()
          set({
            dashboards: d.dashboards,
            currentDashboardId: d.currentDashboardId,
            dashboardData: d.dashboardData,
          })
          get().syncDashboard()
        }
      })

      set({
        userId,
        dashboards: data.dashboards,
        currentDashboardId: data.currentDashboardId,
        dashboardData: data.dashboardData,
      })
      get().syncDashboard()
      get().setLastLoaded(data.lastUpdated)
    } catch (e) {
      get().loadBackupFromLocalStorage()
    }
  },

  loadBackupFromLocalStorage: () => {
    try {
      const cached = JSON.parse(localStorage.getItem("financeBackup"))
      if (!cached) return false
      set({
        dashboards: cached.dashboards,
        currentDashboardId: cached.currentDashboardId,
        dashboardData: cached.dashboardData,
        lastLoaded: cached.lastUpdated,
      })
      get().syncDashboard()
      return true
    } catch {
      return false
    }
  },

  saveUserData: async () => {
    const {
      userId,
      dashboards,
      currentDashboardId,
      dashboardData,
      setSyncStatus,
      lastLoaded,
      setLastLoaded,
      version,
    } = get()
    if (!userId) return

    const userRef = doc(db, "users", userId)
    const now = Date.now()

    try {
      setSyncStatus("syncing")
      const snap = await getDoc(userRef)
      const server = snap.exists() ? snap.data() : {}

      const shouldMerge = (server.lastUpdated || 0) > lastLoaded
      let mergedData = { ...dashboardData }

      if (shouldMerge) {
        for (const { id } of dashboards) {
          const local = dashboardData[id] || {}
          const remote = server.dashboardData?.[id] || { scheduleGroups: {} }
          mergedData[id] = {
            ...remote,
            scheduleGroups: { ...remote.scheduleGroups, ...local.scheduleGroups },
            lastModified: now,
          }
        }
      }

      const final = {
        dashboards,
        currentDashboardId,
        dashboardData: mergedData,
        version,
        lastUpdated: now,
      }

      await setDoc(userRef, final)
      localStorage.setItem("financeBackup", JSON.stringify(final))
      setSyncStatus("synced")
      setLastLoaded(now)
    } catch {
      setSyncStatus("error")
    }
  },

  addScheduleGroup: (title, isPending = false, tags = []) => {
    const id = nanoid()
    const { scheduleGroups } = get()
    const nextIndex = Object.keys(scheduleGroups).length
    const newGroup = {id, title, isPending, items: {}, tags, archived: false, createdAt: Date.now(), orderIndex: nextIndex, }
    const updated = { ...scheduleGroups, [id]: newGroup }
    set({ scheduleGroups: updated })
    get().updateDashboardGroups("scheduleGroups", updated)
  },

  renameGroup: (groupId, newTitle) => {
    const { scheduleGroups } = get()
    const group = scheduleGroups[groupId]

    // ✅ Prevent renaming if protected
    if (group?.protected) {
      return false
    }

    const updatedGroup = { ...group, title: newTitle }
    const updated = { ...scheduleGroups, [groupId]: updatedGroup }
    set({ scheduleGroups: updated })
    get().updateDashboardGroups("scheduleGroups", updated)
    return true
  },

  deleteGroup: (groupId) => {
    const { scheduleGroups } = get()
    const group = scheduleGroups[groupId]

    // ✅ Block deletion, return false if protected
    if (group?.protected) {
      return false
    }

    const updated = { ...scheduleGroups }
    delete updated[groupId]
    set({ scheduleGroups: updated })
    get().updateDashboardGroups("scheduleGroups", updated)
    return true
  },

  reorderGroups: (newOrder) => {
    const { scheduleGroups } = get()
    const reordered = {}

    newOrder.forEach((id, index) => {
      if (scheduleGroups[id]) {
        reordered[id] = {
          ...scheduleGroups[id],
          orderIndex: index,
        }
      }
    })

    set({ scheduleGroups: reordered })
    get().updateDashboardGroups("scheduleGroups", reordered)
  },

  addItemToGroup: (groupId, itemData, customId = null) => {
    const { scheduleGroups } = get()
    const group = scheduleGroups[groupId]
    if (!group) return
    const id = customId || nanoid()
    const itemCount = Object.keys(group.items).length
    const newItem = {
      id,
      ...itemData,
      archived: false,
      createdAt: Date.now(),         // ✅ timestamp for sorting
      orderIndex: itemCount,         // ✅ optional for drag-sort
    }
    const updatedItems = { ...group.items, [id]: newItem }
    const updatedGroup = { ...group, items: updatedItems }
    const updatedGroups = { ...scheduleGroups, [groupId]: updatedGroup }
    set({ scheduleGroups: updatedGroups })
    get().updateDashboardGroups("scheduleGroups", updatedGroups)
  },

  editItemInGroup: (groupId, itemId, updatedItem) => {
    const { scheduleGroups } = get()
    const group = scheduleGroups[groupId]
    if (!group || !group.items[itemId]) return
    const updatedItems = {
      ...group.items,
      [itemId]: { ...group.items[itemId], ...updatedItem },
    }
    const updatedGroup = { ...group, items: updatedItems }
    const updatedGroups = { ...scheduleGroups, [groupId]: updatedGroup }
    set({ scheduleGroups: updatedGroups })
    get().updateDashboardGroups("scheduleGroups", updatedGroups)
  },

  deleteItemFromGroup: (groupId, itemId) => {
    const { scheduleGroups } = get()
    const group = scheduleGroups[groupId]
    if (!group || !group.items[itemId]) return
    const updatedItems = { ...group.items }
    delete updatedItems[itemId]
    const updatedGroup = { ...group, items: updatedItems }
    const updatedGroups = { ...scheduleGroups, [groupId]: updatedGroup }
    set({ scheduleGroups: updatedGroups })
    get().updateDashboardGroups("scheduleGroups", updatedGroups)
  },

  reorderItemsInGroup: (groupId, orderedItemIds) => {
    const { scheduleGroups } = get()
    const group = scheduleGroups[groupId]
    if (!group || !orderedItemIds || !Array.isArray(orderedItemIds)) return

    const existingItems = group.items || {}
    const reorderedItems = {}

    orderedItemIds.forEach((id, index) => {
      if (existingItems[id]) {
        reorderedItems[id] = {
          ...existingItems[id],
          orderIndex: index, // ✅ Update item order
        }
      }
    })

    const updatedGroup = { ...group, items: reorderedItems }
    const updatedGroups = { ...scheduleGroups, [groupId]: updatedGroup }

    set({ scheduleGroups: updatedGroups })
    get().updateDashboardGroups("scheduleGroups", updatedGroups)
  },

  updateDashboardGroups: (key, newGroups) => {
    const { currentDashboardId, dashboardData } = get()

    // ✅ Ensure the current dashboard entry exists
    const existingDashboard = dashboardData[currentDashboardId] || createEmptyDashboardData()

    const updated = {
      ...dashboardData,
      [currentDashboardId]: {
        ...existingDashboard,
        [key]: newGroups,
        lastModified: Date.now(),
      },
    }
    set({ dashboardData: updated, [key]: newGroups })
    get().saveUserData()
  },

  addDashboard: (name) => {
    const { dashboards, dashboardData } = get()
    const id = nanoid()
    const newDash = { id, name }

    const scheduleGroups = createDefaultGroups()

    const newData = {
      ...dashboardData,
      [id]: {
        scheduleGroups,
        sharedWith: [],
        lastModified: Date.now(),
      },
    }

    const newList = [...dashboards, newDash]

    set({
      dashboards: newList,
      dashboardData: newData,
      currentDashboardId: id,
      scheduleGroups,
    })

    get().saveUserData()
  },

  renameDashboard: (id, newName) => {
    const { dashboards } = get()
    const renamed = dashboards.map((d) => (d.id === id ? { ...d, name: newName } : d))
    set({ dashboards: renamed })
    get().saveUserData()
  },

  removeDashboard: (id) => {
    const { dashboards, dashboardData, currentDashboardId } = get()
    const list = dashboards.filter((d) => d.id !== id)
    const data = { ...dashboardData }
    delete data[id]

    // ✅ Fallback to remaining dashboard
    const fallbackId = list[0]?.id || "default"
    set({
      dashboards: list.length > 0 ? list : [DEFAULT_DASHBOARD],
      dashboardData: list.length > 0 ? data : { default: createEmptyDashboardData() },
      currentDashboardId: fallbackId,
    })
    get().syncDashboard()
    get().saveUserData()
  },

  setCurrentDashboard: (id) => {
    set({ currentDashboardId: id })
    get().syncDashboard()
    get().saveUserData()
  },
}))

export default useFinance
