import { create } from "zustand";
import { db } from "../firebase"; // 🔁 import Firestore
import {
  doc,
  getDoc,
  setDoc,
  onSnapshot,
} from "firebase/firestore";

const useFinance = create((set, get) => ({
  // 🔐 Logged-in user info
  userId: null,

  // 🧠 Dashboards and current view
  dashboards: ["My Budget"],
  currentDashboard: "My Budget",

  // 💾 Full user data from Firestore
  dashboardData: {
    "My Budget": {
      scheduleGroups: [
        { title: "This Month’s Schedule", items: [] },
      ],
      pendingGroups: [
        { title: "General Drafts", items: [] },
      ],
    },
  },

  scheduleGroups: [],
  pendingGroups: [],

  // 🔁 Sync selected dashboard to top-level state
  syncDashboard: () => {
    const { currentDashboard, dashboardData } = get();
    const data = dashboardData[currentDashboard] || {};
    set({
      scheduleGroups: data.scheduleGroups || [],
      pendingGroups: data.pendingGroups || [],
    });
  },

  // 🔐 Called once when user logs in
  loadUserData: async (userId) => {
    const userDocRef = doc(db, "users", userId);
    const snapshot = await getDoc(userDocRef);

    const initialData = {
      dashboards: ["My Budget"],
      currentDashboard: "My Budget",
      dashboardData: {
        "My Budget": {
          scheduleGroups: [
            { title: "This Month’s Schedule", items: [] },
          ],
          pendingGroups: [
            { title: "General Drafts", items: [] },
          ],
        },
      },
    };

    const userData = snapshot.exists() ? snapshot.data() : initialData;

    // Listen to future changes (optional: remove if not needed)
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

    get().syncDashboard(); // pull into top-level view
  },

  // 🔄 Save to Firestore
  saveUserData: () => {
    const { userId, dashboards, currentDashboard, dashboardData } = get();
    if (!userId) return;
    const userRef = doc(db, "users", userId);
    setDoc(userRef, {
      dashboards,
      currentDashboard,
      dashboardData,
    });
  },

  // ✅ All your existing mutation methods — just call saveUserData() after set()

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
        scheduleGroups: [
          { title: "This Month’s Schedule", items: [] },
        ],
        pendingGroups: [
          { title: "General Drafts", items: [] },
        ],
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
    const updated = [...pendingGroups];
    updated[groupIndex].items.splice(itemIndex, 1);
    get().updatePendingGroups(updated);
  },
}));

export default useFinance;
