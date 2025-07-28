// utils/getProjectedBalance.js

export default function getProjectedBalance(scheduleGroupsObj, selectedDate) {
  if (!scheduleGroupsObj || !selectedDate) return 0;

  const endMonth = selectedDate.getMonth();
  const endYear = selectedDate.getFullYear();

  let total = 0;

  // 🔄 Iterate over each group (object structure)
  Object.entries(scheduleGroupsObj).forEach(([groupId, group]) => {
    const items = group.items || {};

    // 🔄 Iterate over each item in the group (also object structure)
    Object.entries(items).forEach(([itemId, item]) => {
      const itemDate = new Date(item.date);
      const itemMonth = itemDate.getMonth();
      const itemYear = itemDate.getFullYear();

      // ✅ Case 1: Non-repeating item that falls before or in selected month
      const isBeforeOrSameMonth =
        itemYear < endYear ||
        (itemYear === endYear && itemMonth <= endMonth);

      if (isBeforeOrSameMonth && !item.repeat) {
        total += item.amount;
      }

      // ✅ Case 2: Recurring item — simulate each occurrence
      if (item.repeat) {
        const repeatEnd = item.repeatEndDate
          ? new Date(item.repeatEndDate)
          : new Date(endYear, endMonth, 1); // If no repeatEndDate, assume active till selected month

        const current = new Date(itemDate);
        current.setDate(1); // Normalize date to 1st of month

        while (
          current.getFullYear() < endYear ||
          (current.getFullYear() === endYear &&
            current.getMonth() <= endMonth)
        ) {
          // Check if current simulated repeat month is before or on repeatEndDate
          if (!item.repeatEndDate || current <= repeatEnd) {
            total += item.amount;
          }
          current.setMonth(current.getMonth() + 1); // move to next month
        }
      }
    });
  });

  return total;
}
