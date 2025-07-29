import React, { useState } from "react";
import { CalendarDays } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function DateSelector({
  label = "Select Date",
  date,
  setDate,
  fallbackMonthDate = null,
}) {
  const [showCalendar, setShowCalendar] = useState(false);

  const displayDate = date
    ? new Date(date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    : "Select Date";

  const selectedDate = date
    ? new Date(date)
    : fallbackMonthDate
    ? new Date(fallbackMonthDate)
    : null;

  return (
    <div className="w-full">
      <label className="block mb-0.5 text-sm">{label}</label>

      {/* Button to open calendar */}
      <button
        type="button"
        className="w-full px-3 py-2 bg-zinc-800 border border-zinc-600 rounded-md text-left flex items-center gap-2"
        onClick={() => setShowCalendar(true)}
      >
        <CalendarDays size={16} />
        {displayDate}
      </button>

      {/* Calendar Popup */}
{showCalendar && (
  <div className="fixed inset-0 z-50">
    {/* Backdrop */}
    <div
      className="fixed inset-0 bg-black/40"
      onClick={() => setShowCalendar(false)}
    />

    {/* Centered calendar */}
    <div className="flex items-center justify-center h-full pointer-events-none">
      <div
        className="bg-neutral-900 p-2 rounded-lg border border-zinc-700 shadow-lg pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <DatePicker
          selected={selectedDate}
          onChange={(d) => {
            setDate(d.toISOString().split("T")[0]);
            setShowCalendar(false);
          }}
          inline
          calendarStartDay={1}
        />
      </div>
    </div>
  </div>
)}

    </div>
  );
}
