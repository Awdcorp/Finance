// ✅ Zustand store for Finance Tracker — unified structure with tags, versioning, shared support

import { create } from "zustand"
import { db } from "../firebase"
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore"
import { nanoid } from "nanoid"

const DEFAULT_DASHBOARD = { id: "default", name: "My Budget" }

const useFinance = create((set, get) => ({
  userId: null,

  dashboards: [DEFAULT_DASHBOARD],
  currentDashboardId: "default",

  dashboardData: {
    default: {
      scheduleGroups: {},
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

  loadUserData: async (userId) => {
    const userDocRef = doc(db, "users", userId)
    const fallback = {
      dashboards: [DEFAULT_DASHBOARD],
      currentDashboardId: "default",
      dashboardData: {
        default: {
          scheduleGroups: {},
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
    const newGroup = { id, title, isPending, items: {}, tags, archived: false }
    const { scheduleGroups } = get()
    const updated = { ...scheduleGroups, [id]: newGroup }
    set({ scheduleGroups: updated })
    get().updateDashboardGroups("scheduleGroups", updated)
  },

  renameGroup: (groupId, newTitle) => {
    const { scheduleGroups } = get()
    if (!scheduleGroups[groupId]) return
    const updatedGroup = { ...scheduleGroups[groupId], title: newTitle }
    const updated = { ...scheduleGroups, [groupId]: updatedGroup }
    set({ scheduleGroups: updated })
    get().updateDashboardGroups("scheduleGroups", updated)
  },

  deleteGroup: (groupId) => {
    const { scheduleGroups } = get()
    const updated = { ...scheduleGroups }
    delete updated[groupId]
    set({ scheduleGroups: updated })
    get().updateDashboardGroups("scheduleGroups", updated)
  },

  addItemToGroup: (groupId, itemData) => {
    const { scheduleGroups } = get()
    const group = scheduleGroups[groupId]
    if (!group) return
    const id = nanoid()
    const newItem = { id, ...itemData, archived: false }
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

  updateDashboardGroups: (key, newGroups) => {
    const { currentDashboardId, dashboardData } = get()
    const updated = {
      ...dashboardData,
      [currentDashboardId]: {
        ...dashboardData[currentDashboardId],
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
    const newList = [...dashboards, newDash]
    const newData = {
      ...dashboardData,
      [id]: {
        scheduleGroups: {},
        sharedWith: [],
        lastModified: Date.now(),
      },
    }
    set({ dashboards: newList, dashboardData: newData })
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
      dashboardData: list.length > 0 ? data : { default: { scheduleGroups: {}, lastModified: Date.now(), sharedWith: [] } },
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
