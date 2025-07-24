// File: src/components/ui/multiselect.jsx

import { useEffect, useState } from "react";
import { X } from "lucide-react";

export function MultiSelect({ label = "", options = [], selected = [], onChange }) {
  const [internalSelected, setInternalSelected] = useState([]);

  useEffect(() => {
    setInternalSelected(selected);
  }, [selected]);

  const toggleOption = (val) => {
    let updated;
    if (internalSelected.includes(val)) {
      updated = internalSelected.filter((id) => id !== val);
    } else {
      updated = [...internalSelected, val];
    }
    setInternalSelected(updated);
    onChange(updated);
  };

  const removeOption = (val) => {
    const updated = internalSelected.filter((id) => id !== val);
    setInternalSelected(updated);
    onChange(updated);
  };

  const getLabel = (val) => options.find((o) => o.value === val)?.label || val;

  return (
    <div className="space-y-1">
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      <div className="border rounded p-2">
        <div className="flex flex-wrap gap-2 mb-2">
          {internalSelected.map((val) => (
            <span
              key={val}
              className="bg-muted text-xs flex items-center gap-1 px-2 py-1 rounded border"
            >
              {getLabel(val)}
              <button
                type="button"
                onClick={() => removeOption(val)}
                className="hover:text-red-500"
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 max-h-40 overflow-y-auto">
          {options.map((opt) => (
            <label key={opt.value} className="text-sm flex items-center gap-2">
              <input
                type="checkbox"
                className="form-checkbox"
                checked={internalSelected.includes(opt.value)}
                onChange={() => toggleOption(opt.value)}
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
