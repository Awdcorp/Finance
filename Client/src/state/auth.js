import { create } from "zustand"

const useAuth = create((set) => ({
  currentUser: null, // user info from Google
  setCurrentUser: (user) => set({ currentUser: user }),
}))

export default useAuth
