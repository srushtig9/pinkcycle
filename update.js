/**
 * update.js
 * ──────────────────────────────────────────────────────────────────
 * Controls the Update page (update.html).
 *
 * Responsibilities:
 *   1. Pre-fill the form with any previously saved data.
 *   2. If a "date" URL parameter is present, pre-fill the date field.
 *   3. On form submission, validate, save data, redirect to dashboard.
 *
 * URL parameter usage:
 *   When the user clicks a calendar day, they go to:
 *     update.html?date=2025-07-15
 *   We read this parameter and prefill the "Last period start" field.
 *
 * How URLSearchParams works:
 *   const params = new URLSearchParams(window.location.search);
 *   params.get('date') → "2025-07-15" or null if not present
 * ──────────────────────────────────────────────────────────────────
 */

import { loadCycleData, saveCycleData } from './storage.js';

/**
 * init()
 * ──────
 * Runs on page load. Pre-fills the form and sets up the submit handler.
 */
function init() {
  prefillForm();
  attachSubmitListener();
}

/**
 * prefillForm()
 * ──────────────
 * Fills the form fields with previously saved values (if any).
 * Also checks for a "?date=YYYY-MM-DD" URL parameter.
 */
function prefillForm() {
  const savedData = loadCycleData();

  // --- Prefill from saved localStorage data ---
  if (savedData) {
    setFieldValue('last-period-start', savedData.lastPeriodStart);
    setFieldValue('cycle-length', savedData.cycleLength);
    setFieldValue('period-duration', savedData.periodDuration);
  }

  // --- Override the date field if a URL parameter is present ---
  // This happens when the user clicked a specific calendar day.
  const params = new URLSearchParams(window.location.search);
  const dateParam = params.get('date');

  if (dateParam) {
    // Only prefill if the date looks valid (basic check)
    setFieldValue('last-period-start', dateParam);
  }
}

/**
 * setFieldValue(id, value)
 * ─────────────────────────
 * Helper to safely set an input field's value.
 *
 * @param {string} id    - The element's id attribute
 * @param {*}      value - The value to set
 */
function setFieldValue(id, value) {
  const el = document.getElementById(id);
  if (el && value !== undefined && value !== null) {
    el.value = value;
  }
}

/**
 * attachSubmitListener()
 * ───────────────────────
 * Listens for the form's "Save" button click.
 * Validates input, saves to localStorage, redirects to dashboard.
 */
function attachSubmitListener() {
  const form = document.getElementById('update-form');
  if (!form) return;

  form.addEventListener('submit', function (event) {
    // Prevent the default form behavior (page reload / GET request)
    event.preventDefault();

    // --- Read form values ---
    const lastPeriodStart = getFieldValue('last-period-start');
    const cycleLength     = parseInt(getFieldValue('cycle-length'), 10);
    const periodDuration  = parseInt(getFieldValue('period-duration'), 10);

    // --- Basic validation ---
    const errorEl = document.getElementById('form-error');

    if (!lastPeriodStart) {
      showError(errorEl, 'Please enter your last period start date.');
      return;
    }

    if (isNaN(cycleLength) || cycleLength < 15 || cycleLength > 60) {
      showError(errorEl, 'Cycle length should be between 15 and 60 days.');
      return;
    }

    if (isNaN(periodDuration) || periodDuration < 1 || periodDuration > 15) {
      showError(errorEl, 'Period duration should be between 1 and 15 days.');
      return;
    }

    // Hide any previous error
    if (errorEl) errorEl.style.display = 'none';

    // --- Save to localStorage ---
    saveCycleData({
      lastPeriodStart,
      cycleLength,
      periodDuration
    });

    // --- Redirect to the dashboard ---
    // A small delay so the user sees the save happened (optional)
    window.location.href = 'index.html?saved=1';
  });
}

/**
 * getFieldValue(id)
 * ──────────────────
 * Helper to read a trimmed string from an input field.
 *
 * @param {string} id
 * @returns {string}
 */
function getFieldValue(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : '';
}

/**
 * showError(el, message)
 * ───────────────────────
 * Displays a validation error message in the form.
 *
 * @param {HTMLElement|null} el      - The error container element
 * @param {string}           message - The message to show
 */
function showError(el, message) {
  if (!el) return;
  el.textContent = message;
  el.style.display = 'block';
}

// Run when DOM is ready
document.addEventListener('DOMContentLoaded', init);
