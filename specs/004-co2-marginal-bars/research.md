# Research: CO2 Marginal Cost Bars

## Decision 1 — Marginal formula: confirmed from source Excel

**Decision**: `marginal[N] = average_co2[N] × N − average_co2[N−1] × (N−1)`. For floor 2 (first data point), floor 1 total is treated as zero: `marginal[2] = average_co2[2] × 2`.

**Rationale**: Formula read directly from Excel file row formulas (`AVERAGE($D11:N11)` for running average, raw per-floor values in row 11). The marginal is the change in *total* CO2 when adding one floor. Since `total[N] = average[N] × N`, the marginal is `total[N] − total[N−1]`.

**Alternatives considered**: Using a finite-difference on the average curve directly — rejected because it gives the wrong result (change in average, not change in total).

---

## Decision 2 — Chart.js mixed chart: per-dataset type override

**Decision**: Keep chart-level `type: 'line'`. Add bar dataset with `type: 'bar'` property on the dataset object. Chart.js 4.x supports this natively.

**Rationale**: No separate chart instance needed, no DOM changes. The bar and line share the same x-axis (floor count labels), which is required for correct visual alignment.

**Alternatives considered**: Two overlaid Chart.js instances — rejected because synchronising x-axis scales and hover states across two canvases is complex and fragile.

---

## Decision 3 — Dataset ordering: `order` property

**Decision**: Bars get `order: 2`, lines get `order: 1`. In Chart.js, lower `order` = drawn later = rendered on top. So lines (order 1) appear above bars (order 2).

**Rationale**: Chart.js documentation confirms this behaviour for mixed charts. Setting order is the correct approach; z-index CSS does not apply to canvas 2D drawing.

**Alternatives considered**: Drawing bars first by array position — rejected because Chart.js mixed charts do not guarantee rendering order by array position.

---

## Decision 4 — Bar colour: hex opacity suffix

**Decision**: `COLORS[bouwmethodiek] + '66'` where COLORS stores 6-digit hex values. Hex `66` = decimal 102 = 40% of 255.

**Rationale**: Simple, no colour library needed. The bar colour visually connects to the selected scenario's line. 40% opacity keeps bars visible but clearly subordinate to the lines.

**Alternatives considered**: `rgba()` — requires parsing the hex colour, adding complexity. CSS opacity on the dataset — not available per-dataset in Chart.js canvas rendering.

---

## Decision 5 — Reactivity: call updateMarginalBars on every subscribe

**Decision**: Call `updateMarginalBars(state.bouwmethodiek)` in the `main.js` subscribe callback on every state change, not just when bouwmethodiek changes.

**Rationale**: `animation: false` and `_chart.update('none')` make the cost negligible. Tracking "did bouwmethodiek change?" would add stateful logic to main.js. The simpler approach is correct here.

**Alternatives considered**: Subscribe to bouwmethodiek changes only — rejected as premature optimisation with no measurable benefit.

---

## Decision 6 — Y-axis: remove min: 0 constraint

**Decision**: Remove `min: 0` from the y-axis configuration. Let Chart.js auto-scale.

**Rationale**: Marginal bars at threshold floors (e.g. floor 71 spike: BAU marginal ≈ 33 kg + floor 70 base ≈ very large) will exceed the current average line values. With `min: 0` locked, Chart.js will clip the top of tall bars. Auto-scale accommodates both datasets.

**Alternatives considered**: Setting a manual `max` — rejected because the max changes with the selected bouwmethodiek and would need to be recomputed on every update.

---

## Decision 7 — getChartData() loop: extend to 71

**Decision**: Change `for (let f = 2; f <= 50; f++)` to `for (let f = 2; f <= 71; f++)` in `getImpact.js`. The existing `interpolate()` function handles the new control points correctly.

**Rationale**: The energy chart already uses floor 71 as its maximum (`for (let f = 2; f <= 71; f++)`). Aligning the CO2 chart to the same range eliminates the inconsistency between modules.

**Alternatives considered**: Keeping the loop at 50 and only computing marginals for 2–50 — rejected because the spec requires bars to cover the full 2–71 range.

---

## Decision 8 — Data version: no bump for floor 51–71 extension

**Decision**: Keep `data_version: "0.1.0-placeholder"`. No version bump.

**Rationale**: Adding new control points for previously uncovered floors is not a breaking change — no existing control point value is modified. The existing `dataVersion.js` test checks consistency between the `data_version` field and the value returned by `getImpact()`. Both will still be `"0.1.0-placeholder"`. The `getImpactSnapshot.js` tests use floor counts within 2–50 and will not be affected.

**Alternatives considered**: Bumping to `"0.2.0-placeholder"` — rejected because it would require updating the 5 snapshot tests and implies a bigger change than actually occurred.

---

## Confirmed Extended Data Values

Computed using existing trend gradient (~2.5 kg CO₂/m²/floor for BAU from floors 40–50) and spike magnitudes consistent with prior elevator thresholds:

| Floor | BAU | Hybride | Biobased | Innovatief |
|---|---|---|---|---|
| 51 | 250 | 177 | 160 | 150 |
| 55 | 258 | 182 | 165 | 155 |
| 60 | 271 | 191 | 173 | 162 |
| 65 | 283 | 200 | 180 | 170 |
| 70 | 295 | 208 | 188 | 176 |
| 71 | 328 | 232 | 210 | 198 |

Spike magnitudes at floor 71: BAU +33, hybride +24, biobased +22, innovatief +22. Consistent with floor 38 spikes (BAU +30, hybride +23, biobased +22, innovatief +19).
