export default function getItemsForMonth(scheduleGroups, selectedDate) {
  const currentMonthItems = [];

  console.log("🟡 RUNNING getItemsForMonth for:", selectedDate.toISOString().slice(0, 10));

  Object.entries(scheduleGroups).forEach(([groupId, group]) => {
    console.log("📁 GROUP CHECK:", { groupId, title: group.title, isPending: group.isPending });

    if (group.isPending) return; // ✅ Skip drafts/pending items

    Object.entries(group.items || {}).forEach(([itemId, item]) => {
      const itemDate = new Date(item.date);

      console.log("📄 ITEM START:", {
        title: item.title,
        itemId,
        baseDate: item.date,
        repeat: item.repeat || false,
      });

      const isSameMonth =
        itemDate.getFullYear() === selectedDate.getFullYear() &&
        itemDate.getMonth() === selectedDate.getMonth();

      if (isSameMonth) {
        console.log("✅ SAME MONTH:", {
          title: item.title,
          baseDate: item.date,
          selectedDate: selectedDate.toISOString().slice(0, 10),
        });
        currentMonthItems.push({ ...item, groupId, itemId });
      } else if (item.repeat) {
        const isBeforeOrSameMonth =
          itemDate.getFullYear() < selectedDate.getFullYear() ||
          (itemDate.getFullYear() === selectedDate.getFullYear() &&
            itemDate.getMonth() <= selectedDate.getMonth());

        console.log("⏳ REPEAT BASE CHECK:", {
          title: item.title,
          originalDate: item.date,
          selectedMonth: selectedDate.toISOString().slice(0, 10),
          isBeforeOrSameMonth,
        });

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

          console.log("⏹️ REPEAT END CHECK:", {
            repeatEndDate: item.repeatEndDate,
            selectedDate: selectedDate.toISOString().slice(0, 10),
            isAfterEndMonth,
            isWithinRepeatEnd,
          });
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

          console.log("🔁 REPEAT CHECK:", {
            title: item.title,
            originalDate: item.date,
            selectedMonth: selectedDate.toISOString().slice(0, 10),
            generatedRepeat: repeatedDate.toISOString().slice(0, 10),
            repeatEndDate: item.repeatEndDate || "∞",
            validRepeat,
          });

          if (validRepeat) {
            currentMonthItems.push({
              ...item,
              date: repeatedDate.toISOString().slice(0, 10),
              groupId,
              itemId,
              originalDate: item.date,
            });
          } else {
            console.warn("⛔ Skipped invalid repeat (e.g., overflowed month):", {
              title: item.title,
              generatedRepeat: repeatedDate.toISOString().slice(0, 10),
            });
          }
        }
      } else {
        console.log("🟤 NON-REPEATED ITEM IGNORED (not in same month):", {
          title: item.title,
          baseDate: item.date,
        });
      }
    });
  });

  console.log("✅ FINAL ITEMS FOR MONTH:", currentMonthItems);
  return currentMonthItems;
}
