import React, { useEffect, useState, useMemo } from "react";
import TotalBalance from "../components/TotalBalance";
import BalanceCard from "../components/BalanceCard";
import CalendarGrid from "../components/CalendarGrid";
import ScheduleList from "../components/ScheduleList";
import BottomNav from "../components/BottomNav";
import useFinance from "../state/finance";
import getItemsForMonth from "../utils/getItemsForMonth";
import getProjectedBalance from "../utils/getProjectedBalance";
import PendingTransactionList from "../components/PendingTransactionList";
import TextInputModal from "../components/TextInputModal"
import PendingSummaryCard from "../components/PendingSummaryCard";
import DashboardSelector from "../components/DashboardSelector";
import SidebarNav from "../components/SidebarNav";
import toast from "react-hot-toast";

export default function Dashboard({ user }) {
  const scheduleGroups = useFinance((state) => state.scheduleGroups);
  const currentDashboard = useFinance((state) => state.currentDashboard);
  const syncDashboard = useFinance((state) => state.syncDashboard);
  const loadUserData = useFinance((state) => state.loadUserData);

  const [isAddGroupOpen, setIsAddGroupOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAddPendingGroup, setShowAddPendingGroup] = useState(false);

  // Load Firestore data once
  useEffect(() => {
    if (user?.uid) {
      loadUserData(user.uid);
    }
  }, [user]);

  // When dashboard changes, reset month and data
  useEffect(() => {
    syncDashboard();
    setSelectedDate(new Date());
  }, [currentDashboard]);

  const handleMonthChange = (offset) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(selectedDate.getMonth() + offset);
    setSelectedDate(newDate);
  };

  const currentMonthItems = getItemsForMonth(scheduleGroups, selectedDate);

  const { income, expenses, totalBalance } = useMemo(() => {
    const income = currentMonthItems
      .filter((item) => item.amount > 0)
      .reduce((sum, item) => sum + item.amount, 0);
    const expenses = currentMonthItems
      .filter((item) => item.amount < 0)
      .reduce((sum, item) => sum + item.amount, 0);
    return {
      income,
      expenses,
      totalBalance: income + expenses,
    };
  }, [currentMonthItems]);

  const projectedBalance = getProjectedBalance(scheduleGroups, selectedDate);

  return (
    <div className="min-h-screen bg-neutral-900 text-white flex flex-col lg:flex-row">
      {/* Sidebar for Desktop */}
      <SidebarNav />

      {/* Main Area */}
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
              <BalanceCard label="Income" amount={income} type="income" />
              <BalanceCard label="Expenses" amount={Math.abs(expenses)} type="expense" />
            </div>
            <CalendarGrid calendarData={[]} currentDate={selectedDate.getDate()} />
          </div>

          {/* RIGHT */}
          <div>
            <ScheduleList
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

            <div className="px-4"><PendingSummaryCard /></div>
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
        <TextInputModal
          isOpen={isAddGroupOpen}
          title="Add New Block"
          confirmLabel="Add"
          initialValue=""
          onConfirm={(title) => {
            useFinance.getState().addScheduleGroup({ title, items: [] })
            toast.success("Schedule group added")
          }}
          onClose={() => setIsAddGroupOpen(false)}
        />

        <TextInputModal
          isOpen={showAddPendingGroup}
          title="Add Draft Group"
          confirmLabel="Add"
          initialValue=""
          onConfirm={(title) => {
            useFinance.getState().addPendingGroup({ title, items: [] })
            toast.success("Pending draft added")
          }}
          onClose={() => setShowAddPendingGroup(false)}
        />

        {/* Bottom Nav for Mobile */}
        <div className="lg:hidden">
          <BottomNav />
        </div>
      </div>
    </div>
  );
}
