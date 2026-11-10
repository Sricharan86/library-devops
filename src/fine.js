const FINE_PER_DAY = 2;

function calculateFine(dueDate, returnDate = new Date()) {
  // Compare calendar dates in UTC to avoid daylight-saving/time-of-day errors.
  const due = new Date(`${String(dueDate).slice(0, 10)}T00:00:00.000Z`);
  const returned = new Date(`${String(returnDate).slice(0, 10)}T00:00:00.000Z`);

  if (Number.isNaN(due.getTime()) || Number.isNaN(returned.getTime())) {
    throw new Error('Invalid due date or return date');
  }

  const daysLate = Math.floor((returned - due) / 86400000);
  return Math.max(0, daysLate) * FINE_PER_DAY;
}

module.exports = { calculateFine, FINE_PER_DAY };
