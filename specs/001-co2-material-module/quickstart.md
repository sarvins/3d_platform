# Quickstart: CO2 Material Module

**Branch**: `001-co2-material-module`

---

## Prerequisites

- A modern desktop browser: Chrome, Firefox, or Edge (current stable)
- Node.js (any version ≥18) — for running tests only
- VS Code with Live Server extension (recommended) OR `npx` available

---

## Run the platform

**Option A — VS Code Live Server (recommended)**

1. Open the `3d_platform/` folder in VS Code.
2. Right-click `index.html` → "Open with Live Server".
3. Browser opens at `http://127.0.0.1:5500`.

**Option B — npx serve**

```bash
cd 3d_platform
npx serve .
# Open http://localhost:3000 in your browser
```

**Option C — Direct file open (fallback)**

Open `index.html` directly in Chrome or Edge from the file system. Three.js and Chart.js load from CDN. Note: some CDN resources may be blocked by browser security on `file://` — use Option A or B if the page does not render correctly.

---

## What you should see on first load

- **Left panel**: "Verdiepingen" stepper showing 10, "Business as usual" selected.
- **Right top**: 3D tower — 10 floors, foundation piles visible below ground, elevator shaft in core.
- **Right bottom**: CO2 chart with three coloured lines (conventioneel, hybride, biobased); vertical dashed line at floor 10.
- **Output panel**: CO2 value, kern variant (B — 8×10m), 1 lift, tolerance disclaimer.

---

## Try it

1. Click "+" repeatedly past floor 9 — watch a new elevator shaft appear in the 3D model and an advisory callout fire.
2. Click "+" past floor 28 — third elevator threshold; CO2 spikes on the chart marker.
3. Switch bouwmethodiek to "Best practice bio-based" — CO2 metric drops; 3D model unchanged; chart lines unchanged.
4. Return to floor 5 — model shrinks, piles become shallower, CO2 rises (foundation cost dominates at low floors).

---

## Run the tests

All four mandatory tests run with Node.js from the `3d_platform/` folder:

```bash
node tests/thresholdIntegrity.js    # Gate 3: threshold_reached present in all entries
node tests/getImpactSnapshot.js     # Gate 6: 10 known input/output pairs
node tests/abstractionBoundary.js   # Gate 4: no UI file reads data directly
node tests/dataVersion.js           # Gate 5: data_version consistent
```

Each script exits with code 0 on pass, 1 on fail, and prints a clear message.

---

## File a data correction

If a CO2 lookup value needs updating (e.g. after team verification of source data):

1. Edit the relevant control-point array in `js/getImpact.js`.
2. Bump `DATA_VERSION` by one patch version (e.g. `'0.1.0-placeholder'` → `'0.1.1'`).
3. Run `node tests/dataVersion.js` and `node tests/getImpactSnapshot.js` — update snapshot expectations if values changed intentionally.
4. Commit with message: `data: update CO2 lookup values to vX.Y.Z`.

---

## Known limitations (Layer 1)

- **Illustrative data only**: All CO2 values are read from PowerPoint graphs (±5–10 kg CO2/m² tolerance). Must be verified with the team before advisory use.
- **2nd and 4th elevator thresholds**: Floor counts of ~16 and ~38 are assumed — not confirmed from structural source data.
- **Brand (fire safety CO2)**: Not yet calculable; shown as TBD in output panel.
- **Energie module**: Not built; energy and PV neutrality outputs show as null/TBD.
- **Step 2 parameters**: Not built; balcony, solar shading, insulation, glazing sliders not yet active.
