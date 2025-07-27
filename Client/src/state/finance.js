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
      lastModified: Date.now(), // ✅ timestamp
    },
  },

  scheduleGroups: [],
  pendingGroups: [],

  syncStatus: "idle",
  setSyncStatus: (status) => set({ syncStatus: status }),

  lastLoaded: 0,
  setLastLoaded: (ts) => set({ lastLoaded: ts }),

  syncDashboard: () => {
    const { currentDashboard, dashboardData } = get();
    const { scheduleGroups = [], pendingGroups = [] } = dashboardData[currentDashboard] || {};
    set({ scheduleGroups, pendingGroups });
  },

  loadBackupFromLocalStorage: () => {
    try {
      const cached = localStorage.getItem("financeBackup");
      if (!cached) return false;
      const parsed = JSON.parse(cached);
      set({
        dashboards: parsed.dashboards,
        currentDashboard: parsed.currentDashboard,
        dashboardData: parsed.dashboardData,
        lastLoaded: parsed.lastUpdated || Date.now(),
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
      if (success) set({ userId });
      else console.error("❌ Offline and no usable local backup found.");
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
            lastModified: Date.now(),
          },
        },
        lastUpdated: Date.now(),
      };

      const userData = snapshot.exists() ? snapshot.data() : initialData;
      const loadedTime = userData.lastUpdated || Date.now();

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
        dashboards: userData.dashboards,
        currentDashboard: userData.currentDashboard,
        dashboardData: userData.dashboardData,
      });

      get().syncDashboard();
      get().setSyncStatus("synced");
      get().setLastLoaded(loadedTime);

    } catch (e) {
      console.warn("⚠️ Firestore load failed, trying local backup...", e);
      get().setSyncStatus("error");
      const success = get().loadBackupFromLocalStorage();
      if (success) set({ userId });
      else console.error("❌ No usable data available.");
    }
  },

  saveUserData: async () => {
    const {
      userId,
      dashboards: localDashboards,
      currentDashboard,
      dashboardData: localData,
      setSyncStatus,
      lastLoaded,
      setLastLoaded,
    } = get();

    if (!userId) return;

    const userRef = doc(db, "users", userId);

    try {
      setSyncStatus("syncing");

      const currentSnapshot = await getDoc(userRef);
      let mergedDashboards = [...localDashboards];
      let mergedData = { ...localData };

      if (currentSnapshot.exists()) {
        const server = currentSnapshot.data();
        const serverLastUpdated = server.lastUpdated || 0;

        const serverDashboards = server.dashboards || [];
        const serverData = server.dashboardData || {};

        if (serverLastUpdated > lastLoaded) {
          console.warn("⚠️ Firestore is newer. Performing merge...");

          mergedDashboards = Array.from(new Set([...serverDashboards, ...localDashboards]));

          const mergeGroups = (localGroups, serverGroups) => {
            const result = [...serverGroups];
            for (const group of localGroups) {
              const existing = result.find((g) => g.title === group.title);
              if (!existing) {
                result.push(group);
              } else {
                const newItems = group.items.filter(
                  (item) =>
                    !existing.items.some(
                      (i) => i.title === item.title && i.amount === item.amount
                    )
                );
                existing.items = [...existing.items, ...newItems];
              }
            }
            return result;
          };

          mergedData = { ...serverData };
          for (const name of mergedDashboards) {
            const localDash = localData[name] || {};
            const serverDash = serverData[name] || {
              scheduleGroups: [],
              pendingGroups: [],
            };

            mergedData[name] = {
              scheduleGroups: mergeGroups(localDash.scheduleGroups || [], serverDash.scheduleGroups || []),
              pendingGroups: mergeGroups(localDash.pendingGroups || [], serverDash.pendingGroups || []),
              lastModified: Date.now(), // ✅ add lastModified per dashboard
            };
          }
        } else {
          Object.entries(localData).forEach(([name, val]) => {
            if (!val.lastModified) val.lastModified = Date.now(); // ✅ fallback
          });
        }
      }

      const finalData = {
        dashboards: mergedDashboards,
        currentDashboard,
        dashboardData: mergedData,
        lastUpdated: Date.now(),
      };

      await setDoc(userRef, finalData);
      localStorage.setItem("financeBackup", JSON.stringify(finalData));
      setSyncStatus("synced");
      setLastLoaded(finalData.lastUpdated);
      console.log("✅ Data saved with merge (if needed).");

    } catch (e) {
      console.error("❌ Merge sync failed:", e);
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
        lastModified: Date.now(),
      },
    };

    set({ dashboards: newDashboards, dashboardData: newData });
    get().saveUserData();
  },

  renameDashboard: (oldName, newName) => {
    const { dashboards, dashboardData } = get();
    if (!dashboards.includes(oldName) || dashboards.includes(newName)) return;

    const updatedDashboards = dashboards.map((d) => d === oldName ? newName : d);
    const updatedData = { ...dashboardData };
    updatedData[newName] = { ...updatedData[oldName], lastModified: Date.now() };
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

  updateScheduleGroups: (groups) => {
    const { currentDashboard, dashboardData } = get();
    const updated = {
      ...dashboardData,
      [currentDashboard]: {
        ...dashboardData[currentDashboard],
        scheduleGroups: groups,
        lastModified: Date.now(),
      },
    };
    set({ dashboardData: updated, scheduleGroups: groups });
    get().saveUserData();
  },

  updatePendingGroups: (groups) => {
    const { currentDashboard, dashboardData } = get();
    const updated = {
      ...dashboardData,
      [currentDashboard]: {
        ...dashboardData[currentDashboard],
        pendingGroups: groups,
        lastModified: Date.now(),
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
