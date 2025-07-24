import React, { useState } from "react"
import AddGroupModal from "../components/AddGroupModal" // 👈 make sure it’s created
import Header from "../components/Header"
import TotalBalance from "../components/TotalBalance"
import BalanceCard from "../components/BalanceCard"
import CalendarGrid from "../components/CalendarGrid"
import ScheduleList from "../components/ScheduleList"
import BottomNav from "../components/BottomNav"
import useFinance from "../state/finance"

export default function Dashboard() {
  const scheduleGroups = useFinance((state) => state.scheduleGroups)
  const [isAddGroupOpen, setIsAddGroupOpen] = useState(false)

  const thisMonthGroup = scheduleGroups?.[0] || { title: '', items: [] }

  const currentMonthItems = thisMonthGroup.items.filter((item) => {
    const date = new Date(item.date)
    const now = new Date()
    return (
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    )
  })

  const income = currentMonthItems
    .filter((item) => item.amount > 0)
    .reduce((sum, item) => sum + item.amount, 0)

  const expenses = currentMonthItems
    .filter((item) => item.amount < 0)
    .reduce((sum, item) => sum + item.amount, 0)

  const totalBalance = income + expenses

  const calendarData = []

  return (
    <div className="min-h-screen bg-neutral-900 text-white relative pb-[120px] px-4 flex flex-col gap-6">
      <Header />

      <div className="text-center">
        <TotalBalance amount={totalBalance} />
        <div className="flex justify-center gap-4 mt-4 px-4">
          <BalanceCard label="Expenses" amount={Math.abs(expenses)} type="expense" />
          <BalanceCard label="Income" amount={income} type="income" />
        </div>
      </div>

      <CalendarGrid calendarData={calendarData} currentDate={new Date().getDate()} />
      <ScheduleList
        groupIndex={0}
        title={thisMonthGroup.title}
        items={currentMonthItems}
      />

      {/* ✅ Floating Button */}
      <button
        onClick={() => setIsAddGroupOpen(true)}
        className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-yellow-400 text-black font-semibold py-2 px-6 rounded-full shadow-lg z-50"
      >
        + Add New Group
      </button>

      <AddGroupModal isOpen={isAddGroupOpen} onClose={() => setIsAddGroupOpen(false)} />
      <BottomNav />
    </div>
  )
}
