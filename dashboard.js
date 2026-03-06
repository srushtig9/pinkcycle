/**
 * dashboard.js
 * ──────────────────────────────────────────────────────────────────
 * Controls everything on the Dashboard page (index.html).
 *
 * Responsibilities:
 *   1. Load saved cycle data from localStorage.
 *   2. If no data: show the "empty state" prompt.
 *   3. If data exists: calculate next period, render the countdown ring.
 *
 * The countdown ring uses CSS conic-gradient.
 *   conic-gradient draws a "pie slice" from a start angle.
 *   We calculate what percentage of the cycle has passed,
 *   then draw that percentage of the ring in pink.
 *
 *   Example: 7 days remaining of a 28-day cycle → 75% elapsed
 *   → conic-gradient fills 75% (270°) with pink.
 * ──────────────────────────────────────────────────────────────────
 */

// Import our helper modules using ES6 module syntax
import { loadCycleData } from './storage.js';
import {
  getNextPeriodStart,
  getDaysUntilNextPeriod,
  formatDateShort
} from './logic.js';

/**
 * init()
 * ──────
 * Entry point — runs when the page loads.
 * Checks for saved data and shows the right view.
 */
function init() {
  const data = loadCycleData();

  if (!data) {
    // No data saved yet → show the empty state, hide the dashboard content
    showEmptyState();
  } else {
    // Data found → render the dashboard
    renderDashboard(data);
  }
}

/**
 * showEmptyState()
 * ─────────────────
 * Shows the "no data yet" message and hides the countdown card.
 */
function showEmptyState() {
  const emptyEl = document.getElementById('empty-state');
  const dashEl  = document.getElementById('dashboard-content');

  if (emptyEl) emptyEl.classList.remove('hidden');
  if (dashEl)  dashEl.classList.add('hidden');
}

/**
 * renderDashboard(data)
 * ──────────────────────
 * Given saved cycle data, calculates predictions and updates the UI.
 *
 * @param {Object} data - { lastPeriodStart, cycleLength, periodDuration }
 */
function renderDashboard(data) {
  const emptyEl = document.getElementById('empty-state');
  const dashEl  = document.getElementById('dashboard-content');

  // Make sure the right sections are visible
  if (emptyEl) emptyEl.classList.add('hidden');
  if (dashEl)  dashEl.classList.remove('hidden');

  // --- Calculate key values ---

  // When is the next period predicted to start?
  const nextStart = getNextPeriodStart(data.lastPeriodStart, data.cycleLength);

  // How many days until that date?
  const daysLeft = getDaysUntilNextPeriod(nextStart);

  // What fraction of the cycle is REMAINING? (used to draw the ring)
  // If daysLeft = 7 and cycleLength = 28 → ratio = 7/28 = 0.25 (25% remaining)
  const ratio = Math.min(daysLeft / data.cycleLength, 1);

  // --- Update the countdown number ---
  const daysEl = document.getElementById('countdown-days');
  if (daysEl) daysEl.textContent = daysLeft;

  // --- Update the next date display ---
  const dateEl = document.getElementById('next-date');
  if (dateEl) dateEl.textContent = formatDateShort(nextStart);

  // --- Update cycle metadata ---
  const cycleLenEl = document.getElementById('meta-cycle-length');
  const durationEl = document.getElementById('meta-period-duration');
  const lastStartEl = document.getElementById('meta-last-start');

  if (cycleLenEl) cycleLenEl.textContent = data.cycleLength;
  if (durationEl) durationEl.textContent = data.periodDuration;
  if (lastStartEl) lastStartEl.textContent = formatDateShort(
    parseLastDate(data.lastPeriodStart)
  );

  // --- Draw the conic-gradient ring ---
  renderCountdownRing(ratio);
}

/**
 * renderCountdownRing(ratio)
 * ───────────────────────────
 * Updates the circular countdown ring using CSS conic-gradient.
 *
 * How conic-gradient works here:
 *   conic-gradient(COLOR A X%, COLOR B X%)
 *   → fills from 0° to (X% of 360°) with COLOR A
 *   → fills the rest with COLOR B
 *
 *   We want the filled (elapsed) portion to be pink,
 *   and the remaining portion to be light pink (accent).
 *
 *   elapsed% = (1 - ratio) × 100
 *
 * @param {number} ratio - 0 to 1, fraction of cycle REMAINING
 */
function renderCountdownRing(ratio) {
  const ring = document.getElementById('countdown-ring');
  if (!ring) return;

  // How much of the cycle has ELAPSED (percentage)?
  const elapsed = Math.round((1 - ratio) * 100);

  // Build the conic-gradient string
  // The pink fill represents elapsed days (past portion of the cycle)
  ring.style.background = `conic-gradient(
    #e8789a ${elapsed}%,
    #f4c2d2 ${elapsed}%
  )`;
}

/**
 * parseLastDate(dateString)
 * ──────────────────────────
 * Helper: parses a "YYYY-MM-DD" string into a local Date.
 * (Duplicated here to avoid importing parseLocalDate from logic.js — 
 *  keeps this file self-contained for display purposes.)
 *
 * @param {string} dateString
 * @returns {Date}
 */
function parseLastDate(dateString) {
  const [y, m, d] = dateString.split('-').map(Number);
  return new Date(y, m - 1, d);
}

// Run init when the DOM is ready
document.addEventListener('DOMContentLoaded', init);
