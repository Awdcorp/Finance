// ✅ src/state/auth.js
import { create } from "zustand";

const useAuth = create((set) => ({
  // 🔐 Stores Firebase user object
  currentUser: null,

  // 🔄 Set user (Google or Email)
  setCurrentUser: (user) => set({ currentUser: user }),

  // 🚪 Clear user on logout
  clearUser: () => set({ currentUser: null }),
}));

export default useAuth;
