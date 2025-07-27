import React, { useState } from "react"
import BottomNav from "../components/BottomNav"
import SidebarNav from "../components/SidebarNav"
import useFinance from "../state/finance"
import getItemsForMonth from "../utils/getItemsForMonth";
import BalanceCard from "../components/BalanceCard";
import {
  PieChart, Pie, Cell, Tooltip,
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer
} from "recharts"
import { ArrowDownRight, ArrowUpRight, BarChart3,
  PieChart as PieIcon,
  Activity,
  CalendarClock,
  Repeat2,
  Folders,
} from "lucide-react"

const COLORS = ["#10b981", "#ef4444", "#facc15", "#3b82f6", "#a855f7"]

export default function Stats() {
  const scheduleGroups = useFinance((state) => state.scheduleGroups)
  const [selectedMonth, setSelectedMonth] = useState(new Date())

  const rawItems = getItemsForMonth(scheduleGroups, selectedMonth);

    const filteredItems = rawItems.map((item) => {
    // Match this item to its group index using the original item (by title & amount)
    const groupIndex = scheduleGroups.findIndex(group =>
        group.items.some(original =>
        original.title === item.title &&
        original.amount === item.amount &&
        new Date(original.date).getTime() === new Date(item.originalDate || item.date).getTime()
        )
    );
    return { ...item, groupIndex };
    });

  const incomeItems = filteredItems.filter((i) => i.amount > 0)
  const expenseItems = filteredItems.filter((i) => i.amount < 0)
  const incomeTotal = incomeItems.reduce((sum, i) => sum + i.amount, 0)
  const expenseTotal = expenseItems.reduce((sum, i) => sum + i.amount, 0)

  const categorySummary = {}
  const groupSummary = {}
  let repeatCount = 0

  filteredItems.forEach((item) => {
    const key = item.category || "Other"
    categorySummary[key] = (categorySummary[key] || 0) + item.amount

    const groupTitle = scheduleGroups[item.groupIndex]?.title || "Untitled"
    groupSummary[groupTitle] = (groupSummary[groupTitle] || 0) + item.amount

    if (item.repeat) repeatCount++
  })

  const recurringStats = filteredItems
    .filter((item) => item.repeat && item.repeatEndDate)
    .map((item) => {
      const start = new Date(item.date)
      const end = new Date(item.repeatEndDate)
      const now = new Date(selectedMonth)
      const monthsLeft = Math.max(
        0,
        (end.getFullYear() - now.getFullYear()) * 12 + (end.getMonth() - now.getMonth())
      )

      return {
        title: item.title || "Untitled",
        amount: item.amount,
        startDate: item.date,
        endDate: item.repeatEndDate,
        monthsLeft,
      }
    })

  const handleMonthChange = (offset) => {
    const newDate = new Date(selectedMonth)
    newDate.setMonth(selectedMonth.getMonth() + offset)
    setSelectedMonth(newDate)
  }

  return (
    <div className="min-h-screen bg-neutral-900 text-white flex flex-col lg:flex-row">

      {/* Sidebar for Desktop */}
      <SidebarNav />

      {/* Main Content */}
      <div className="flex-1 lg:ml-64 px-4 pt-6 pb-28 w-full max-w-screen-xl mx-auto">

            <h2 className="text-xl font-semibold mb-6 flex justify-center items-center gap-2 text-white-300">
            <BarChart3 className="w-6 h-6 text-yellow-400" /> Statistics
            </h2>

        {/* Month Selector */}
        <div className="flex justify-between items-center  text-white mb-8 px-2">
          <button onClick={() => handleMonthChange(-1)} className="text-2xl">←</button>
          <span className="text-lg font-semibold">
            {selectedMonth.toLocaleString("default", { month: "long", year: "numeric" })}
          </span>
          <button onClick={() => handleMonthChange(1)} className="text-2xl">→</button>
        </div>

        {/* Grid for charts + cards */}
        <div className="grid lg:grid-cols-2 gap-6">

          {/* Summary Cards */}
<div className="flex justify-center">
  <div className="flex justify-center lg:justify-start gap-4 mt-2 px-4 max-w-md w-full">
    <BalanceCard label="Income" amount={incomeTotal} type="income" />
    <BalanceCard label="Expenses" amount={Math.abs(expenseTotal)} type="expense" />
  </div>
</div>


          {/* Income vs Expenses */}
          <div className="bg-neutral-800 rounded-xl p-4 shadow-md hover:shadow-lg transition-all">
            <div className="text-center text-sm mb-3 font-medium text-gray-300 flex justify-center items-center gap-2">
              <Activity size={16} /> Income vs Expenses
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={[{ name: "This Month", Income: incomeTotal, Expenses: Math.abs(expenseTotal) }]}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="Income" fill="#10b981" />
                <Bar dataKey="Expenses" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Category Breakdown */}
          <div className="bg-neutral-800 rounded-xl p-4 shadow-md">
            <div className="text-center text-sm mb-3 font-medium text-gray-300 flex justify-center items-center gap-2">
              <PieIcon size={16} /> Category Breakdown
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={Object.entries(categorySummary).map(([key, value]) => ({ name: key, value }))}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {Object.keys(categorySummary).map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Group Summary */}
          <div className="bg-neutral-800 rounded-xl p-4 shadow-md">
            <div className="text-center text-sm mb-3 font-medium text-gray-300 flex justify-center items-center gap-2">
              <Folders size={16} /> Group Summary
            </div>
            <ul className="text-sm">
              {Object.entries(groupSummary).map(([group, value], i) => (
                <li key={i} className="flex justify-between border-b border-neutral-700 py-1">
                  <span>{group}</span>
                  <span className={value < 0 ? "text-red-400" : "text-green-400"}>
                    ₹ {value.toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Repeat Pie Chart */}
          <div className="bg-neutral-800 rounded-xl p-4 shadow-md">
            <div className="text-center text-sm mb-3 font-medium text-gray-300 flex justify-center items-center gap-2">
              <Repeat2 size={16} /> Repeat vs One-Time
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={[
                    { name: "Recurring", value: repeatCount },
                    { name: "One-Time", value: filteredItems.length - repeatCount },
                  ]}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  <Cell fill="#facc15" />
                  <Cell fill="#3b82f6" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Recurring Table */}
          {recurringStats.length > 0 && (
            <div className="bg-neutral-800 rounded-xl p-4 col-span-full shadow-md">
              <div className="text-center text-sm mb-3 font-medium text-gray-300 flex justify-center items-center gap-2">
                <CalendarClock size={16} /> Recurring Transactions
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left table-auto border-collapse">
                  <thead className="sticky top-0 bg-neutral-800 z-10">
                    <tr className="border-b border-neutral-700">
                      <th className="py-2">Title</th>
                      <th className="py-2">Amount</th>
                      <th className="py-2">Start</th>
                      <th className="py-2">End</th>
                      <th className="py-2">Months Left</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recurringStats.map((item, i) => (
                      <tr key={i} className="border-b border-neutral-800 hover:bg-neutral-700/30">
                        <td className="py-1 pr-2">{item.title}</td>
                        <td className={`py-1 pr-2 ${item.amount < 0 ? "text-red-400" : "text-green-400"}`}>
                          ₹ {item.amount.toFixed(2)}
                        </td>
                        <td className="py-1 pr-2">{new Date(item.startDate).toLocaleDateString()}</td>
                        <td className="py-1 pr-2">{new Date(item.endDate).toLocaleDateString()}</td>
                        <td className="py-1 pr-2">{item.monthsLeft}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Nav for Mobile */}
        <div className="lg:hidden mt-6">
          <BottomNav />
        </div>
      </div>
    </div>
  )
}
