// components/SvgFlipClock.jsx
import React, { useEffect, useState } from "react";

export default function SvgFlipClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const tick = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(tick);
  }, []);

  const format = (n) => n.toString().padStart(2, "0");
  const hours = format(time.getHours());
  const minutes = format(time.getMinutes());
  const seconds = format(time.getSeconds());

  const display = `${hours}:${minutes}:${seconds}`;

  return (
    <div className="flex gap-[2px] items-center scale-[0.9] font-mono">
      {display.split("").map((char, index) => (
        <svg
          key={index}
          width="32"
          height="48"
          viewBox="0 0 32 48"
          className="text-white"
        >
          <rect
            width="100%"
            height="100%"
            rx="6"
            fill="#111"
            stroke="#333"
            strokeWidth="1"
            className="drop-shadow-sm"
          />
          <text
            x="50%"
            y="55%"
            dominantBaseline="middle"
            textAnchor="middle"
            fontSize="26"
            fill={/\d/.test(char) ? "#ffffff" : "#888888"}
            fontFamily="monospace"
          >
            {char}
          </text>
        </svg>
      ))}
    </div>
  );
}
