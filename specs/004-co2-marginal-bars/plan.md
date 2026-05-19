# Implementation Plan: CO2 Marginal Cost Bars

**Branch**: `004-co2-marginal-bars` | **Date**: 2026-05-19 | **Spec**: [spec.md](spec.md)

## Summary

Two additive changes to the CO2 Material module:
1. **Extend `data/co2Material.json`** — add control points for floors 51–71 across all 4 bouwmethodiek variants, including a floor 71 spike for the 5th elevator threshold
2. **Add marginal CO2 bars** to `js/charts/co2MaterialChart.js` — semi-transparent bars behind the existing average lines, reactive to the selected bouwmethodiek

Also required: extend `getChartData()` loop in `js/getImpact.js` from floor 50 to floor 71, and add floor 71 threshold annotation to the chart.

No new data files. No store.js changes. No Energie module or viewer files touched.

## Technical Context

**Language**: JavaScript ES2022+ (ES Modules, native browser)
**Chart library**: Chart.js 4.4.x (CDN UMD) — mixed chart (bar + line on same canvas)
**Data**: `data/co2Material.json` — versioned JSON lookup table, imported only via `getImpact.js`
**Abstraction**: `getChartData()` in `getImpact.js` returns `{ labels: number[], datasets: { [key]: number[] } }` for all 4 bouwmethodiek variants
**Testing**: 5 existing Node.js plain-assertion tests — all must continue to pass

## Constitution Check

| Gate | Check | Result |
|---|---|---|
| 1 | Work within current phase scope (Layer 1 Material chart enhancement)? | ✅ PASS |
| 2 | Structural values from threshold table, indexed by height/GFA? | ✅ PASS — no new structural logic |
| 3 | All threshold entries have non-empty `threshold_reached`? | ✅ PASS — 5 tests passing |
| 4 | All data access through `getImpact()` with pinned return type? | ✅ PASS — marginals computed from `getChartData()` |
| 5 | Data files versioned? | ✅ PASS — `data_version` field present; stays `"0.1.0-placeholder"` (extension, not breaking change) |
| 6 | Mandatory tests exist and pass? | ✅ PASS — 5 tests green; existing floor 2–50 values unchanged |
| 7 | UI renders advisory callouts for `thresholds_crossed`? | ✅ PASS — unchanged |
| 8 | Tolerance disclaimer on all CO2/energy outputs? | ✅ PASS — existing disclaimer unchanged |
| 9 | Deliverable independently deployable? | ✅ PASS |

**Pre-existing issue (not in scope):** `co2MaterialChart.js` plots only 3 of 4 bouwmethodiek variants — `max_innovatief` is absent from COLORS, LABELS_NL, and the dataset array. Documented here; out of scope.

## Files Changed

```text
data/
└── co2Material.json          ← add control points floors 51–71 (US2)
js/
├── getImpact.js              ← extend getChartData() loop from 50 to 71 (US2)
├── charts/
│   └── co2MaterialChart.js   ← marginal bars dataset, updateMarginalBars(), floor 71 annotation (US1)
└── main.js                   ← import + call updateMarginalBars in subscribe (US1)
```

## Extended Data Values (floors 51–71)

Derived by continuing the existing trend (~2.5 kg CO₂/m²/floor for BAU) with a proportional spike at floor 71 matching prior elevator threshold spike magnitudes (floor 38: BAU +30, hybride +23, biobased +22, innovatief +19).

| Variant | [51] | [55] | [60] | [65] | [70] | [71] spike |
|---|---|---|---|---|---|---|
| business_as_usual | 250 | 258 | 271 | 283 | 295 | 328 |
| hoogwaardig_hybride | 177 | 182 | 191 | 200 | 208 | 232 |
| best_practice_biobased | 160 | 165 | 173 | 180 | 188 | 210 |
| max_innovatief | 150 | 155 | 162 | 170 | 176 | 198 |

All values are indicative (Layer 1). Tolerance ±5–10 kg CO₂/m². Team verification required.

## Key Technical Decisions (from research.md)

### Mixed chart (bar + line)
Chart.js supports per-dataset `type` override. Chart-level `type: 'line'` stays. Bars added as a dataset with `type: 'bar'`. No library change needed.

### Dataset ordering
`order` in Chart.js: lower = drawn later = on top. Lines: `order: 1`. Bars: `order: 2` (rendered behind lines).

### Marginal formula
```javascript
marginals[0] = avg[0] * labels[0];                              // floor 2, treat floor 1 total as 0
marginals[i] = avg[i] * labels[i] - avg[i-1] * labels[i-1];   // floor 3+
```
Computed from `datasets[bouwmethodiek]` returned by `getChartData()`.

### Bar colour
`COLORS[bouwmethodiek] + '66'` — hex `66` ≈ 40% opacity, matching the selected line's colour.

### Reactivity
`updateMarginalBars(bouwmethodiek)` exported from `co2MaterialChart.js`. Called from `main.js` subscribe on every state change. Cost: one `_chart.update('none')` — negligible with `animation: false`.

### Tooltip
```javascript
callbacks: {
  label: ctx => {
    if (ctx.dataset.type === 'bar') return `Marginale CO₂: ${ctx.parsed.y} kg CO₂/m²`;
    return `${ctx.dataset.label}: ${ctx.parsed.y} kg CO₂/m²`;
  }
}
```

### Y-axis scaling
Remove hardcoded `min: 0` — let Chart.js auto-scale so tall marginal bars at spike floors are not clipped.

### getChartData() extension
Change `for (let f = 2; f <= 50; f++)` → `for (let f = 2; f <= 71; f++)` in `getImpact.js`.

### Floor 71 threshold annotation
Add `71` to `THRESHOLD_FLOORS` and `'5e lift'` to `THRESHOLD_LABELS` in `co2MaterialChart.js`.
