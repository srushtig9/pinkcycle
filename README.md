# 🌸 PinkCycle

A beginner-friendly, classy period tracking mini project built with pure HTML, CSS, and Vanilla JavaScript.

---

## What is PinkCycle?

PinkCycle is a simple, privacy-first period tracker that lives entirely in your browser.
It predicts upcoming periods, shows a countdown to your next cycle, and visualises period days on a full month calendar — all without sending any data to a server.

This is a **portfolio mini project** designed to demonstrate:
- Multi-page HTML structure
- ES6 JavaScript modules
- localStorage usage
- Dynamic DOM generation
- CSS conic-gradient for a circular countdown

---

## Features

- 🌸 **Dashboard** — Circular countdown showing days until next period
- 📅 **Calendar** — Full month view with predicted period days highlighted
- ✏️ **Update** — Form to enter or update your cycle details
- 💾 **Persistent storage** — Data saved in browser localStorage
- 📱 **Responsive** — Works on desktop and mobile
- 🔒 **Private** — Zero backend, zero data sharing

---

## Technologies Used

| Technology | Purpose |
|---|---|
| HTML5 | Page structure and semantics |
| CSS3 | Styling, layout, conic-gradient ring |
| Vanilla JavaScript (ES6) | Logic, DOM manipulation, localStorage |
| Google Fonts | Typography (Cormorant Garamond + DM Sans) |

No frameworks. No build tools. No external libraries.

---

## How to Run Locally

> **Important:** Because this project uses ES6 modules (`import`/`export`),
> you **cannot** open the HTML files directly by double-clicking them.
> Browsers block ES6 modules when opened as `file://` URLs.

### Option 1 — VS Code Live Server (easiest)

1. Install [VS Code](https://code.visualstudio.com/)
2. Install the **Live Server** extension (by Ritwick Dey)
3. Open the `period-tracker/` folder in VS Code
4. Right-click `index.html` → **Open with Live Server**

### Option 2 — Python (built into most computers)

```bash
cd period-tracker
python3 -m http.server 8080
```
Then open: http://localhost:8080

### Option 3 — Node.js (npx)

```bash
cd period-tracker
npx serve .
```
Then open the URL shown in the terminal.

---

## Folder Structure

```
period-tracker/
├── index.html        ← Dashboard (countdown + next period info)
├── calendar.html     ← Month-view calendar with period day highlights
├── update.html       ← Form to enter cycle details
│
├── css/
│   └── styles.css    ← All styles (no inline CSS anywhere)
│
├── js/
│   ├── storage.js    ← localStorage save/load helpers
│   ├── logic.js      ← Period prediction calculations
│   ├── calendar.js   ← Calendar grid rendering
│   └── dashboard.js  ← Countdown ring and dashboard display
│
└── README.md         ← You are here
```

---

## How the Prediction Logic Works

PinkCycle uses a simple, well-understood model:

1. **You provide:**
   - The date your last period started
   - How long your cycle is (e.g. 28 days)
   - How many days your period lasts (e.g. 5 days)

2. **PinkCycle calculates:**
   - `nextStart = lastPeriodStart + cycleLength days`
   - If that date is already in the past, it adds another `cycleLength` and keeps going until it finds a future date.

3. **Period days are highlighted:**
   - For each predicted cycle start, the following `periodDuration` days are all marked as period days.
   - This repeats forward for 120 days.

4. **The countdown ring:**
   - Shows how many days remain until the next period.
   - Uses CSS `conic-gradient` to fill a circle proportionally — more pink = more of the cycle has passed.

> **Note:** This is a simple average-based model. Real cycles vary. PinkCycle is for general awareness, not medical advice.

---

## Getting Started (First Time Use)

1. Open the app in a local server (see instructions above)
2. You'll see the **empty state** on the dashboard — click **"Set Up My Cycle"**
3. Enter your last period start date, cycle length, and period duration
4. Click **Save** — you'll be redirected to the dashboard
5. Explore the **Calendar** to see predicted period days highlighted in pink

---

## Customisation Ideas (for learners)

- Add a **notes** field to log symptoms
- Add a **phase display** (follicular, ovulation, luteal)
- Add a **history log** of past periods
- Add a **settings page** to clear data
- Add a **print stylesheet** for the calendar

---

*Built with 💕 — a beginner-friendly portfolio project.*
