import React, { useEffect, useState } from "react"
import AddGroupModal from "../components/AddGroupModal"
import Header from "../components/Header"
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
import DashboardSelector from "../components/DashboardSelector" // ✅ NEW

export default function Dashboard() {
  const scheduleGroups = useFinance((state) => state.scheduleGroups)
  const currentDashboard = useFinance((state) => state.currentDashboard)
  const syncDashboard = useFinance((state) => state.syncDashboard)

  const [isAddGroupOpen, setIsAddGroupOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [showAddPendingGroup, setShowAddPendingGroup] = useState(false)

  // ✅ Sync dashboard data on change
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
  const calendarData = []
  const projectedBalance = getProjectedBalance(scheduleGroups, selectedDate)

  return (
    <div className="min-h-screen bg-neutral-900 text-white relative pb-[120px] px-4 flex flex-col gap-6">
      <div className="mt-4">
        <DashboardSelector /> {/* ✅ Top dropdown */}
      </div>

      {/* Month Selector */}
      <div className="flex justify-between items-center text-white px-2 mt-2">
        <button onClick={() => handleMonthChange(-1)} className="text-2xl">←</button>
        <span className="text-lg font-semibold">
          {selectedDate.toLocaleString("default", { month: "long", year: "numeric" })}
        </span>
        <button onClick={() => handleMonthChange(1)} className="text-2xl">→</button>
      </div>

      {/* Summary Cards */}
      <div className="text-center">
        <TotalBalance amount={totalBalance} selectedDate={selectedDate} />
        <div className="text-center text-sm text-yellow-300 mt-1">
          Projected Balance till this month: {projectedBalance.toFixed(2)} €
        </div>
        <div className="flex justify-center gap-4 mt-4 px-4">
          <BalanceCard label="Expenses" amount={Math.abs(expenses)} type="expense" />
          <BalanceCard label="Income" amount={income} type="income" />
        </div>
      </div>

      <CalendarGrid
        calendarData={calendarData}
        currentDate={selectedDate.getDate()}
      />

      {/* Schedule Display */}
      <ScheduleList
        groupIndex={0}
        title={`${selectedDate.toLocaleString("default", {
          month: "long",
          year: "numeric",
        })}'s Schedule`}
        items={currentMonthItems}
      />

      {/* Floating Add Group Button */}
      <button
        onClick={() => setIsAddGroupOpen(true)}
        className="text-yellow-400 hover:text-yellow-300 text-sm pb-4"
      >
        + Add New Group
      </button>

      <AddGroupModal isOpen={isAddGroupOpen} onClose={() => setIsAddGroupOpen(false)} />

      <div className="px-4">
        <PendingSummaryCard />
      </div>

      <PendingTransactionList />

      <button
        onClick={() => setShowAddPendingGroup(true)}
        className="text-yellow-400 hover:text-yellow-300 text-sm pb-4"
      >
        + Add Draft Group
      </button>

      <AddPendingGroupModal
        isOpen={showAddPendingGroup}
        onClose={() => setShowAddPendingGroup(false)}
      />

      <BottomNav />
    </div>
  )
}
