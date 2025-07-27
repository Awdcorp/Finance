import { create } from "zustand";
import { db } from "../firebase";
import {
  doc,
  getDoc,
  setDoc,
  onSnapshot,
} from "firebase/firestore";

const useFinance = create((set, get) => ({
  userId: null,

  dashboards: ["My Budget"],
  currentDashboard: "My Budget",

  dashboardData: {
    "My Budget": {
      scheduleGroups: [{ title: "This Month’s Schedule", items: [] }],
      pendingGroups: [{ title: "General Drafts", items: [] }],
    },
  },

  scheduleGroups: [],
  pendingGroups: [],

  // 🟢 NEW: Sync status state
  syncStatus: "idle", // syncing | synced | offline | error
  setSyncStatus: (status) => set({ syncStatus: status }),

  syncDashboard: () => {
    const { currentDashboard, dashboardData } = get();
    const data = dashboardData[currentDashboard] || {};
    set({
      scheduleGroups: data.scheduleGroups || [],
      pendingGroups: data.pendingGroups || [],
    });
  },

  // ✅ Fallback: Load from localStorage if online fails
  loadBackupFromLocalStorage: () => {
    try {
      const cached = localStorage.getItem("financeBackup");
      if (!cached) return false;
      const parsed = JSON.parse(cached);
      set({
        dashboards: parsed.dashboards,
        currentDashboard: parsed.currentDashboard,
        dashboardData: parsed.dashboardData,
      });
      get().syncDashboard();
      console.log("✅ Loaded dashboard data from localStorage backup.");
      return true;
    } catch (e) {
      console.warn("⚠️ Failed to load local backup:", e);
      return false;
    }
  },

  loadUserData: async (userId) => {
    const userDocRef = doc(db, "users", userId);

    if (!navigator.onLine) {
      console.warn("🚫 No internet. Loading from local backup...");
      get().setSyncStatus("offline");
      const success = get().loadBackupFromLocalStorage();
      if (success) {
        set({ userId });
      } else {
        console.error("❌ Offline and no usable local backup found.");
      }
      return;
    }

    try {
      const snapshot = await getDoc(userDocRef);

      const initialData = {
        dashboards: ["My Budget"],
        currentDashboard: "My Budget",
        dashboardData: {
          "My Budget": {
            scheduleGroups: [{ title: "This Month’s Schedule", items: [] }],
            pendingGroups: [{ title: "General Drafts", items: [] }],
          },
        },
      };

      const userData = snapshot.exists() ? snapshot.data() : initialData;

      onSnapshot(userDocRef, (snap) => {
        if (snap.exists()) {
          const newData = snap.data();
          set({
            dashboards: newData.dashboards,
            currentDashboard: newData.currentDashboard,
            dashboardData: newData.dashboardData,
          });
          get().syncDashboard();
        }
      });

      set({
        userId,
        ...userData,
      });

      get().syncDashboard();
      get().setSyncStatus("synced");

    } catch (e) {
      console.warn("⚠️ Firestore load failed, trying local backup...", e);
      get().setSyncStatus("error");
      const success = get().loadBackupFromLocalStorage();
      if (success) {
        set({ userId });
      } else {
        console.error("❌ No usable data available.");
      }
    }
  },

  // 🔄 Save to Firestore and backup locally with sync status
  saveUserData: () => {
    const {
      userId,
      dashboards,
      currentDashboard,
      dashboardData,
      setSyncStatus,
    } = get();

    if (!userId) return;

    const userRef = doc(db, "users", userId);
    const fullData = { dashboards, currentDashboard, dashboardData };

    try {
      setSyncStatus("syncing");

      setDoc(userRef, fullData)
        .then(() => {
          localStorage.setItem("financeBackup", JSON.stringify(fullData));
          setSyncStatus("synced");
        })
        .catch((e) => {
          console.error("❌ Firestore sync failed:", e);
          setSyncStatus("error");
        });

    } catch (e) {
      setSyncStatus("error");
    }
  },

  setCurrentDashboard: (name) => {
    set({ currentDashboard: name }, false, "setCurrentDashboard");
    get().syncDashboard();
    get().saveUserData();
  },

  addDashboard: (name) => {
    const { dashboards, dashboardData } = get();
    if (dashboards.includes(name)) return;

    const newDashboards = [...dashboards, name];
    const newData = {
      ...dashboardData,
      [name]: {
        scheduleGroups: [{ title: "This Month’s Schedule", items: [] }],
        pendingGroups: [{ title: "General Drafts", items: [] }],
      },
    };

    set({ dashboards: newDashboards, dashboardData: newData });
    get().saveUserData();
  },

  renameDashboard: (oldName, newName) => {
    const { dashboards, dashboardData } = get();
    if (!dashboards.includes(oldName) || dashboards.includes(newName)) return;

    const updatedDashboards = dashboards.map((d) =>
      d === oldName ? newName : d
    );
    const updatedData = { ...dashboardData };
    updatedData[newName] = updatedData[oldName];
    delete updatedData[oldName];

    set({
      dashboards: updatedDashboards,
      dashboardData: updatedData,
    });
    get().saveUserData();
  },

  removeDashboard: (name) => {
    const { dashboards, dashboardData } = get();
    const updatedDashboards = dashboards.filter((d) => d !== name);
    const updatedData = { ...dashboardData };
    delete updatedData[name];

    set({
      dashboards: updatedDashboards,
      dashboardData: updatedData,
    });
    get().saveUserData();
  },

  // 🎯 Shared utility for updating schedule groups
  updateScheduleGroups: (groups) => {
    const { currentDashboard, dashboardData } = get();
    const updated = {
      ...dashboardData,
      [currentDashboard]: {
        ...dashboardData[currentDashboard],
        scheduleGroups: groups,
      },
    };
    set({ dashboardData: updated, scheduleGroups: groups });
    get().saveUserData();
  },

  addScheduleGroup: (group) => {
    const { scheduleGroups } = get();
    get().updateScheduleGroups([...scheduleGroups, group]);
  },

  renameGroup: (index, newTitle) => {
    const { scheduleGroups } = get();
    const updated = [...scheduleGroups];
    updated[index].title = newTitle;
    get().updateScheduleGroups(updated);
  },

  deleteGroup: (index) => {
    const { scheduleGroups } = get();
    const updated = [...scheduleGroups];
    updated.splice(index, 1);
    get().updateScheduleGroups(updated);
  },

  addItemToGroup: (groupIndex, item) => {
    const { scheduleGroups } = get();
    const updated = [...scheduleGroups];
    updated[groupIndex].items.push(item);
    get().updateScheduleGroups(updated);
  },

  editItemInGroup: (groupIndex, itemIndex, updatedItem) => {
    const { scheduleGroups } = get();
    const updated = [...scheduleGroups];
    updated[groupIndex].items[itemIndex] = {
      ...updated[groupIndex].items[itemIndex],
      ...updatedItem,
    };
    get().updateScheduleGroups(updated);
  },

  deleteItemFromGroup: (groupIndex, itemIndex) => {
    const { scheduleGroups } = get();
    const updated = [...scheduleGroups];
    updated[groupIndex].items.splice(itemIndex, 1);
    get().updateScheduleGroups(updated);
  },

  // ✅ Similar changes for pendingGroups (optional, can modularize like above)
  updatePendingGroups: (groups) => {
    const { currentDashboard, dashboardData } = get();
    const updated = {
      ...dashboardData,
      [currentDashboard]: {
        ...dashboardData[currentDashboard],
        pendingGroups: groups,
      },
    };
    set({ dashboardData: updated, pendingGroups: groups });
    get().saveUserData();
  },

  addPendingGroup: (group) => {
    const { pendingGroups } = get();
    get().updatePendingGroups([...pendingGroups, group]);
  },

  renamePendingGroup: (index, newTitle) => {
    const { pendingGroups } = get();
    const updated = [...pendingGroups];
    updated[index].title = newTitle;
    get().updatePendingGroups(updated);
  },

  deletePendingGroup: (index) => {
    const { pendingGroups } = get();
    const updated = [...pendingGroups];
    updated.splice(index, 1);
    get().updatePendingGroups(updated);
  },

  addPendingItemToGroup: (groupIndex, item) => {
    const { pendingGroups } = get();
    const updated = [...pendingGroups];
    updated[groupIndex].items.push(item);
    get().updatePendingGroups(updated);
  },

  editPendingItemInGroup: (groupIndex, itemIndex, updatedItem) => {
    const { pendingGroups } = get();
    const updated = [...pendingGroups];
    updated[groupIndex].items[itemIndex] = {
      ...updated[groupIndex].items[itemIndex],
      ...updatedItem,
    };
    get().updatePendingGroups(updated);
  },

  removePendingItemFromGroup: (groupIndex, itemIndex) => {
    const { pendingGroups } = get();
    if (
      !Array.isArray(pendingGroups) ||
      !pendingGroups[groupIndex] ||
      !Array.isArray(pendingGroups[groupIndex].items)
    ) {
      console.warn("Invalid removePendingItemFromGroup params", { groupIndex, itemIndex });
      return;
    }

    const updated = [...pendingGroups];
    updated[groupIndex] = {
      ...updated[groupIndex],
      items: [...updated[groupIndex].items],
    };
    updated[groupIndex].items.splice(itemIndex, 1);
    get().updatePendingGroups(updated);
  },
}));

export default useFinance;
