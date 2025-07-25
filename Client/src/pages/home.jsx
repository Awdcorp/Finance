import React, { useEffect, useState } from "react"
import AddGroupModal from "../components/AddGroupModal"
import TotalBalance from "../components/TotalBalance"
import BalanceCard from "../components/BalanceCard"
import CalendarGrid from "../components/CalendarGrid"
import ScheduleList from "../components/ScheduleList"
import BottomNav from "../components/BottomNav"
import useFinance from "../state/finance"
import getItemsForMonth from "../utils/getItemsForMonth"
import getProjectedBalance from "../utils/getProjectedBalance"
import PendingTransactionList from "../components/PendingTransactionList"
import AddPendingGroupModal from "../components/AddPendingGroupModal"
import PendingSummaryCard from "../components/PendingSummaryCard"
import DashboardSelector from "../components/DashboardSelector"
import SidebarNav from "../components/SidebarNav"

export default function Dashboard({ user }) { // ✅ Accept user from App.jsx
  const scheduleGroups = useFinance((state) => state.scheduleGroups)
  const currentDashboard = useFinance((state) => state.currentDashboard)
  const syncDashboard = useFinance((state) => state.syncDashboard)
  const loadUserData = useFinance((state) => state.loadUserData)

  const [isAddGroupOpen, setIsAddGroupOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [showAddPendingGroup, setShowAddPendingGroup] = useState(false)

  // ✅ Load user data from Firestore on login
  useEffect(() => {
    if (user?.uid) {
      loadUserData(user.uid)
    }
  }, [user])

  // ✅ Sync dashboard when changed
  useEffect(() => {
    syncDashboard()
    setSelectedDate(new Date())
  }, [currentDashboard])

  function handleMonthChange(offset) {
    const newDate = new Date(selectedDate)
    newDate.setMonth(selectedDate.getMonth() + offset)
    setSelectedDate(newDate)
  }

  const currentMonthItems = getItemsForMonth(scheduleGroups, selectedDate)

  const income = currentMonthItems
    .filter((item) => item.amount > 0)
    .reduce((sum, item) => sum + item.amount, 0)

  const expenses = currentMonthItems
    .filter((item) => item.amount < 0)
    .reduce((sum, item) => sum + item.amount, 0)

  const totalBalance = income + expenses
  const projectedBalance = getProjectedBalance(scheduleGroups, selectedDate)

  return (
    <div className="min-h-screen bg-neutral-900 text-white flex flex-col lg:flex-row">

      {/* Sidebar for Desktop */}
      <SidebarNav />

      {/* Main Dashboard Area */}
      <div className="flex-1 lg:ml-64 px-4 pt-6 pb-[120px] flex flex-col gap-6">
        
        <DashboardSelector />

        {/* Month Selector */}
        <div className="flex justify-between items-center text-white px-2 mt-2">
          <button onClick={() => handleMonthChange(-1)} className="text-2xl">←</button>
          <span className="text-lg font-semibold">
            {selectedDate.toLocaleString("default", { month: "long", year: "numeric" })}
          </span>
          <button onClick={() => handleMonthChange(1)} className="text-2xl">→</button>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT */}
          <div>
            <TotalBalance amount={totalBalance} selectedDate={selectedDate} />
            <div className="text-center lg:text-left text-sm text-yellow-300 mt-1">
              Projected Balance till this month: {projectedBalance.toFixed(2)} €
            </div>
            <div className="flex justify-center lg:justify-start gap-4 mt-4 px-4">
              <BalanceCard label="Expenses" amount={Math.abs(expenses)} type="expense" />
              <BalanceCard label="Income" amount={income} type="income" />
            </div>
            <CalendarGrid calendarData={[]} currentDate={selectedDate.getDate()} />
          </div>

          {/* RIGHT */}
          <div>
            <ScheduleList
              groupIndex={0}
              title={`${selectedDate.toLocaleString("default", {
                month: "long",
                year: "numeric",
              })}'s Schedule`}
              items={currentMonthItems}
            />

            <button
              onClick={() => setIsAddGroupOpen(true)}
              className="text-yellow-400 hover:text-yellow-300 text-sm pb-4"
            >
              + Add New Group
            </button>

            <PendingSummaryCard />
            <PendingTransactionList />

            <button
              onClick={() => setShowAddPendingGroup(true)}
              className="text-yellow-400 hover:text-yellow-300 text-sm pb-4"
            >
              + Add Draft Group
            </button>
          </div>
        </div>

        {/* Modals */}
        <AddGroupModal isOpen={isAddGroupOpen} onClose={() => setIsAddGroupOpen(false)} />
        <AddPendingGroupModal isOpen={showAddPendingGroup} onClose={() => setShowAddPendingGroup(false)} />

        {/* Mobile Nav */}
        <div className="lg:hidden">
          <BottomNav />
        </div>
      </div>
    </div>
  )
}
