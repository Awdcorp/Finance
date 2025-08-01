// ✅ Get all scheduled (non-pending) items up to a given date
// ✅ Expands recurring items (monthly/weekly), skipping same-month repeat

export default function getAllItemsTillDate(scheduleGroups, endDate) {
  const result = [];

  const cutoff = new Date(endDate);
  cutoff.setHours(0, 0, 0, 0);

  Object.entries(scheduleGroups).forEach(([groupId, group]) => {
    if (group.isPending) {
      return;
    }

    Object.entries(group.items || {}).forEach(([itemId, item]) => {
      const itemDate = new Date(item.date);
      itemDate.setHours(0, 0, 0, 0);

      if (itemDate <= cutoff) {
        result.push(item); // original
      }

      // === Normalize repeat type ===
      const repeatType = item.repeat === true ? "monthly" : item.repeat;

      if (!repeatType) return;

      // === Move to first repeat month (skip same-month repeat) ===
      let next = new Date(itemDate);
      if (repeatType === "monthly") {
        next.setMonth(next.getMonth() + 1);
      } else if (repeatType === "weekly") {
        next.setDate(next.getDate() + 7);
      } else {
        return; // Unsupported repeat type
      }

      while (true) {
        if (next > cutoff) {
          break;
        }

        if (item.repeatEndDate && new Date(item.repeatEndDate) < next) {
          break;
        }

        const repeatedItem = {
          ...item,
          originalDate: item.date,
          date: next.toISOString().slice(0, 10),
        };

        result.push(repeatedItem);

        // ➕ Advance to next repeat
        if (repeatType === "monthly") {
          next.setMonth(next.getMonth() + 1);
        } else if (repeatType === "weekly") {
          next.setDate(next.getDate() + 7);
        }
      }
    });
  });

  return result;
}
