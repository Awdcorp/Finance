export default function getItemsForMonth(scheduleGroups, selectedDate) {
  const currentMonthItems = [];

  Object.entries(scheduleGroups).forEach(([groupId, group]) => {

    if (group.isPending) return; // ✅ Skip drafts/pending items

    Object.entries(group.items || {}).forEach(([itemId, item]) => {
      const itemDate = new Date(item.date);

      const isSameMonth =
        itemDate.getFullYear() === selectedDate.getFullYear() &&
        itemDate.getMonth() === selectedDate.getMonth();

      if (isSameMonth) {
        currentMonthItems.push({ ...item, groupId, itemId });
      } else if (item.repeat) {
        const isBeforeOrSameMonth =
          itemDate.getFullYear() < selectedDate.getFullYear() ||
          (itemDate.getFullYear() === selectedDate.getFullYear() &&
            itemDate.getMonth() <= selectedDate.getMonth());

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
          // ✅ Adjust day to last valid day in selected month (e.g., Feb for 31st)
          const requestedDay = itemDate.getDate();
          const year = selectedDate.getFullYear();
          const month = selectedDate.getMonth();
          const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
          const safeDay = Math.min(requestedDay, lastDayOfMonth);

          const repeatedDate = new Date(Date.UTC(year, month, safeDay));

          const validRepeat = repeatedDate.getMonth() === selectedDate.getMonth();

          if (validRepeat) {
            currentMonthItems.push({
              ...item,
              date: repeatedDate.toISOString().slice(0, 10),
              groupId,
              itemId,
              originalDate: item.date,
            });
          } 
          }
        
      } 
      
    });
  });

  return currentMonthItems;
}
