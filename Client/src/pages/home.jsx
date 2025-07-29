import React, { useEffect, useState, useMemo } from "react";
import TotalBalance from "../components/TotalBalance";
import BalanceCard from "../components/BalanceCard";
import CalendarGrid from "../components/CalendarGrid";
import ScheduleList from "../components/ScheduleList";
import BottomNav from "../components/BottomNav";
import useFinance from "../state/finance";
import getItemsForMonth from "../utils/getItemsForMonth";
import PendingTransactionList from "../components/PendingTransactionList";
import TextInputModal from "../components/TextInputModal";
import PendingSummaryCard from "../components/PendingSummaryCard";
import DashboardSelector from "../components/DashboardSelector";
import SidebarNav from "../components/SidebarNav";
import toast from "react-hot-toast";
import SyncStatusBadge from "../components/SyncStatusBadge";

export default function Dashboard({ user }) {
  const scheduleGroups = useFinance((state) => state.scheduleGroups);
  const currentDashboard = useFinance((state) => state.currentDashboard);
  const syncDashboard = useFinance((state) => state.syncDashboard);
  const loadUserData = useFinance((state) => state.loadUserData);
  const addScheduleGroup = useFinance((state) => state.addScheduleGroup);

  const [isAddGroupOpen, setIsAddGroupOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Load data for current user
  useEffect(() => {
    if (user?.uid) {
      loadUserData(user.uid);
    }
  }, [user]);

  // Sync data and reset calendar when dashboard changes
  useEffect(() => {
    syncDashboard();
    setSelectedDate(new Date());
  }, [currentDashboard]);

  // Change calendar month
  const handleMonthChange = (offset) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(selectedDate.getMonth() + offset);
    setSelectedDate(newDate);
  };

  // Get monthly visible items (excluding drafts)
  const currentMonthItems = useMemo(
    () => getItemsForMonth(scheduleGroups, selectedDate),
    [scheduleGroups, selectedDate]
  );

  // Aggregate income, expenses, and balance
  const { income, expenses, totalBalance } = useMemo(() => {
    const income = currentMonthItems.filter((item) => item.amount > 0).reduce((sum, item) => sum + item.amount, 0);
    const expenses = currentMonthItems.filter((item) => item.amount < 0).reduce((sum, item) => sum + item.amount, 0);
    return {
      income,
      expenses,
      totalBalance: income + expenses,
    };
  }, [currentMonthItems]);

  return (
    <div className="min-h-screen bg-neutral-900 text-white flex flex-col lg:flex-row">
      {/* Sidebar (Desktop) */}
      <SidebarNav />

      {/* Main */}
      <div className="flex-1 lg:ml-64 px-4 pt-6 pb-[120px] flex flex-col gap-6">
        {/* Header */}
        <div className="relative">
          <div className="flex justify-center">
            <DashboardSelector />
          </div>
          <div className="absolute top-0 right-0 pr-2">
            <SyncStatusBadge />
          </div>
        </div>

        {/* Month navigation */}
        <div className="flex justify-between items-center text-white px-2">
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
            <div className="flex justify-center lg:justify-start gap-4 mt-4 px-4">
              <BalanceCard label="Income" amount={income} type="income" />
              <BalanceCard label="Expenses" amount={Math.abs(expenses)} type="expense" />
            </div>
            <CalendarGrid items={currentMonthItems} selectedDate={selectedDate} />
          </div>

          {/* RIGHT */}
          <div>
            <ScheduleList selectedDate={selectedDate} />

            <button
              onClick={() => setIsAddGroupOpen(true)}
              className="text-blue-400 hover:text-yellow-300 text-sm pb-6"
            >
              + Add New Group
            </button>

            <div className="px-4"><PendingSummaryCard /></div>
            <PendingTransactionList selectedDate={selectedDate} />
          </div>
        </div>

        {/* Add Group Modal */}
        <TextInputModal
          isOpen={isAddGroupOpen}
          title="Add New Block"
          confirmLabel="Add"
          initialValue=""
          onConfirm={(title) => {
            addScheduleGroup(title);
            toast.success("Schedule group added");
            setIsAddGroupOpen(false);
          }}
          onClose={() => setIsAddGroupOpen(false)}
        />

        {/* Bottom Nav (Mobile) */}
        <div className="lg:hidden">
          <BottomNav />
        </div>
      </div>
    </div>
  );
}
