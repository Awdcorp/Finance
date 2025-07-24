// utils/getItemsForMonth.js

export default function getItemsForMonth(scheduleGroups, selectedDate) {
  const currentMonthItems = [];

  scheduleGroups.forEach((group, groupIndex) => {
    group.items.forEach((item) => {
      const itemDate = new Date(item.date);

      const isSameMonth =
        itemDate.getFullYear() === selectedDate.getFullYear() &&
        itemDate.getMonth() === selectedDate.getMonth();

      if (isSameMonth) {
        // Real item from selected month
        currentMonthItems.push({ ...item, groupIndex });
      } else if (item.repeat) {
        const isBeforeOrSameMonth =
          itemDate.getFullYear() < selectedDate.getFullYear() ||
          (itemDate.getFullYear() === selectedDate.getFullYear() &&
            itemDate.getMonth() <= selectedDate.getMonth());

        // ✅ Check if this month is within the repeat end date
        let isWithinRepeatEnd = true;
        if (item.repeatEndDate) {
          const endDate = new Date(item.repeatEndDate);
          const isAfterEndMonth =
            selectedDate.getFullYear() > endDate.getFullYear() ||
            (selectedDate.getFullYear() === endDate.getFullYear() &&
              selectedDate.getMonth() > endDate.getMonth());

          if (isAfterEndMonth) {
            isWithinRepeatEnd = false;
          }
        }

        if (isBeforeOrSameMonth && isWithinRepeatEnd) {
          const repeatedDate = new Date(
            selectedDate.getFullYear(),
            selectedDate.getMonth(),
            itemDate.getDate()
          );

          // Skip invalid dates like Feb 30
          if (repeatedDate.getMonth() === selectedDate.getMonth()) {
            currentMonthItems.push({
              ...item,
              date: repeatedDate.toISOString().slice(0, 10),
              groupIndex,
              originalDate: item.date,
            });
          }
        }
      }
    });
  });

  return currentMonthItems;
}
