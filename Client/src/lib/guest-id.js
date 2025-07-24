export function getGuestId() {
    let guestId = localStorage.getItem("guest_id");
    if (!guestId) {
      guestId = crypto.randomUUID(); // Or use a library like uuid if needed
      localStorage.setItem("guest_id", guestId);
    }
    return guestId;
  }
  