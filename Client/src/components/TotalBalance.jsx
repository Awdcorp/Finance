import React, { useState } from "react";
import useFinance from "../state/finance";
import getProjectedBalance from "../utils/getProjectedBalance";
import { toast } from "react-hot-toast";
import { Pencil, IndianRupee } from "lucide-react";
import AmountInput from "./AmountInput";

export default function TotalBalance({ selectedDate }) {
  const scheduleGroups = useFinance((state) => state.scheduleGroups);
  const addItemToGroup = useFinance((state) => state.addItemToGroup);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actualBalance, setActualBalance] = useState("");
  const [isPositive, setIsPositive] = useState(true);

  // === ✅ Actual balance logic: ALL scheduled items <= today ===
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const allScheduledItems = Object.values(scheduleGroups)
    .filter((group) => !group.isPending)
    .flatMap((group) => Object.values(group.items || {}))
    .filter((item) => {
      const itemDate = new Date(item.date);
      itemDate.setHours(0, 0, 0, 0);
      return itemDate <= today;
    });

  const income = allScheduledItems
    .filter((item) => item.amount > 0)
    .reduce((acc, item) => acc + item.amount, 0);

  const expenses = allScheduledItems
    .filter((item) => item.amount < 0)
    .reduce((acc, item) => acc + item.amount, 0);

  const total = income + expenses;

  // === ✅ Projected balance (this month and earlier, recurring included) ===
  const projectedBalance = getProjectedBalance(scheduleGroups, selectedDate);

  const handleUpdateBalance = () => {
    const parsed = parseFloat(isPositive ? actualBalance : `-${actualBalance}`);
    if (isNaN(parsed)) {
      toast.error("Please enter a valid balance");
      return;
    }

    const diff = parsed - total;
    if (diff === 0) {
      toast("Balance already matches");
      setIsModalOpen(false);
      return;
    }

    const selectedMonth = selectedDate.getMonth();
    const selectedYear = selectedDate.getFullYear();

    const targetGroupId = Object.keys(scheduleGroups).find(
      (id) =>
        scheduleGroups[id].title === "Daily Transactions" &&
        !scheduleGroups[id].isPending
    );

    if (!targetGroupId) {
      toast.error("Couldn't find 'Daily Transactions' group");
      return;
    }

    try {
      addItemToGroup(targetGroupId, {
        title: "Balance Adjustment",
        amount: diff,
        date: selectedDate.toISOString().split("T")[0],
        category: "Miscellaneous",
        notes: "Auto-added from Update Balance",
      });
      toast.success("Balance adjustment added");
      setIsModalOpen(false);
      setActualBalance("");
    } catch (e) {
      toast.error("Failed to update balance");
    }
  };

  return (
    <div className="w-full px-4">
      <div className="bg-neutral-800 rounded-xl p-4 shadow-md text-center space-y-3">
        {/* Label */}
        <div className="text-sm text-gray-400 tracking-wide uppercase">
          Total Balance
        </div>

        {/* Balance Value */}
        <div className="flex items-center justify-center gap-2 text-white">
          <IndianRupee size={30} />
          <span
            className={`text-4xl font-extrabold ${
              total < 0
                ? "text-red-400"
                : total > 0
                ? "text-green-400"
                : "text-white"
            }`}
          >
            {total.toFixed(2)}
          </span>
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-yellow-400 hover:scale-110 transition"
            title="Adjust Balance"
          >
            <Pencil className="w-4 h-4" />
          </button>
        </div>

        {/* Projected Balance */}
        <div
          className={`text-sm font-medium ${
            projectedBalance < 0 ? "text-red-400" : "text-green-300"
          }`}
        >
          Projected balance{" "}
          {selectedDate.toLocaleString("default", {
            month: "short",
          })}
          : <IndianRupee size={14} className="inline-block" />{" "}
          {projectedBalance.toFixed(2)}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
          <div className="bg-neutral-900 text-white px-6 pt-5 pb-4 rounded-xl w-[320px] space-y-4 shadow-xl">
            <h2 className="text-lg font-semibold mb-2">Update Actual Balance</h2>
            <div className="text-sm text-gray-400 mb-1">
              Current Balance: {total.toFixed(2)} €
            </div>
            <AmountInput
              value={actualBalance}
              setValue={setActualBalance}
              isPositive={isPositive}
              setIsPositive={setIsPositive}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-3 py-1 text-sm bg-gray-700 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateBalance}
                className="px-3 py-1 text-sm bg-yellow-500 text-black font-semibold rounded"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
