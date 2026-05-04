# Research: Energie Module

**Branch**: `002-energie-module` | **Date**: 2026-05-02

No external research required — stack and patterns are pre-determined. This file documents architectural decisions specific to the Energie module extension.

---

## Decision 1 — Energy data structure: base values + adjustment factors

**Decision**: `data/energyData.json` stores base energy values per installatie type (kWh/m²/year per category) plus Step 2 adjustment factors (multiplicative). The `getImpact()` function applies: `adjusted = base × ∏(relevant_factors)`.

**Structure**:
```json
{
  "data_version": "0.1.0-placeholder",
  "base": {
    "business_as_usual": { "verwarming": 15, "koeling": 5, ... },
    "high_tech":         { "verwarming": 8,  "koeling": 4, ... },
    "natuurlijk":        { "verwarming": 5,  "koeling": 3, ... }
  },
  "lift_scale": { "floors_9":  1.0, "floors_28": 1.3, "floors_38": 1.6 },
  "adjustments": {
    "zonwering":       { "extern": { "koeling": 0.70 }, "intern": { "koeling": 0.90 }, "zonwerend_glas": { "koeling": 0.85 } },
    "balkons":         { "buiten": { "verwarming": 0.97 }, "binnen": { "verwarming": 1.00 }, "gevellijn": { "verwarming": 0.99 } },
    "raamOppervlak":   { "30": { "verwarming": 0.80, "koeling": 0.70 }, "50": {}, "80": { "verwarming": 1.30, "koeling": 1.40 } },
    "isolatieRc":      { "3": { "verwarming": 1.30 }, "5": {}, "8": { "verwarming": 0.70 } },
    "luchtdichtheid":  { "hoog": { "ventilatie": 0.85 }, "norm": {} },
    "liftEfficiency":  { "zuinig": { "lift": 0.60 }, "standaard": {} }
  }
}
```

**Rationale**: Separation of base from adjustments keeps the data readable and auditable. Adding a new Step 2 control in a future layer requires only adding a new key to `adjustments`. The multiplicative model is a known simplification — adequate for Layer 1 order-of-magnitude advisory.

**Alternatives considered**:
- Full cross-product lookup (e.g. all combinations of installatie × balkons × zonwering × raam × isolatie × luchtdichtheid × lift): 3 × 3 × 3 × 7 × 6 × 2 × 2 = 4,536 rows. Unmaintainable manually. Rejected.
- Additive deltas: less physically accurate than multiplicative (factors compound non-linearly in real energy physics). Rejected.

---

## Decision 2 — store.js extension: step2 sub-object

**Decision**: Add a `step2` sub-object to the store's `_state`. This keeps Step 2 params grouped and avoids name collisions with Step 1 fields. `setState({ step2: { raamOppervlak: 60 } })` merges into the existing `step2` sub-object using deep merge.

```javascript
_state = {
  floors: 10,
  bouwmethodiek: 'business_as_usual',
  installatie: 'business_as_usual',
  step2: {
    balkons: 'buiten',
    zonwering: 'extern',
    raamOppervlak: 50,       // integer: 30/40/50/60/70/80
    isolatieRc: 5,            // integer: 3/4/5/6/7/8
    luchtdichtheid: 'norm',
    liftEfficiency: 'standaard',
  }
}
```

**Rationale**: Grouping Step 2 under a sub-key makes it clear in the state tree which inputs are Step 2. It also future-proofs for Step 2 expansion without polluting the top-level state namespace.

**Backward compatibility**: Existing subscribers receive the new `step2` field in their state copy but need not use it. The `tower.update()`, `updateOutputs()`, and `updateMarker()` calls in `main.js` remain unchanged — they only use `state.floors`, `state.bouwmethodiek`, and `state.installatie`.

---

## Decision 3 — getImpact() energy computation

**Decision**: Extend `getImpact.js` to:
1. Import `data/energyData.json` with JSON import assertion.
2. In `getImpact()`, read `step2Params` (already a parameter, previously unused).
3. Compute `EnergyBreakdown` using base values + adjustment factors.
4. Scale `lift` by floor count using `lift_scale` thresholds.
5. Populate `co2_energy_kwh_m2` (total), `energy_neutrality_pct`, and `co2_breakdown.energie` (future field).

**Lift scaling**: lift energy scales non-linearly with floor count — more floors means more trips, longer travel time, heavier shaft structure. Applied as a multiplier from the `lift_scale` table in energyData.json.

**PV calculation** (from spec): `pv_prod = 375m² × 150 kWh/m²/yr = 56,250 kWh/yr`. `energy_neutrality_pct = min(100, round((56250 / (total_kwh_m2 × floors × 625)) × 100))`.

**Also exported**: `getEnergyChartData(installatie, step2Params)` → pre-computed energy breakdown for all floors 2–71, used by `energyChart.js` on init and on any Step 2 change.

---

## Decision 4 — Energy chart: stacked bar, x-axis = height in metres

**Decision**: Chart.js `bar` type with `stacking: true`. X-axis labels are building heights in metres (`floor × 3.5m`), shown for every 5th floor to avoid label crowding. All 70 bars (floors 2–71) are rendered; the current floor's bar is highlighted with a higher opacity border.

**Current floor highlight**: Override the bar at the current floor index with `borderColor: '#2D5F8A'`, `borderWidth: 3`, all other bars with borderWidth: 0.

**Rationale**: Continuous bars (all floors) give a smoother visual and let the user see the full curve of energy use vs height. The PowerPoint showed 14 discrete scenarios — these were reference points, not a UI constraint.

**Alternatives considered**:
- Line chart (area): less clear for "stacked categories" intent; harder to read category contributions.
- 14 discrete bars (matching PowerPoint): misses the smooth height progression the floor stepper provides.

---

## Decision 5 — Isolatie slider: 6 discrete positions

**Decision**: HTML range input, `min=0`, `max=5`, `step=1` (6 positions). Position maps to:

| Position | Rc | Uglas |
|---|---|---|
| 0 | 3 | 1.2 |
| 1 | 4 | 1.1 |
| 2 | 5 | 1.0 (default) |
| 3 | 6 | 0.95 |
| 4 | 7 | 0.85 |
| 5 | 8 | 0.80 |

Store saves `isolatieRc` as the integer Rc value (3–8). Display shows both Rc and Uglas.

**Rationale**: Six meaningful steps cover the realistic insulation range for Dutch residential towers. Continuous input would imply precision the lookup data cannot support.

---

## Decision 6 — step2Panel placement: below Step 1 in scrollable panel

**Decision**: `step2Panel.js` renders a new `<div>` section appended inside the existing `#panel` container, clearly separated with a heading "Stap 2 — Gevelparameters". The panel already has `overflow-y: auto`, so Step 2 controls scroll naturally without layout changes.

**Rationale**: No layout redesign needed. The panel was designed for this expansion in the Material module. A separate tab or modal would require new CSS and HTML structure.
