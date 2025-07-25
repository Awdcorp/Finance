import React, { useState } from "react"
import BottomNav from "../components/BottomNav"
import SidebarNav from "../components/SidebarNav"
import useFinance from "../state/finance"
import {
  PieChart, Pie, Cell, Tooltip,
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer
} from "recharts"

const COLORS = ["#10b981", "#ef4444", "#facc15", "#3b82f6", "#a855f7"]

export default function Stats() {
  const scheduleGroups = useFinance((state) => state.scheduleGroups)
  const [selectedMonth, setSelectedMonth] = useState(new Date())

  const filteredItems = scheduleGroups.flatMap((group, groupIndex) =>
    group.items
      .filter((item) => {
        const date = new Date(item.date)
        return (
          date.getMonth() === selectedMonth.getMonth() &&
          date.getFullYear() === selectedMonth.getFullYear()
        )
      })
      .map((item) => ({ ...item, groupIndex }))
  )

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

        <h2 className="text-2xl font-semibold mb-6 text-center lg:text-left">📊 Statistics</h2>

        {/* Month Selector */}
        <div className="flex justify-between items-center mb-8 max-w-xs mx-auto lg:mx-0">
          <button onClick={() => handleMonthChange(-1)} className="text-xl">←</button>
          <span className="text-lg font-medium">
            {selectedMonth.toLocaleString("default", { month: "long", year: "numeric" })}
          </span>
          <button onClick={() => handleMonthChange(1)} className="text-xl">→</button>
        </div>

        {/* Grid for charts + cards */}
        <div className="grid lg:grid-cols-2 gap-6">

          {/* Summary Cards (responsive) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="bg-red-500/20 text-red-400 p-4 rounded-lg text-center">
              <div className="text-sm font-medium">Expenses</div>
              <div className="text-2xl font-bold">{Math.abs(expenseTotal).toFixed(2)} €</div>
            </div>
            <div className="bg-green-500/20 text-green-400 p-4 rounded-lg text-center">
              <div className="text-sm font-medium">Income</div>
              <div className="text-2xl font-bold">{incomeTotal.toFixed(2)} €</div>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="bg-neutral-800 rounded-xl p-4">
            <div className="text-center text-sm mb-2">💰 Income vs Expenses</div>
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

          {/* Category Pie Chart */}
          <div className="bg-neutral-800 rounded-xl p-4">
            <div className="text-center text-sm mb-2">📂 Category Breakdown</div>
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

          {/* Group Breakdown */}
          <div className="bg-neutral-800 rounded-xl p-4">
            <div className="text-center text-sm mb-2">📁 Group Summary</div>
            <ul className="text-sm">
              {Object.entries(groupSummary).map(([group, value], i) => (
                <li key={i} className="flex justify-between border-b border-neutral-700 py-1">
                  <span>{group}</span>
                  <span className={value < 0 ? "text-red-400" : "text-green-400"}>
                    {value.toFixed(2)} €
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Repeat vs One-Time Pie Chart */}
          <div className="bg-neutral-800 rounded-xl p-4">
            <div className="text-center text-sm mb-2">🔁 Repeat vs One-Time</div>
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
        </div>

        {/* Bottom Nav for Mobile */}
        <div className="lg:hidden mt-6">
          <BottomNav />
        </div>
      </div>
    </div>
  )
}
