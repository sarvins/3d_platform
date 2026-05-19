# Data Model: CO2 Marginal Cost Bars

## Overview

No new data files or store fields. One existing data file is extended. One computed value is added to the chart layer.

---

## Entity 1 — ExtendedCO2LookupTable (modification of existing)

**File**: `data/co2Material.json`
**Description**: The existing CO2 material lookup table, extended with control points for floors 51–71.

**Change**: Each of the 4 bouwmethodiek arrays gains 6 new `[floor, kg_CO2_m2]` control points:
- `[51, x]`, `[55, x]`, `[60, x]`, `[65, x]`, `[70, x]`, `[71, x]`

**Unchanged**: All existing control points for floors 2–50 remain byte-for-byte identical. `data_version` stays `"0.1.0-placeholder"`.

**Validation rules**:
- Values at floors 51–70 MUST be greater than the floor 50 value (monotonic increase)
- Value at floor 71 MUST be greater than at floor 70 by at least 20 kg CO₂/m² (spike)
- All 4 variants MUST be extended (no partial update)

---

## Entity 2 — MarginalCO2Series (computed, not stored)

**Description**: The series of marginal CO2 values per floor for the currently selected bouwmethodiek. Computed at runtime in `co2MaterialChart.js` from the interpolated average data returned by `getChartData()`.

**Formula**: `marginal[i] = avg[i] × floor[i] − avg[i−1] × floor[i−1]`
- Where `avg[i]` = interpolated average CO2/m² at floor `floor[i]`
- For `i = 0` (floor 2): `marginal[0] = avg[0] × 2` (floor 1 total treated as zero)

**Length**: 70 values (floors 2–71)

**Units**: kg CO₂/m² (marginal cost of the floor, expressed per m² of gross floor area)

**Scope**: Recomputed each time `updateMarginalBars(bouwmethodiek)` is called. Not stored in the central store or any module variable between calls.

---

## Unchanged Entities

- `store.js` — no new fields
- `data/thresholds.json` — unchanged
- `data/energyData.json` — unchanged
- `ImpactResult` type — unchanged
- `getImpact()` signature — unchanged
- `getChartData()` return type — unchanged (same shape, longer arrays after loop extension)
