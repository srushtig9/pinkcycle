/**
 * calendar.js
 * ──────────────────────────────────────────────────────────────────
 * Controls everything on the Calendar page (calendar.html).
 *
 * Responsibilities:
 *   1. Load saved cycle data.
 *   2. Generate predicted period days for the next 120 days.
 *   3. Render a month-view calendar grid dynamically.
 *   4. Highlight today and period days.
 *   5. Handle Prev / Next month navigation.
 *
 * How the calendar grid works:
 *   A month grid always starts on Sunday (column 0).
 *   If the 1st of the month is a Wednesday (column 3),
 *   we insert 3 empty cells before the "1" day cell.
 *   Then we fill in day numbers, and wrap every 7 days into a new row.
 * ──────────────────────────────────────────────────────────────────
 */

import { loadCycleData } from './storage.js';
import { getPredictedPeriodDays, toISODateString } from './logic.js';

// --- State ---
// "currentYear" and "currentMonth" track which month we're displaying.
// We start with the current month.
let currentYear  = new Date().getFullYear();
let currentMonth = new Date().getMonth(); // 0 = January, 11 = December

// The Set of predicted period day strings ("YYYY-MM-DD")
let periodDaySet = new Set();

/**
 * init()
 * ──────
 * Runs on page load. Loads data, generates predictions, renders calendar.
 */
function init() {
  const data = loadCycleData();

  if (data) {
    // Generate predictions for the next 120 days
    periodDaySet = getPredictedPeriodDays(
      data.lastPeriodStart,
      data.cycleLength,
      data.periodDuration,
      120
    );
  }

  renderCalendar();
  attachNavListeners();
}

/**
 * renderCalendar()
 * ─────────────────
 * Renders the full calendar grid for the current month/year.
 * Called on load and every time the user navigates months.
 */
function renderCalendar() {
  updateMonthLabel();
  buildCalendarGrid();
}

/**
 * updateMonthLabel()
 * ───────────────────
 * Updates the "Month Year" heading above the calendar.
 * e.g. "July 2025"
 */
function updateMonthLabel() {
  const labelEl = document.getElementById('month-label');
  if (!labelEl) return;

  // Create a temporary Date for this month/year to format the name
  const temp = new Date(currentYear, currentMonth, 1);
  labelEl.textContent = temp.toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric'
  });
}

/**
 * buildCalendarGrid()
 * ────────────────────
 * Dynamically creates the <tbody> rows and <td> cells for the month.
 *
 * Algorithm:
 *   1. Find what day of the week the 1st of the month falls on (0=Sun, 6=Sat).
 *   2. Insert that many empty cells at the start.
 *   3. Fill in cells for each day of the month (1 to daysInMonth).
 *   4. Wrap into rows of 7.
 */
function buildCalendarGrid() {
  const tbody = document.getElementById('calendar-body');
  if (!tbody) return;

  // Clear any existing rows
  tbody.innerHTML = '';

  // How many days are in this month?
  // new Date(year, month+1, 0) gives the last day of the month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // What day of the week does the 1st fall on? (0=Sun, 6=Sat)
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();

  // Today's date string for comparison ("YYYY-MM-DD")
  const todayStr = toISODateString(new Date());

  // We'll build cells into a flat array, then slice into rows of 7
  const cells = [];

  // Add empty placeholder cells before the 1st of the month
  for (let e = 0; e < firstDayOfWeek; e++) {
    cells.push(createEmptyCell());
  }

  // Add a cell for each day in the month
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = buildDateString(currentYear, currentMonth + 1, day);
    cells.push(createDayCell(day, dateStr, todayStr));
  }

  // Slice the flat array into rows of 7 and append to <tbody>
  for (let i = 0; i < cells.length; i += 7) {
    const row = document.createElement('tr');
    const rowCells = cells.slice(i, i + 7);

    // Pad the last row with empty cells if it has fewer than 7
    while (rowCells.length < 7) {
      rowCells.push(createEmptyCell());
    }

    rowCells.forEach(cell => row.appendChild(cell));
    tbody.appendChild(row);
  }
}

/**
 * createDayCell(day, dateStr, todayStr)
 * ──────────────────────────────────────
 * Creates a <td> element for a specific day.
 * Applies 'today' and 'period-day' CSS classes as needed.
 *
 * The day link navigates to update.html with the date as a URL param,
 * so the form can optionally prefill the date.
 *
 * @param {number} day      - Day of month (1–31)
 * @param {string} dateStr  - "YYYY-MM-DD" for this cell
 * @param {string} todayStr - "YYYY-MM-DD" for today
 * @returns {HTMLElement} <td>
 */
function createDayCell(day, dateStr, todayStr) {
  const td = document.createElement('td');

  // Create the day link (clicking goes to update.html)
  const a = document.createElement('a');
  a.href = `update.html?date=${dateStr}`;
  a.className = 'cal-day';
  a.textContent = day;
  a.setAttribute('aria-label', dateStr);

  // Is this today?
  if (dateStr === todayStr) {
    a.classList.add('today');
  }

  // Is this a predicted period day?
  if (periodDaySet.has(dateStr)) {
    a.classList.add('period-day');
  }

  td.appendChild(a);
  return td;
}

/**
 * createEmptyCell()
 * ──────────────────
 * Creates a <td> with an invisible placeholder (for days before/after month).
 *
 * @returns {HTMLElement} <td>
 */
function createEmptyCell() {
  const td = document.createElement('td');
  const span = document.createElement('span');
  span.className = 'cal-day empty';
  span.textContent = '';
  td.appendChild(span);
  return td;
}

/**
 * buildDateString(year, month, day)
 * ───────────────────────────────────
 * Builds a "YYYY-MM-DD" string from numeric parts.
 * Pads month and day with a leading zero if needed.
 *
 * @param {number} year  - e.g. 2025
 * @param {number} month - 1–12 (NOT 0-indexed here)
 * @param {number} day   - 1–31
 * @returns {string}
 */
function buildDateString(year, month, day) {
  const mm = String(month).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return `${year}-${mm}-${dd}`;
}

/**
 * attachNavListeners()
 * ─────────────────────
 * Adds click listeners to the Prev and Next month buttons.
 */
function attachNavListeners() {
  const prevBtn = document.getElementById('prev-month');
  const nextBtn = document.getElementById('next-month');

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      // Go back one month (January → December of previous year)
      currentMonth--;
      if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
      }
      renderCalendar();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      // Go forward one month (December → January of next year)
      currentMonth++;
      if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
      }
      renderCalendar();
    });
  }
}

// Start when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', init);
