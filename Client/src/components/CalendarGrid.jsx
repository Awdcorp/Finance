// CalendarGrid.jsx
import React from "react";

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const dates = Array.from({ length: 31 }, (_, i) => i + 1);

export default function CalendarGrid({ incomeDates = [], expenseDates = [] }) {
  return (
    <div className="p-4">
      <div className="grid grid-cols-7 gap-2 text-sm text-gray-400 mb-2">
        {days.map((d) => (
          <div key={d} className="text-center">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {dates.map((date) => {
          const isIncome = incomeDates.includes(date);
          const isExpense = expenseDates.includes(date);

          return (
            <div
              key={date}
              className={`aspect-square flex items-center justify-center rounded-md text-white text-sm font-medium
                ${isIncome ? "bg-green-600" : ""}
                ${isExpense ? "bg-red-600" : ""}
                ${!isIncome && !isExpense ? "bg-neutral-800" : ""}`}
            >
              {date}
            </div>
          );
        })}
      </div>
    </div>
  );
}
