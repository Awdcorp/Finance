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

        if (isBeforeOrSameMonth) {
          // Create a repeated item on the same day in selected month
          const repeatedDate = new Date(
            selectedDate.getFullYear(),
            selectedDate.getMonth(),
            itemDate.getDate()
          );

          // Skip invalid dates like Feb 30 or Apr 31
          if (repeatedDate.getMonth() === selectedDate.getMonth()) {
            currentMonthItems.push({
              ...item,
              date: repeatedDate.toISOString().slice(0, 10),
              groupIndex,
            });
          }
        }
      }
    });
  });

  return currentMonthItems;
}