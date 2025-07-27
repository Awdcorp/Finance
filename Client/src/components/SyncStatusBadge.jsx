import React, { useEffect, useState } from "react";
import useFinance from "../state/finance";

export default function SyncStatusBadge() {
  const syncStatus = useFinance((state) => state.syncStatus);
  const [visible, setVisible] = useState(true);

  const statusMap = {
    syncing: { text: "⏳ Syncing...", color: "text-yellow-400" },
    synced: { text: "✔ Synced", color: "text-green-400" },
    error: { text: "❌ Sync Failed", color: "text-red-400" },
    offline: { text: "⚠ Offline", color: "text-orange-400" },
    idle: { text: "", color: "text-gray-400" },
  };

  const { text, color } = statusMap[syncStatus] || statusMap["idle"];

  useEffect(() => {
    if (syncStatus === "synced") {
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 4000);
      return () => clearTimeout(timer);
    } else {
      setVisible(true); // show other statuses always
    }
  }, [syncStatus]);

  if (!visible || !text) return null;

  return <p className={`text-xs font-medium ${color}`}>{text}</p>;
}
