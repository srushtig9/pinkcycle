/**
 * storage.js
 * ──────────────────────────────────────────────────────────────────
 * This file handles all reading and writing to localStorage.
 *
 * What is localStorage?
 *   localStorage is a browser feature that lets us save small pieces
 *   of data as text (strings) directly in the user's browser.
 *   The data survives page reloads and browser restarts — it sticks
 *   around until the user clears their browser data or we delete it.
 *
 * We store the cycle data as a JSON string under one key: 'pinkcycle'.
 *
 * The saved object looks like:
 *   {
 *     lastPeriodStart: "2025-06-01",   // ISO date string (YYYY-MM-DD)
 *     cycleLength: 28,                 // how many days between periods
 *     periodDuration: 5                // how many days the period lasts
 *   }
 * ──────────────────────────────────────────────────────────────────
 */

// The key we use to store data in localStorage.
const STORAGE_KEY = 'pinkcycle';

/**
 * saveCycleData(data)
 * ───────────────────
 * Saves the user's cycle information to localStorage.
 *
 * @param {Object} data - An object with:
 *   - lastPeriodStart {string}  e.g. "2025-06-01"
 *   - cycleLength     {number}  e.g. 28
 *   - periodDuration  {number}  e.g. 5
 *
 * JSON.stringify() converts the JavaScript object into a text string
 * so that localStorage (which only stores strings) can hold it.
 */
export function saveCycleData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/**
 * loadCycleData()
 * ───────────────
 * Reads and returns the saved cycle data from localStorage.
 *
 * @returns {Object|null} The cycle data object, or null if nothing is saved yet.
 *
 * JSON.parse() converts the stored text string back into a JavaScript object.
 * If nothing has been saved yet, localStorage.getItem() returns null,
 * and we return null to let the caller know there's no data yet.
 */
export function loadCycleData() {
  const raw = localStorage.getItem(STORAGE_KEY);

  // If nothing is stored, return null (caller should handle this gracefully)
  if (!raw) return null;

  // Parse the JSON string back into a JavaScript object
  try {
    return JSON.parse(raw);
  } catch (err) {
    // If the stored data is corrupted for any reason, treat it as missing
    console.warn('PinkCycle: Could not parse stored data. Clearing.', err);
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

/**
 * clearCycleData()
 * ────────────────
 * Removes all saved cycle data from localStorage.
 * (Useful for a "reset" feature in the future.)
 */
export function clearCycleData() {
  localStorage.removeItem(STORAGE_KEY);
}
