import React from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function AmountInput({ value, setValue, isPositive, setIsPositive, label }) {
  return (
    <div className="w-full">
      <label className="block mb-0.5 text-sm text-white">{label}</label>

      <div className="flex items-center gap-2">
        <input
          type="text"                         // ✅ Use "text" instead of "number" to control formatting
          inputMode="decimal"                 // ✅ Show numeric keypad on mobile
          pattern="[0-9]*"                    // ✅ Enforce digits only if needed
          value={value}
          onChange={(e) => {
            const raw = e.target.value;
            const clean = raw.replace(/-/g, ""); // ✅ Remove non-numeric except dot
            setValue(clean);
          }}
          placeholder="e.g. 1200"
          className={`w-[75%] px-3 py-1.5 text-sm rounded-md text-white bg-zinc-800 border focus:outline-none transition-all
            ${isPositive ? "border-green-500" : "border-red-500"}`}
        />

        <button
          type="button"
          onClick={() => setIsPositive(!isPositive)}
          className={`w-[25%] h-[34px] flex items-center justify-center rounded-md transition-colors font-semibold
            ${isPositive ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}
          title={isPositive ? "Income" : "Expense"}
        >
          {isPositive ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
        </button>
      </div>
    </div>
  );
}
