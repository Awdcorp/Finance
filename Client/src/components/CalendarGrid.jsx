import React, { useMemo, useState, useEffect } from "react";
import { ChevronUp } from "lucide-react";

const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function CalendarGrid({ items = [], selectedDate }) {
  const [isOpen, setIsOpen] = useState(true);
  const [clock, setClock] = useState("");

  const today = new Date();
  const todayDate = today.getDate();
  const todayMonth = today.getMonth();
  const todayYear = today.getFullYear();

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setClock(
        now.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Group income/expense by day
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

  // Build smart calendar layout with overflow days
  const calendarDays = useMemo(() => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();

    const firstDay = new Date(year, month, 1);
    let startWeekday = (firstDay.getDay() + 6) % 7; // shift to Monday-start (0 = Mon)

    const daysInCurrent = new Date(year, month + 1, 0).getDate();
    const daysInPrev = new Date(year, month, 0).getDate();

    const grid = [];

    // Previous month trailing days
    for (let i = startWeekday - 1; i >= 0; i--) {
      grid.push({
        day: daysInPrev - i,
        monthOffset: -1,
      });
    }

    // Current month days
    for (let i = 1; i <= daysInCurrent; i++) {
      grid.push({
        day: i,
        monthOffset: 0,
      });
    }

    // Fill remaining cells with next month
    const totalCells = 42; // 6 rows × 7 columns
    const remaining = totalCells - grid.length;
    for (let i = 1; i <= remaining; i++) {
      grid.push({
        day: i,
        monthOffset: 1,
      });
    }

    return grid;
  }, [selectedDate]);

  return (
    <div className="p-4 bg-neutral-900 rounded-lg shadow">
      {/* Header */}
      <div className="flex justify-between items-center mb-2 px-1">
        <div className="flex items-center gap-4">
          <h2 className="text-white text-lg font-semibold">Monthly Overview</h2>
          <span className="text-gray-400 text-sm font-mono">{clock}</span>
        </div>
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
            {weekdays.map((d) => (
              <div key={d} className="text-center">
                {d}
              </div>
            ))}
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map(({ day, monthOffset }, index) => {
              const dateObj = new Date(
                selectedDate.getFullYear(),
                selectedDate.getMonth() + monthOffset,
                day
              );

              const isCurrentMonth = monthOffset === 0;
              const isToday =
                day === todayDate &&
                dateObj.getMonth() === todayMonth &&
                dateObj.getFullYear() === todayYear;

              const isWeekend =
                dateObj.getDay() === 0 || dateObj.getDay() === 6;

              const totals = isCurrentMonth ? totalsByDate[day] || { income: 0, expense: 0 } : { income: 0, expense: 0 };
              const hasIncome = totals.income > 0;
              const hasExpense = totals.expense > 0;

              const baseClass =
                "aspect-square rounded-md p-[2px] text-xs flex flex-col items-center justify-start overflow-hidden";

              const highlightClass = isToday
                ? "bg-neutral-700 text-white font-bold ring-2 ring-yellow-500"
                : isWeekend
                ? isCurrentMonth
                  ? "bg-neutral-700 text-blue-300"
                  : "bg-neutral-800 text-gray-500"
                : isCurrentMonth
                ? "bg-neutral-800 text-white"
                : "bg-neutral-800 text-gray-500";

              return (
                <div key={index} className={`${baseClass} ${highlightClass}`}>
                  <div className="font-semibold text-sm mb-[1px]">{day}</div>

                {(hasIncome || hasExpense) ? (
                  <>
                    {hasIncome && (
                      <div className={`${hasIncome && hasExpense ? "text-[7px]" : "text-[12px]"} text-green-400 font-semibold leading-none`}>
                        {totals.income >= 1000
                          ? `${(totals.income / 1000).toFixed(1)}K`
                          : totals.income.toLocaleString()}
                      </div>
                    )}

                    {hasExpense && (
                      <div className={`${hasIncome && hasExpense ? "text-[7px]" : "text-[12px]"} text-red-400 font-semibold leading-none`}>
                        {totals.expense >= 1000
                          ? `${(totals.expense / 1000).toFixed(1)}K`
                          : totals.expense.toLocaleString()}
                      </div>
                    )}
                  </>
                ) : (
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
