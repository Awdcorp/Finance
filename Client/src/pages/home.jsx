import React, { useState } from "react"
import AddGroupModal from "../components/AddGroupModal"
import Header from "../components/Header"
import TotalBalance from "../components/TotalBalance"
import BalanceCard from "../components/BalanceCard"
import CalendarGrid from "../components/CalendarGrid"
import ScheduleList from "../components/ScheduleList"
import BottomNav from "../components/BottomNav"
import useFinance from "../state/finance"
import getItemsForMonth from "../utils/getItemsForMonth" // ✅ NEW
import getProjectedBalance from "../utils/getProjectedBalance"
import PendingTransactionList from "../components/PendingTransactionList"
import AddPendingGroupModal from "../components/AddPendingGroupModal"

export default function Dashboard() {
  const scheduleGroups = useFinance((state) => state.scheduleGroups)
  const [isAddGroupOpen, setIsAddGroupOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [showAddPendingGroup, setShowAddPendingGroup] = useState(false)

  // ✅ Change visible month
  function handleMonthChange(offset) {
    const newDate = new Date(selectedDate)
    newDate.setMonth(selectedDate.getMonth() + offset)
    setSelectedDate(newDate)
  }

  // ✅ Use shared filtering logic (replaces manual loop)
  const currentMonthItems = getItemsForMonth(scheduleGroups, selectedDate)

  const income = currentMonthItems
    .filter((item) => item.amount > 0)
    .reduce((sum, item) => sum + item.amount, 0)

  const expenses = currentMonthItems
    .filter((item) => item.amount < 0)
    .reduce((sum, item) => sum + item.amount, 0)

  const totalBalance = income + expenses
  const calendarData = [] // optional, for future enhancement
  const projectedBalance = getProjectedBalance(scheduleGroups, selectedDate);
console.log("DEBUG - Projected Balance Inputs:");
console.log("Selected:", selectedDate);
console.log("ScheduleGroups:", scheduleGroups);

scheduleGroups.forEach((g, i) => {
  console.log(`Group ${i}: ${g.title}`);
  g.items.forEach((item) =>
    console.log(`${item.title} - ${item.amount} € - ${item.date}`)
  );
});


  return (
    <div className="min-h-screen bg-neutral-900 text-white relative pb-[120px] px-4 flex flex-col gap-6">
      <Header />

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
        className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-yellow-400 text-black font-semibold py-2 px-6 rounded-full shadow-lg z-50"
      >
        + Add New Group
      </button>

      <AddGroupModal isOpen={isAddGroupOpen} onClose={() => setIsAddGroupOpen(false)} />
      
      {/* Floating Button */}
      <button
        onClick={() => setShowAddPendingGroup(true)}
        className="fixed bottom-24 right-4 z-50 bg-yellow-500 text-black px-4 py-2 rounded-full font-semibold shadow-md"
      >
        + Add Draft Group
      </button>

      {/* Modal */}
      <AddPendingGroupModal
        isOpen={showAddPendingGroup}
        onClose={() => setShowAddPendingGroup(false)}
      />
      <PendingTransactionList />
      <BottomNav />
    </div>
  )
}
