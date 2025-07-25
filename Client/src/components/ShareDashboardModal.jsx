// components/ShareDashboardModal.jsx
import React, { useState } from "react"
import { db } from "../firebase"
import { doc, getDoc, updateDoc, collection, getDocs } from "firebase/firestore"
import toast from "react-hot-toast"
import emailjs from "@emailjs/browser"

export default function ShareDashboardModal({ isOpen, onClose, dashboardId, dashboardName }) {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleShare() {
    if (!email) return
    setLoading(true)

    try {
      const usersRef = collection(db, "users")
      const userSnapshot = await getDocs(usersRef)

      let targetUid = null

      userSnapshot.forEach((docSnap) => {
        const user = docSnap.data()
        if (user.email === email) {
          targetUid = docSnap.id
        }
      })

      const dashRef = doc(db, "dashboards", dashboardId)
      const dashSnap = await getDoc(dashRef)

      if (!dashSnap.exists()) {
        toast.error("Dashboard not found")
        setLoading(false)
        return
      }

      // 🔁 CASE 1: User exists
      if (targetUid) {
        const currentMembers = dashSnap.data().members || []

        if (currentMembers.includes(targetUid)) {
          toast("Already shared with this user", { icon: "ℹ️" })
        } else {
          await updateDoc(dashRef, {
            members: [...currentMembers, targetUid]
          })
          toast.success("Dashboard shared!")
        }
      }

      // ✉️ CASE 2: User doesn't exist — Send invite via EmailJS
      else {
        await emailjs.send(
          import.meta.env.VITE_EMAILJS_SERVICE_ID,
          import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
          {
            to_email: email,
            dashboard_name: dashboardName,
            from_name: "Finance Tracker",
            from_email: "no-reply@financetracker.com"
          },
          import.meta.env.VITE_EMAILJS_PUBLIC_KEY
        )
        toast.success("Invite sent to email!")
      }

      onClose()
      setEmail("")
    } catch (err) {
      console.error("Sharing failed:", err)
      toast.error("Something went wrong")
    }

    setLoading(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-neutral-800 p-6 rounded-xl w-full max-w-md">
        <h2 className="text-lg font-bold text-white mb-4">
          Share "{dashboardName}"
        </h2>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter email"
          className="w-full p-2 mb-4 rounded bg-neutral-700 text-white"
        />
        <div className="flex justify-end gap-4">
          <button onClick={onClose} className="text-gray-300 hover:underline">Cancel</button>
          <button
            onClick={handleShare}
            disabled={loading}
            className="bg-yellow-400 text-black font-semibold px-4 py-2 rounded hover:bg-yellow-300"
          >
            {loading ? "Sharing..." : "Share"}
          </button>
        </div>
      </div>
    </div>
  )
}
