export default function getProjectedBalance(scheduleGroups, selectedDate) {
  if (!scheduleGroups || !selectedDate) return 0;

  const endMonth = selectedDate.getMonth();
  const endYear = selectedDate.getFullYear();

  let total = 0;

  scheduleGroups.forEach((group) => {
    group.items.forEach((item) => {
      const itemDate = new Date(item.date);
      const itemMonth = itemDate.getMonth();
      const itemYear = itemDate.getFullYear();

      // ✅ Case 1: Normal item before or within selected month
      const isBeforeOrSameMonth =
        itemYear < endYear ||
        (itemYear === endYear && itemMonth <= endMonth);

      if (isBeforeOrSameMonth && !item.repeat) {
        total += item.amount;
      }

      // ✅ Case 2: Recurring item — simulate each monthly occurrence
      if (item.repeat) {
        const repeatEnd = item.repeatEndDate
          ? new Date(item.repeatEndDate)
          : new Date(endYear, endMonth, 1); // default: repeat until selected month

        const current = new Date(itemDate); // start from original
        current.setDate(1); // normalize day

        // generate months until repeat end or selectedDate
        while (
          current.getFullYear() < endYear ||
          (current.getFullYear() === endYear &&
            current.getMonth() <= endMonth)
        ) {
          if (
            !item.repeatEndDate ||
            current <= repeatEnd
          ) {
            total += item.amount;
          }
          // move to next month
          current.setMonth(current.getMonth() + 1);
        }
      }
    });
  });

  return total;
}
