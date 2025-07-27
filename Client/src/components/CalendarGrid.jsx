// CalendarGrid.jsx
import React, { useMemo, useState, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import SvgFlipClock from "../components/SvgFlipClock";
const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const dates = Array.from({ length: 31 }, (_, i) => i + 1);

export default function CalendarGrid({ items = [], selectedDate }) {
  const [isOpen, setIsOpen] = useState(true);
  const [clock, setClock] = useState("");

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setClock(now.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }));
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Group income/expense amounts by day
  const totalsByDate = useMemo(() => {
    const map = {};
    items.forEach((item) => {
      const date = new Date(item.date);
      const day = date.getDate();
      if (!map[day]) map[day] = { income: 0, expense: 0 };

      if (item.amount > 0) map[day].income += item.amount;
      else map[day].expense += Math.abs(item.amount);
    });
    return map;
  }, [items]);

  return (
    <div className="p-4 bg-neutral-900 rounded-lg shadow">
      {/* Header */}
      <div className="flex justify-between items-center mb-2 px-1">
      <SvgFlipClock />
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-gray-400 hover:text-white transition-transform"
          aria-label="Toggle calendar"
        >
          <div
            className={`transition-transform duration-300 ${
              isOpen ? "rotate-180" : "rotate-0"
            }`}
          >
            <ChevronUp size={20} />
          </div>
        </button>
      </div>

      {isOpen && (
        <>
          {/* Weekday headings */}
          <div className="grid grid-cols-7 gap-2 text-sm text-gray-400 mb-2">
            {days.map((d) => (
              <div key={d} className="text-center">{d}</div>
            ))}
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7 gap-2">
            {dates.map((day) => {
              const totals = totalsByDate[day] || { income: 0, expense: 0 };
              const hasIncome = totals.income > 0;
              const hasExpense = totals.expense > 0;

              return (
                <div
                  key={day}
                  className="aspect-square bg-neutral-800 rounded-md p-[2px] text-xs text-white flex flex-col items-center justify-start overflow-hidden"
                >
                  <div className="font-semibold text-sm mb-[1px]">{day}</div>

                  {/* Income */}
                  {hasIncome && (
                    <div className="text-[11px] text-green-400 font-semibold leading-none">
                      {totals.income >= 1000
                        ? `${(totals.income / 1000).toFixed(1)}K`
                        : totals.income.toLocaleString()}
                    </div>
                  )}

                  {/* Expense */}
                  {hasExpense && (
                    <div className="text-[11px] text-red-400 font-semibold leading-none">
                      {totals.expense >= 1000
                        ? `${(totals.expense / 1000).toFixed(1)}K`
                        : totals.expense.toLocaleString()}
                    </div>
                  )}

                  {/* Placeholder if no data */}
                  {!hasIncome && !hasExpense && (
                    <div className="text-gray-500 text-[11px]">0</div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
