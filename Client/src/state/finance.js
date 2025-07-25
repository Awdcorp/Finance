import { create } from 'zustand'

const useFinance = create((set, get) => ({
  // 🧠 Dashboards
  dashboards: ["My Budget"],
  currentDashboard: "My Budget",

  // 🌐 Dashboard data: each dashboard has its own groups
  dashboardData: {
    "My Budget": {
      scheduleGroups: [
        {
          title: "This Month’s Schedule",
          items: [],
        },
      ],
      pendingGroups: [
        {
          title: "General Drafts",
          items: [],
        },
      ],
    },
  },

  // 🧩 Dashboard switching
  setCurrentDashboard: (name) => set({ currentDashboard: name }),

  addDashboard: (name) => {
    const { dashboardData, dashboards } = get()
    if (dashboards.includes(name)) return

    set({
      dashboards: [...dashboards, name],
      dashboardData: {
        ...dashboardData,
        [name]: {
          scheduleGroups: [
            {
              title: "This Month’s Schedule",
              items: [],
            },
          ],
          pendingGroups: [
            {
              title: "General Drafts",
              items: [],
            },
          ],
        },
      },
    })
  },

  renameDashboard: (oldName, newName) => {
  const { dashboards, dashboardData } = get()

  if (!dashboards.includes(oldName) || dashboards.includes(newName)) return

  const updatedDashboards = dashboards.map((d) =>
    d === oldName ? newName : d
  )

  const updatedData = {
    ...dashboardData,
    [newName]: dashboardData[oldName],
  }
  delete updatedData[oldName]

  set({
    dashboards: updatedDashboards,
    dashboardData: updatedData,
  })
},

removeDashboard: (name) => {
  const { dashboards, dashboardData } = get()
  if (!dashboards.includes(name)) return

  const updatedDashboards = dashboards.filter((d) => d !== name)
  const updatedData = { ...dashboardData }
  delete updatedData[name]

  set({
    dashboards: updatedDashboards,
    dashboardData: updatedData,
  })
},


  // 🎯 Selectors
  scheduleGroups: [],
  pendingGroups: [],

  // 🚀 Sync active dashboard data into top-level for easier access
  syncDashboard: () => {
    const { currentDashboard, dashboardData } = get()
    const data = dashboardData[currentDashboard] || {}
    set({
      scheduleGroups: data.scheduleGroups || [],
      pendingGroups: data.pendingGroups || [],
    })
  },

  // ✅ Schedule Group methods
  addScheduleGroup: (group) => {
    const { currentDashboard, dashboardData } = get()
    const newGroups = [...dashboardData[currentDashboard].scheduleGroups, group]

    set({
      dashboardData: {
        ...dashboardData,
        [currentDashboard]: {
          ...dashboardData[currentDashboard],
          scheduleGroups: newGroups,
        },
      },
      scheduleGroups: newGroups,
    })
  },

  renameGroup: (index, newTitle) => {
    const { currentDashboard, dashboardData } = get()
    const updated = [...dashboardData[currentDashboard].scheduleGroups]
    updated[index].title = newTitle
    set({
      dashboardData: {
        ...dashboardData,
        [currentDashboard]: {
          ...dashboardData[currentDashboard],
          scheduleGroups: updated,
        },
      },
      scheduleGroups: updated,
    })
  },

  deleteGroup: (index) => {
    const { currentDashboard, dashboardData } = get()
    const updated = [...dashboardData[currentDashboard].scheduleGroups]
    updated.splice(index, 1)
    set({
      dashboardData: {
        ...dashboardData,
        [currentDashboard]: {
          ...dashboardData[currentDashboard],
          scheduleGroups: updated,
        },
      },
      scheduleGroups: updated,
    })
  },

  addItemToGroup: (groupIndex, item) => {
    const { currentDashboard, dashboardData } = get()
    const groups = [...dashboardData[currentDashboard].scheduleGroups]
    groups[groupIndex].items.push(item)
    set({
      dashboardData: {
        ...dashboardData,
        [currentDashboard]: {
          ...dashboardData[currentDashboard],
          scheduleGroups: groups,
        },
      },
      scheduleGroups: groups,
    })
  },

  editItemInGroup: (groupIndex, itemIndex, updatedItem) => {
    const { currentDashboard, dashboardData } = get()
    const groups = [...dashboardData[currentDashboard].scheduleGroups]
    groups[groupIndex].items[itemIndex] = {
      ...groups[groupIndex].items[itemIndex],
      ...updatedItem,
    }
    set({
      dashboardData: {
        ...dashboardData,
        [currentDashboard]: {
          ...dashboardData[currentDashboard],
          scheduleGroups: groups,
        },
      },
      scheduleGroups: groups,
    })
  },

  deleteItemFromGroup: (groupIndex, itemIndex) => {
    const { currentDashboard, dashboardData } = get()
    const groups = [...dashboardData[currentDashboard].scheduleGroups]
    groups[groupIndex].items.splice(itemIndex, 1)
    set({
      dashboardData: {
        ...dashboardData,
        [currentDashboard]: {
          ...dashboardData[currentDashboard],
          scheduleGroups: groups,
        },
      },
      scheduleGroups: groups,
    })
  },

  // ✅ Pending Group methods (drafts)
  addPendingGroup: (group) => {
    const { currentDashboard, dashboardData } = get()
    const newGroups = [...dashboardData[currentDashboard].pendingGroups, group]
    set({
      dashboardData: {
        ...dashboardData,
        [currentDashboard]: {
          ...dashboardData[currentDashboard],
          pendingGroups: newGroups,
        },
      },
      pendingGroups: newGroups,
    })
  },

  renamePendingGroup: (index, newTitle) => {
    const { currentDashboard, dashboardData } = get()
    const updated = [...dashboardData[currentDashboard].pendingGroups]
    updated[index].title = newTitle
    set({
      dashboardData: {
        ...dashboardData,
        [currentDashboard]: {
          ...dashboardData[currentDashboard],
          pendingGroups: updated,
        },
      },
      pendingGroups: updated,
    })
  },

  deletePendingGroup: (index) => {
    const { currentDashboard, dashboardData } = get()
    const updated = [...dashboardData[currentDashboard].pendingGroups]
    updated.splice(index, 1)
    set({
      dashboardData: {
        ...dashboardData,
        [currentDashboard]: {
          ...dashboardData[currentDashboard],
          pendingGroups: updated,
        },
      },
      pendingGroups: updated,
    })
  },

  addPendingItemToGroup: (groupIndex, item) => {
    const { currentDashboard, dashboardData } = get()
    const groups = [...dashboardData[currentDashboard].pendingGroups]
    groups[groupIndex].items.push(item)
    set({
      dashboardData: {
        ...dashboardData,
        [currentDashboard]: {
          ...dashboardData[currentDashboard],
          pendingGroups: groups,
        },
      },
      pendingGroups: groups,
    })
  },

  editPendingItemInGroup: (groupIndex, itemIndex, updatedItem) => {
    const { currentDashboard, dashboardData } = get()
    const groups = [...dashboardData[currentDashboard].pendingGroups]
    groups[groupIndex].items[itemIndex] = {
      ...groups[groupIndex].items[itemIndex],
      ...updatedItem,
    }
    set({
      dashboardData: {
        ...dashboardData,
        [currentDashboard]: {
          ...dashboardData[currentDashboard],
          pendingGroups: groups,
        },
      },
      pendingGroups: groups,
    })
  },

  removePendingItemFromGroup: (groupIndex, itemIndex) => {
    const { currentDashboard, dashboardData } = get()
    const groups = [...dashboardData[currentDashboard].pendingGroups]
    groups[groupIndex].items.splice(itemIndex, 1)
    set({
      dashboardData: {
        ...dashboardData,
        [currentDashboard]: {
          ...dashboardData[currentDashboard],
          pendingGroups: groups,
        },
      },
      pendingGroups: groups,
    })
  },
}))

export default useFinance
