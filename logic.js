/**
 * logic.js
 * ──────────────────────────────────────────────────────────────────
 * This file contains all the period prediction calculations.
 *
 * How period prediction works (the simple model):
 *   1. The user tells us when their last period started, how long
 *      their cycle is (days between period starts), and how long
 *      their period lasts (bleeding days).
 *   2. We calculate when the next period starts:
 *        nextStart = lastPeriodStart + cycleLength (days)
 *   3. We repeat that to predict multiple future periods.
 *   4. For each predicted period, days 1 through periodDuration
 *      are all "period days" and get highlighted on the calendar.
 *
 * We use JavaScript's Date object throughout.
 * A key trick: new Date(dateString) parses "2025-06-01" into a Date.
 * Date.getTime() gives milliseconds since Jan 1, 1970 — useful for math.
 * ──────────────────────────────────────────────────────────────────
 */

/**
 * MS_PER_DAY
 * ──────────
 * The number of milliseconds in one day.
 * Used to convert between days and milliseconds when doing date math.
 */
const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * addDays(date, days)
 * ───────────────────
 * Returns a new Date that is `days` days after the given date.
 *
 * @param {Date}   date - Starting date
 * @param {number} days - Number of days to add (can be negative)
 * @returns {Date}
 *
 * Example: addDays(new Date("2025-06-01"), 28) → Date for "2025-06-29"
 */
export function addDays(date, days) {
  // We multiply days by MS_PER_DAY to get milliseconds,
  // then add that to the date's timestamp (getTime()).
  return new Date(date.getTime() + days * MS_PER_DAY);
}

/**
 * toISODateString(date)
 * ─────────────────────
 * Converts a Date object to a simple "YYYY-MM-DD" string.
 * We need this format because it's universal and easy to compare.
 *
 * @param {Date} date
 * @returns {string} e.g. "2025-07-15"
 */
export function toISODateString(date) {
  // toISOString() gives "2025-07-15T00:00:00.000Z", so we slice the first 10 chars.
  // NOTE: We build the string manually to avoid timezone offset issues.
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0'); // months are 0-indexed
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * parseLocalDate(dateString)
 * ──────────────────────────
 * Safely parses a "YYYY-MM-DD" string into a local Date (midnight).
 *
 * Why not just use new Date("2025-06-01")?
 *   Because browsers may interpret that as UTC midnight, which can
 *   shift the displayed date by one day for users west of UTC.
 *   By splitting and using the numeric constructor, we get local midnight.
 *
 * @param {string} dateString - e.g. "2025-06-01"
 * @returns {Date}
 */
export function parseLocalDate(dateString) {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day); // month is 0-indexed in JS Date
}

/**
 * getNextPeriodStart(lastPeriodStart, cycleLength)
 * ─────────────────────────────────────────────────
 * Calculates the date of the NEXT expected period start.
 *
 * The logic:
 *   nextStart = lastStart + cycleLength days
 *   But if that date is already in the past, we keep adding
 *   cycleLength until we land on a future date.
 *
 * @param {string} lastPeriodStart - "YYYY-MM-DD"
 * @param {number} cycleLength     - e.g. 28
 * @returns {Date} The next upcoming period start date
 */
export function getNextPeriodStart(lastPeriodStart, cycleLength) {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // zero out time for accurate day comparison

  let nextStart = parseLocalDate(lastPeriodStart);

  // Keep moving forward by one cycle until we find a future date
  while (nextStart <= today) {
    nextStart = addDays(nextStart, cycleLength);
  }

  return nextStart;
}

/**
 * getDaysUntilNextPeriod(nextPeriodStart)
 * ────────────────────────────────────────
 * Returns how many days remain until the next period starts.
 *
 * @param {Date} nextPeriodStart
 * @returns {number} Days remaining (0 or more)
 */
export function getDaysUntilNextPeriod(nextPeriodStart) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diff = nextPeriodStart.getTime() - today.getTime();

  // Math.ceil ensures that even a partial day counts as 1 day
  return Math.max(0, Math.ceil(diff / MS_PER_DAY));
}

/**
 * getPredictedPeriodDays(lastPeriodStart, cycleLength, periodDuration, daysAhead)
 * ─────────────────────────────────────────────────────────────────────────────────
 * Generates a Set of date strings for all predicted period days
 * within the next `daysAhead` days from today.
 *
 * How it works:
 *   1. Start from the very first period start (including the last known one).
 *   2. For each period start, mark `periodDuration` consecutive days as period days.
 *   3. Move to the next cycle (add cycleLength days) and repeat.
 *   4. Stop once we've passed daysAhead days into the future.
 *
 * A Set<string> is used so that checking "is this date a period day?"
 * is O(1) — just: periodDays.has("2025-07-15")
 *
 * @param {string} lastPeriodStart - "YYYY-MM-DD"
 * @param {number} cycleLength     - days between period starts
 * @param {number} periodDuration  - how many days the period lasts
 * @param {number} daysAhead       - how far into the future to predict (default 120)
 * @returns {Set<string>} Set of "YYYY-MM-DD" strings
 */
export function getPredictedPeriodDays(
  lastPeriodStart,
  cycleLength,
  periodDuration,
  daysAhead = 120
) {
  const periodDays = new Set();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // The cutoff date: we won't generate predictions past this
  const cutoff = addDays(today, daysAhead);

  // Start calculating from the last known period start
  let cycleStart = parseLocalDate(lastPeriodStart);

  // Safety limit: prevent infinite loop if inputs are weird
  let iterations = 0;
  const MAX_ITERATIONS = 60; // 60 cycles × any cycle length is plenty

  while (cycleStart <= cutoff && iterations < MAX_ITERATIONS) {
    iterations++;

    // For each day of the period, add it to our set
    for (let d = 0; d < periodDuration; d++) {
      const periodDay = addDays(cycleStart, d);

      // Only include dates up to our cutoff
      if (periodDay <= cutoff) {
        periodDays.add(toISODateString(periodDay));
      }
    }

    // Move to the next expected cycle start
    cycleStart = addDays(cycleStart, cycleLength);
  }

  return periodDays;
}

/**
 * formatDate(date)
 * ────────────────
 * Formats a Date into a friendly human-readable string.
 * e.g. "Saturday, 15 July 2025"
 *
 * @param {Date} date
 * @returns {string}
 */
export function formatDate(date) {
  return date.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

/**
 * formatDateShort(date)
 * ──────────────────────
 * Shorter date format for compact display.
 * e.g. "15 July 2025"
 *
 * @param {Date} date
 * @returns {string}
 */
export function formatDateShort(date) {
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}
